package main

import (
	"github.com/ikala/ontix/cmd"
	"github.com/ikala/ontix/config"
)

var (
	VERSION string
	COMMIT  string
)

func main() {
	config.VERSION = VERSION
	config.COMMIT = COMMIT

	cmd.Execute()
}
