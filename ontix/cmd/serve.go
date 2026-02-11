package cmd

import (
	"fmt"
	"log"

	"github.com/ikala/ontix/config"
	httpserver "github.com/ikala/ontix/internal/api/http"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/ikala/ontix/internal/infra/redis"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var serveCmd = func() *cobra.Command {
	var port int

	cmd := &cobra.Command{
		Use:   "serve",
		Short: "Start HTTP server (ingest posts)",
		Run: func(cmd *cobra.Command, args []string) {
			runServer(port)
		},
	}

	cmd.Flags().IntVarP(&port, "port", "p", 8080, "HTTP port")
	return cmd
}

func runServer(port int) {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			// OpenAI
			openai.New,
			func(c *openai.Client) service.EmbeddingService { return c },
			// PostgreSQL
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
			postgres.NewTopicRepo,
			postgres.NewPostAnalysisRepo,
			postgres.NewObjectRepo,
			// Ontology Phase 1
			postgres.NewOntologySchemaRepo,
			postgres.NewObservationRepo,
			postgres.NewDerivedFactRepo,
			postgres.NewObjectRelationRepo,
			// Narrative
			func(c *openai.Client) service.NarrativeService { return c },
			// Entity Summary
			func(c *openai.Client) service.EntitySummaryService { return c },
			// Redis
			redis.New,
			redis.NewStreamRepo,
			// HTTP Server
			httpserver.NewServer,
		),
		fx.Invoke(func(server *httpserver.Server) {
			addr := fmt.Sprintf(":%d", port)
			log.Printf("HTTP server starting on %s", addr)
			log.Printf("  POST /api/posts     - Ingest posts")
			log.Printf("  GET  /api/health    - Health check")
			log.Printf("  GET  /api/queue/len - Queue length")
			log.Printf("  GET  /api/search    - Semantic search")
			log.Printf("  GET  /api/dashboard - Dashboard data")
			log.Printf("  GET  /api/entities  - Entity list (Ontology)")
			log.Printf("  GET  /api/entities/:id          - Entity detail")
			log.Printf("  GET  /api/entities/:id/aspects  - Aspect analysis")
			log.Printf("  GET  /api/entities/:id/mentions - Post mentions")
			log.Printf("  GET  /api/entities/:id/links    - Entity links")
			log.Printf("  GET  /api/entities/:id/observations - Observation trend")
			log.Printf("  GET  /api/entities/:id/summary      - AI insight summary")
			log.Printf("  GET  /api/entity-types          - Entity types")
			log.Printf("  GET  /api/graph                 - Entity graph (nodes+edges)")
			log.Printf("  GET  /api/inbox                 - Inbox facts")
			log.Printf("  GET  /api/inbox/count           - Unread count")
			log.Printf("  PATCH /api/inbox/:id/read       - Mark fact read")
			log.Printf("  PATCH /api/inbox/:id/dismiss    - Dismiss fact")
			log.Printf("  GET  /api/entities/:id/facts    - Entity facts")

			if err := server.Run(addr); err != nil {
				log.Fatalf("Server error: %v", err)
			}
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}
