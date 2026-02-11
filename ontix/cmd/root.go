package cmd

import (
	"fmt"
	"os"

	"github.com/ikala/ontix/config"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(2)
	}
}

func init() {
	rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
	rootCmd.PersistentFlags().StringVar(&config.ConfigPath, "config", "./config/dev.yaml", "config file")

	rootCmd.AddCommand(ontixCmd())
	rootCmd.AddCommand(versionCmd())
	rootCmd.AddCommand(tagCmd())
	rootCmd.AddCommand(searchCmd())
	rootCmd.AddCommand(clusterCmd())
	rootCmd.AddCommand(subclusterCmd())
	rootCmd.AddCommand(serveCmd())
	rootCmd.AddCommand(workerCmd())
	rootCmd.AddCommand(pushCmd())
	rootCmd.AddCommand(entityCmd())
	rootCmd.AddCommand(refreshCmd())
	rootCmd.AddCommand(ontologyCmd())
}
