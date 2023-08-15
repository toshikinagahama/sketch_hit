package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"sketch_hit/database"
	"sketch_hit/model"

	"github.com/google/uuid"
	"github.com/labstack/echo"
)

func Contains(s []uuid.UUID, e uuid.UUID) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}

func SaveResult(c echo.Context) error {
	db := database.GetDB()

	json_map := make(map[string]interface{})
	err := json.NewDecoder(c.Request().Body).Decode(&json_map)
	if err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -1,
		})
	}

	task, ok := json_map["task"].(map[string]interface{})
	if !ok {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}
	results, ok := json_map["results"].([]interface{})
	if !ok {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -3,
		})
	}

	results_time_series, ok := json_map["results_time_series"].([]interface{})
	if !ok {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -4,
		})
	}

	results_raw_time_series, is_ok_raw_time_series := json_map["results_raw_time_series"].([]interface{})

	//log.Println(results)
	//log.Println(results_time_series)
	//log.Println(task)
	//登録処理
	task_ := model.Task{
		Type:     task["type"].(string),
		Username: task["username"].(string),
	}

	err = db.Debug().Create(&task_).Error
	if err != nil {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -5,
		})
	}
	log.Println(task_.ID)
	for i := 0; i < len(results); i++ {
		result := results[i].(map[string]interface{})
		result_time_series := results_time_series[i].([]interface{})
		if len(result_time_series) == 0 {
			continue
		}
		log.Println(i, result)
		result_type := result["type"].(string)
		score, _ := result["score"].(float64)
		result_ := model.Result{
			TaskID: task_.ID,
			Type:   result_type,
			Score:  (float32)(score),
		}

		err = db.Debug().Create(&result_).Error
		if err != nil {
			return c.JSON(http.StatusOK, echo.Map{
				"result": -5,
			})
		}

		if result_type == "circle" {
			//円の場合
			result_param_ := model.ResultParam{
				ResultID: result_.ID,
				Key:      "x",
				Value:    (float32)(result["x"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "y",
				Value:    (float32)(result["y"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "r",
				Value:    (float32)(result["r"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}
		}

		if result_type == "line" {
			//線の場合
			result_param_ := model.ResultParam{
				ResultID: result_.ID,
				Key:      "x",
				Value:    (float32)(result["x"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "y",
				Value:    (float32)(result["y"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "l",
				Value:    (float32)(result["l"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "a",
				Value:    (float32)(result["a"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}
		}

		if result_type == "ellipse" {
			//楕円の場合
			result_param_ := model.ResultParam{
				ResultID: result_.ID,
				Key:      "x",
				Value:    (float32)(result["x"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "y",
				Value:    (float32)(result["y"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "r_l",
				Value:    (float32)(result["r_l"].(float64)),
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "r_s",
				Value:    (float32)(result["r_s"].(float64)),
			}

			result_param_ = model.ResultParam{
				ResultID: result_.ID,
				Key:      "a",
				Value:    (float32)(result["a"].(float64)),
			}

			err = db.Debug().Create(&result_param_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -6,
				})
			}
		}

		for i := 0; i < len(result_time_series); i++ {
			result_ts := result_time_series[i].(map[string]interface{})
			//log.Println(result_ts)
			result_ts_ := model.ResultTimeSeries{
				ResultID: result_.ID,
				Index:    (uint)(result_ts["index"].(float64)),
				Time:     (int)(result_ts["t"].(float64)),
				X_target: (float32)(result_ts["x_target"].(float64)),
				Y_target: (float32)(result_ts["y_target"].(float64)),
				X:        (float32)(result_ts["x"].(float64)),
				Y:        (float32)(result_ts["y"].(float64)),
				Distance: (float32)(result_ts["d"].(float64)),
				Pressure: (float32)(result_ts["f"].(float64)),
				Altitude: (float32)(result_ts["altitude"].(float64)),
				Azimuth:  (float32)(result_ts["azimuth"].(float64)),
			}
			err = db.Debug().Create(&result_ts_).Error
			if err != nil {
				return c.JSON(http.StatusOK, echo.Map{
					"result": -7,
				})
			}
		}

		if is_ok_raw_time_series {
			result_raw_time_series := results_raw_time_series[i].([]interface{})
			for i := 0; i < len(result_raw_time_series); i++ {
				result_raw_ts := result_raw_time_series[i].(map[string]interface{})
				//log.Println(result_raw_ts)
				result_raw_ts_ := model.ResultRawTimeSeries{
					ResultID: result_.ID,
					Index:    (uint)(result_raw_ts["index"].(float64)),
					Time:     (int)(result_raw_ts["t"].(float64)),
					X:        (float32)(result_raw_ts["x"].(float64)),
					Y:        (float32)(result_raw_ts["y"].(float64)),
					Pressure: (float32)(result_raw_ts["f"].(float64)),
					Altitude: (float32)(result_raw_ts["altitude"].(float64)),
					Azimuth:  (float32)(result_raw_ts["azimuth"].(float64)),
				}
				err = db.Debug().Create(&result_raw_ts_).Error
				if err != nil {
					return c.JSON(http.StatusOK, echo.Map{
						"result": -8,
					})
				}
			}
		}

	}
	return c.JSON(http.StatusOK, echo.Map{
		"result": 0,
		"task":   task_,
	})
}

func GetResults(c echo.Context) error {
	db := database.GetDB()

	score_max := c.QueryParam("score_max")
	score_min := c.QueryParam("score_min")
	log.Println(score_max, score_min)
	if score_max == "" || score_min == "" {
		var results []model.Result
		err := db.Find(&results).Error
		if err != nil {
			log.Println(err)
			return c.JSON(http.StatusOK, echo.Map{
				"result": -2,
			})
		}

		return c.JSON(http.StatusOK, echo.Map{
			"result":  0,
			"results": results,
		})
	} else {
		var results []model.Result

		if err := db.Find(&results, "score >= ? AND score <= ?", score_min, score_max).Error; err != nil {
			log.Println(err)
			return c.JSON(http.StatusOK, echo.Map{
				"result": -3,
			})
		}

		return c.JSON(http.StatusOK, echo.Map{
			"result":  0,
			"results": results,
		})

	}
}

func GetTasks(c echo.Context) error {
	db := database.GetDB()

	var tasks []model.Task
	if err := db.Find(&tasks).Error; err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"result":  0,
		"results": tasks,
	})
}

func GetResultTimeSeries(c echo.Context) error {
	db := database.GetDB()

	type Payload struct {
		IDs []uuid.UUID `json:"ids"`
	}
	payload := Payload{}
	if err := c.Bind(&payload); err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -1,
		})

	}

	var result model.Result
	if err := db.Preload("ResultTimeSeriess").Find(&result, payload.IDs).Error; err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"result":  0,
		"results": result.ResultTimeSeriess,
	})
}

func GetResultRawTimeSeries(c echo.Context) error {
	db := database.GetDB()

	type Payload struct {
		IDs []uuid.UUID `json:"ids"`
	}
	payload := Payload{}
	if err := c.Bind(&payload); err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -1,
		})

	}

	var result model.Result
	if err := db.Preload("ResultRawTimeSeriess").Find(&result, payload.IDs).Error; err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"result":  0,
		"results": result.ResultRawTimeSeriess,
	})
}

func GetResultParam(c echo.Context) error {
	db := database.GetDB()

	type Payload struct {
		IDs []uuid.UUID
	}
	payload := Payload{}
	if err := c.Bind(&payload); err != nil {
		return err
	}

	var result model.Result
	if err := db.Preload("ResultParams").Find(&result, payload.IDs).Error; err != nil {
		log.Println(err)
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"result":  0,
		"results": result.ResultParams,
	})
}
