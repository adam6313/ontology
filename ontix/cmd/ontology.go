package cmd

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ikala/ontix/config"
	"github.com/ikala/ontix/internal/domain/service"
	"github.com/ikala/ontix/internal/infra/openai"
	"github.com/ikala/ontix/internal/infra/postgres"
	"github.com/spf13/cobra"
	"go.uber.org/fx"
)

var ontologyCmd = func() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "ontology",
		Short: "Ontology 推理引擎",
	}

	cmd.AddCommand(ontologyEvaluateCmd())
	return cmd
}

func ontologyEvaluateCmd() *cobra.Command {
	var periodStr string
	var periodType string
	var materialize bool
	var narrative bool

	cmd := &cobra.Command{
		Use:   "evaluate",
		Short: "執行推理引擎：計算 delta → 評估規則 → 產生事實",
		Run: func(cmd *cobra.Command, args []string) {
			ontologyEvaluateFx(periodStr, periodType, materialize, narrative)
		},
	}

	// 預設本週一
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	monday := now.AddDate(0, 0, -(weekday - 1))
	defaultPeriod := monday.Format("2006-01-02")

	cmd.Flags().StringVarP(&periodStr, "period", "p", defaultPeriod, "觀測期起始日（YYYY-MM-DD）")
	cmd.Flags().StringVarP(&periodType, "type", "t", "week", "觀測期類型（week/day）")
	cmd.Flags().BoolVar(&materialize, "materialize", false, "先執行觀測聚合（MaterializeObservations）")
	cmd.Flags().BoolVar(&narrative, "narrative", true, "生成 LLM 敘事洞察")
	return cmd
}

func ontologyEvaluateFx(periodStr, periodType string, materialize, narrative bool) {
	periodStart, err := time.Parse("2006-01-02", periodStr)
	if err != nil {
		log.Fatalf("Invalid period format: %v", err)
	}

	app := fx.New(
		fx.NopLogger,
		fx.Supply(config.ConfigPath),
		fx.Provide(
			config.New,
			postgres.New,
			postgres.NewObjectRepo,
			postgres.NewOntologySchemaRepo,
			postgres.NewObservationRepo,
			postgres.NewDerivedFactRepo,
			postgres.NewObjectRelationRepo,
			service.NewOntologyEngine,
			openai.New,
			func(c *openai.Client) service.NarrativeService { return c },
		),
		fx.Invoke(func(engine *service.OntologyEngine, narrativeSvc service.NarrativeService) {
			ctx := context.Background()

			if narrative {
				engine.SetNarrativeService(narrativeSvc)
			}

			fmt.Println("=== Ontix Ontology Engine ===")
			fmt.Printf("Period: %s (%s)\n", periodStart.Format("2006-01-02"), periodType)
			fmt.Printf("Materialize: %v\n", materialize)
			fmt.Printf("Narrative: %v\n\n", narrative)

			start := time.Now()

			var result *service.EvaluationResult
			var evalErr error

			if materialize {
				result, evalErr = engine.MaterializeAndEvaluate(ctx, periodStart, periodType)
			} else {
				result, evalErr = engine.EvaluatePeriod(ctx, periodStart, periodType)
			}
			if evalErr != nil {
				log.Fatalf("Evaluation failed: %v", evalErr)
			}

			elapsed := time.Since(start).Round(time.Millisecond)

			fmt.Printf("--- 結果 ---\n")
			fmt.Printf("觀測數: %d\n", result.Observations)
			fmt.Printf("Delta 數: %d\n", result.Deltas)
			fmt.Printf("規則檢查: %d\n", result.RulesChecked)
			fmt.Printf("產生事實: %d\n", result.FactsCreated)
			fmt.Printf("耗時: %s\n", elapsed)

			if len(result.Facts) > 0 {
				fmt.Println("\n--- 產生的事實 ---")
				for i, f := range result.Facts {
					icon := severityIcon(string(f.Severity))
					fmt.Printf("\n%s [%d] %s\n", icon, i+1, f.Title)
					fmt.Printf("   類型: %s | 嚴重度: %s\n", f.FactType, f.Severity)
					if f.Description != "" {
						fmt.Printf("   說明: %s\n", f.Description)
					}
					if src, ok := f.Evidence["source_object_name"]; ok {
						fmt.Printf("   來源: %s → %s (via %s)\n",
							src, f.Evidence["target_object_name"], f.Evidence["relation_slug"])
					}
				}
			} else {
				fmt.Println("\n本期無新事實產生")
			}

			// 顯示 narrative 結果
			if len(result.NarrativeFacts) > 0 {
				fmt.Println("\n--- 敘事洞察 ---")
				for _, nf := range result.NarrativeFacts {
					entityName := "unknown"
					if name, ok := nf.Evidence["entity_name"]; ok {
						entityName = fmt.Sprintf("%v", name)
					}
					fmt.Printf("\n📝 [%s] %s\n", entityName, nf.Title)
					fmt.Printf("   %s\n", nf.Description)
				}
			}
		}),
	)

	if err := app.Err(); err != nil {
		log.Fatal(err)
	}
}

func severityIcon(s string) string {
	switch s {
	case "critical":
		return "🔴"
	case "warning":
		return "🟡"
	default:
		return "🔵"
	}
}
