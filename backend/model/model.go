package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt

	Type     string   `json:"type"`
	Username string   `json:"username"`
	Score    *float32 `json:"score" gorm:"type:real"`

	Results []Result
}

type Result struct {
	ID     uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	TaskID uuid.UUID `json:"task_id" gorm:"type:uuid"`
	Type   string    `json:"type"`
	Score  float32   `json:"score" gorm:"type:real"`

	ResultParams         []ResultParam
	ResultTimeSeriess    []ResultTimeSeries
	ResultRawTimeSeriess []ResultRawTimeSeries
}

type ResultParam struct {
	ID       uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ResultID uuid.UUID `json:"result_id" gorm:"type:uuid"`
	Key      string    `json:"key"`
	Value    float32   `json:"value" gorm:"type:real"`
}

type ResultTimeSeries struct {
	ID       uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ResultID uuid.UUID `json:"result_id" gorm:"type:uuid"`
	Index    uint      `json:"index"`
	Time     int       `json:"time"`
	X_target float32   `json:"x_target" gorm:"type:real"`
	Y_target float32   `json:"y_target" gorm:"type:real"`
	X        float32   `json:"x" gorm:"type:real"`
	Y        float32   `json:"y" gorm:"type:real"`
	Distance float32   `json:"distance" gorm:"type:real"`
	Pressure float32   `json:"pressure" gorm:"type:real"`
	Altitude float32   `json:"altitude" gorm:"type:real"`
	Azimuth  float32   `json:"azimuth" gorm:"type:real"`
}

type ResultRawTimeSeries struct {
	ID       uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	ResultID uuid.UUID `json:"result_id" gorm:"type:uuid"`
	Index    uint      `json:"index"`
	Time     int       `json:"time"`
	X        float32   `json:"x" gorm:"type:real"`
	Y        float32   `json:"y" gorm:"type:real"`
	Pressure float32   `json:"pressure" gorm:"type:real"`
	Altitude float32   `json:"altitude" gorm:"type:real"`
	Azimuth  float32   `json:"azimuth" gorm:"type:real"`
}
