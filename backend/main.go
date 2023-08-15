package main

import (
	"log"
	"sketch_hit/config"
	"sketch_hit/database"
	"sketch_hit/router"
)

func main() {
	log.SetFlags(log.Flags() | log.Llongfile)
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	log.Println(cfg.Version)
	log.Println(cfg.Environment)

	database.Init()
	defer database.Close()
	router, _ := router.NewRouter()
	router.Logger.Fatal(router.Start(":1323"))
}
