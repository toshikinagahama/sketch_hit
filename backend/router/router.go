package router

import (
	"log"
	"sketch_hit/config"
	"sketch_hit/handler"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func NewRouter() (*echo.Echo, error) {
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}

	log.Println(cfg.StaticPath)

	router := echo.New()
	router.Use(middleware.Logger())
	router.Use(middleware.Recover())
	if cfg.Environment == 1 {
		//本番環境なら
	} else if cfg.Environment == 0 {
		//開発環境なら
		router.Use(middleware.CORS())
	}

	router.POST(cfg.BasePath+"/save_result", handler.SaveResult)

	return router, nil
}
