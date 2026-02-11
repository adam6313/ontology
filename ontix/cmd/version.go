package cmd

import (
	"fmt"

	"github.com/ikala/ontix/config"
	"github.com/spf13/cobra"
)

var versionCmd = func() *cobra.Command {
	cmd := &cobra.Command{
		Use: "version",
		Run: func(cmd *cobra.Command, args []string) {
			version()
		},
	}

	return cmd
}

func version() {
	fmt.Println("Version:", config.VERSION)
	fmt.Println("Commit:", config.COMMIT)
}
