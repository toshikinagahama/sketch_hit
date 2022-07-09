package main

import (
	"athlete_data_input/config"
	"athlete_data_input/database"
	"athlete_data_input/router"
	"log"
)

func main() {
	log.SetFlags(log.Flags() | log.Llongfile)
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	log.Println(cfg.Version)

	database.Init()
	defer database.Close()
	router, _ := router.NewRouter()
	router.Logger.Fatal(router.Start(":1323"))
}
