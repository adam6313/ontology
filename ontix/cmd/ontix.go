package cmd

import (
	"context"
	"log"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/repository"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/gemini"
	"github.com/ikala/ontix/internal/infra/postgres"
	redisinfra "github.com/ikala/ontix/internal/infra/redis"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var ontixCmd = func() *cobra.Command {
	cmd := &cobra.Command{
		Use: "ontix",
		Run: func(cmd *cobra.Command, args []string) {
			ontixFx()
		},
	}

	return cmd
}

func ontixFx() {
	app := fx.New(
		fx.NopLogger,
		fx.Supply(
			config.ConfigPath,
		),
		// Config
		fx.Provide(
			config.New,
		),

		// Services
		fx.Provide(
			gemini.New,
			func(c *gemini.Client) service.EmbeddingService { return c },
			func(c *gemini.Client) service.LLMService { return c },
		),

		// PostgreSQL
		fx.Provide(
			postgres.New,
			postgres.NewPostRepo,
			postgres.NewTagRepo,
			postgres.NewClusterRepo,
		),

		// Redis
		fx.Provide(
			redisinfra.New,
			redisinfra.NewCentroidRepo,
			redisinfra.NewPendingPool,
		),

		// TODO: Use Cases

		fx.Invoke(run),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}

	app.Run()
}

func run(
	lc fx.Lifecycle,
	shutdowner fx.Shutdowner,
	cfg *config.Config,
	geminiClient *gemini.Client,
	pgDB *postgres.DB,
	redisClient *redisinfra.Client,
	embedSvc service.EmbeddingService,
	llmSvc service.LLMService,
	postRepo repository.PostRepository,
	centroidRepo repository.CentroidRepository,
	pendingPool repository.PendingPool,
) {
	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			log.Println("Ontix started")
			log.Println("PostgreSQL connected")
			log.Println("Redis connected")
			log.Println("Gemini connected")
			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("Ontix stopped")
			geminiClient.Close()
			pgDB.Close()
			redisClient.Close()
			return nil
		},
	})
}
