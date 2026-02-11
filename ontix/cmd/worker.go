package cmd

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/entity"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/mlservice"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
	"github.com/ikala/ontix/internal/worker"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var workerCmd = func() *cobra.Command {
	var batchSize int
	var timeout int
	var concurrency int

	cmd := &cobra.Command{
		Use:   "worker",
		Short: "Start Stream Worker (consume queue)",
		Run: func(cmd *cobra.Command, args []string) {
			runWorker(batchSize, time.Duration(timeout)*time.Second, concurrency)
		},
	}

	cmd.Flags().IntVarP(&batchSize, "batch", "b", 1, "Batch size")
	cmd.Flags().IntVarP(&timeout, "timeout", "t", 1, "Wait timeout in seconds (min 1 for graceful shutdown)")
	cmd.Flags().IntVarP(&concurrency, "concurrency", "c", 1, "Number of concurrent workers")
	return cmd
}

func runWorker(batchSize int, timeout time.Duration, concurrency int) {
	// Ensure minimum timeout for graceful shutdown
	if timeout < time.Second {
		timeout = time.Second
	}
	if concurrency < 1 {
		concurrency = 1
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Listen for interrupt signals
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		log.Println("Shutting down...")
		cancel()
	}()

	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			openai.New,
			func(c *openai.Client) service.EmbeddingService { return c },
			func(c *openai.Client) service.LLMService { return c },
			func(c *openai.Client) service.TaggingService { return c }, // 全量 LLM 智能標註
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
			postgres.NewClusterRepo,
			postgres.NewTopicRepo,
			postgres.NewPostAnalysisRepo, // 分析結果儲存
			postgres.NewObjectRepo,      // Ontology Entity 儲存
			// Ontology Phase 1
			postgres.NewOntologySchemaRepo,
			postgres.NewObservationRepo,
			postgres.NewDerivedFactRepo,
			postgres.NewObjectRelationRepo,
			redis.New,
			redis.NewStreamRepo,
			redis.NewCentroidRepo,
			service.NewAssigner,
			// 構建 LLMClassifier
			func(cfg *config.Config, topicRepo repository.TopicRepository) *service.LLMClassifier {
				topics, _ := topicRepo.FindAll(context.Background())
				return service.NewLLMClassifier(cfg.OpenAIAPIKey, "gpt-4o-mini", topics)
			},
			// 構建 ColdStartRepo
			func(client *redis.Client) repository.ColdStartRepository {
				return redis.NewColdStartRepo(client, entity.DefaultColdStartConfig())
			},
			// 構建 ClusteringService (ML Service)
			mlservice.New,
			mlservice.NewClusteringAdapter,
			// 構建 ColdStartService
			func(
				coldStartRepo repository.ColdStartRepository,
				centroidRepo repository.CentroidRepository,
				postRepo repository.PostRepository,
				clusteringSvc service.ClusteringService,
			) *service.ColdStartService {
				return service.NewColdStartService(
					coldStartRepo,
					centroidRepo,
					postRepo,
					clusteringSvc,
					entity.DefaultColdStartConfig(),
				)
			},
			// 構建 SubClusterService (KNN 分配)
			func(
				coldStartRepo repository.ColdStartRepository,
				centroidRepo repository.CentroidRepository,
				postRepo repository.PostRepository,
			) *service.SubClusterService {
				return service.NewSubClusterService(
					coldStartRepo,
					centroidRepo,
					postRepo,
				)
			},
			// 構建 EntityExtractor (Ontology Entity 抽取)
			func(c *openai.Client) service.EntityExtractionService { return c },
			service.NewEntityExtractor,
			// Narrative
			func(c *openai.Client) service.NarrativeService { return c },
			// Ontology 推理引擎
			service.NewOntologyEngine,
			worker.NewStreamWorker,
		),
		fx.Invoke(func(
			w *worker.StreamWorker,
			db *postgres.DB,
			llmClassifier *service.LLMClassifier,
			coldStartSvc *service.ColdStartService,
			subClusterSvc *service.SubClusterService,
			taggingSvc service.TaggingService,
			analysisRepo repository.PostAnalysisRepository,
			entityExtractor *service.EntityExtractor,
			ontologyEngine *service.OntologyEngine,
			narrativeSvc service.NarrativeService,
		) {
			ontologyEngine.SetNarrativeService(narrativeSvc)
			w.SetBatchSize(batchSize)
			w.SetBatchTimeout(timeout)
			w.SetConcurrency(concurrency)
			w.SetColdStartService(coldStartSvc)
			w.SetSubClusterService(subClusterSvc)
			w.SetTaggingService(taggingSvc)
			w.SetAnalysisRepo(analysisRepo)
			w.SetEntityExtractor(entityExtractor)
			w.SetOntologyEngine(ontologyEngine)
			w.SetDB(db)

			topicCount := len(llmClassifier.GetTopics())
			log.Println("=== Ontix Stream Worker ===")
			log.Printf("Batch size: %d", batchSize)
			log.Printf("Concurrency: %d", concurrency)
			log.Printf("Timeout: %s", timeout)
			log.Printf("LLM Classification: %d topics (gpt-4o-mini)", topicCount)
			log.Printf("Cold Start: enabled (trigger: %d/%d+24h/%d+7d)", entity.DefaultColdStartConfig().MinCountIdeal, entity.DefaultColdStartConfig().MinCountAcceptable, entity.DefaultColdStartConfig().MinCountFallback)
			log.Println("Sub-cluster: KNN assignment enabled")
			log.Println("Full LLM Tagging: enabled (sentiment, soft_tags, aspects)")
			log.Println("Entity Extraction: enabled (Ontology)")
			log.Println("Materialized Views: auto-refresh every 10 min")
			log.Println("Ontology Engine: evaluate every 1 hour")

			if err := w.Run(ctx); err != nil && err != context.Canceled {
				log.Fatalf("Worker error: %v", err)
			}
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}
