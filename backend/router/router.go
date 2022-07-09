package router

import (
	"athlete_data_input/config"
	"athlete_data_input/handler"
	"log"

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
		router.Static(cfg.BasePath+"/web", cfg.StaticPath)
		router.File(cfg.BasePath+"/web", cfg.StaticPath+"/index.html")
	} else if cfg.Environment == 0 {
		//開発環境なら
		router.Use(middleware.CORS())
	}

	router.POST(cfg.BasePath+"/backend/resister_user", handler.ResisterUser)
	router.POST(cfg.BasePath+"/backend/save_input_datas", handler.SaveInputDatas)
	router.POST(cfg.BasePath+"/backend/api/get_user", handler.GetUser)
	router.POST(cfg.BasePath+"/backend/api/get_users", handler.GetUsers)
	router.POST(cfg.BasePath+"/backend/api/get_input_datas", handler.GetInputDatas)

	return router, nil
}
