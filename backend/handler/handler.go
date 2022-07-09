package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"athlete_data_input/config"
	"athlete_data_input/database"
	"athlete_data_input/model"

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

func ResisterUser(c echo.Context) error {
	cfg, err := config.Load()
	db := database.GetDB()
	json_map := make(map[string]interface{})
	err = json.NewDecoder(c.Request().Body).Decode(&json_map)
	if err != nil {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -1,
		})
	}
	sercret, ok := json_map["sercret"].(string)
	if ok != true {
		return c.JSON(http.StatusOK, echo.Map{
			"result": -2,
		})
	}
	if sercret == cfg.SercretKey {
		//resister user
		username, ok := json_map["username"].(string)
		if ok != true {
			return c.JSON(http.StatusOK, echo.Map{
				"result": -3,
			})
		}
		note, ok := json_map["note"].(string)
		if ok != true {
			return c.JSON(http.StatusOK, echo.Map{
				"result": -4,
			})
		}
		user := model.User{Username: username, Note: note}
		err := db.Debug().Model(model.User{}).Create(&user).Error
		if err != nil {
			return c.JSON(http.StatusOK, echo.Map{
				"result": -5,
			})
		}
		log.Println(user)
		return c.JSON(http.StatusOK, echo.Map{
			"result":  0,
			"user_id": user.ID,
		})

	}

	return c.JSON(http.StatusOK, echo.Map{
		"result": -6,
	})
	//events, ok := json_map["events"].([]interface{})
	//if ok != true {
	//	return c.JSON(http.StatusOK, echo.Map{
	//		"result": -1,
	//		"error":  "no events in post data",
	//	})
	//}
	//// it is need to deal with error when the length of array of events is zero
	//event, ok := events[0].(map[string]interface{})
	//if ok != true {
	//	return c.JSON(http.StatusOK, echo.Map{
	//		"result": -1,
	//		"error":  "the type of event is not valid",
	//	})
	//}
	//source, ok := event["source"].(map[string]interface{})
	//if ok != true {
	//	return c.JSON(http.StatusOK, echo.Map{
	//		"result": -1,
	//		"error":  "no source in event data",
	//	})
	//}
	//user_id, ok := source["userId"].(string)
	//log.Println(events)
	////get username from userId
	////Encrypt userId
	//return c.JSON(http.StatusOK, echo.Map{
	//	"result":  0,
	//	"user_id": user_id,
	//})
}

func SaveInputDatas(c echo.Context) error {
	//db := database.GetDB()
	return c.JSON(http.StatusOK, echo.Map{
		"result": 0,
	})
}

func GetUser(c echo.Context) error {
	//db := database.GetDB()
	return c.JSON(http.StatusOK, echo.Map{
		"result": 0,
	})
}

func GetUsers(c echo.Context) error {
	//db := database.GetDB()
	return c.JSON(http.StatusOK, echo.Map{
		"result": 0,
	})
}

func GetInputDatas(c echo.Context) error {
	//db := database.GetDB()
	return c.JSON(http.StatusOK, echo.Map{
		"result": 0,
	})
}
