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
		// 本番環境なら
		router.Static(cfg.BasePath+"/web", cfg.StaticPath)
		router.File(cfg.BasePath+"/web", cfg.StaticPath+"/index.html")
		router.File(cfg.BasePath+"/web/select_task", cfg.StaticPath+"/select_task.html")
		router.File(cfg.BasePath+"/web/do_task/*", cfg.StaticPath+"/do_task/[id].html")
		router.File(cfg.BasePath+"/web/select_results", cfg.StaticPath+"/select_results.html")
		router.File(cfg.BasePath+"/web/create_room", cfg.StaticPath+"/create_room.html")
		router.File(cfg.BasePath+"/web/result/*", cfg.StaticPath+"/result/[id].html")
	} else if cfg.Environment == 0 {
		// 開発環境なら
		router.Use(middleware.CORS())
	}

	router.POST(cfg.BasePath+"/backend/save_result", handler.SaveResult)
	router.GET(cfg.BasePath+"/backend/api/get_results", handler.GetResults)
	router.GET(cfg.BasePath+"/backend/api/get_tasks", handler.GetTasks)
	router.POST(cfg.BasePath+"/backend/api/get_result_timeseries", handler.GetResultTimeSeries)
	router.POST(cfg.BasePath+"/backend/api/get_result_raw_timeseries", handler.GetResultRawTimeSeries)
	router.POST(cfg.BasePath+"/backend/api/get_result_param", handler.GetResultParam)

	return router, nil
}
