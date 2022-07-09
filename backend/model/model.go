package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt

	Username string `json:"username"`
	Note     string `json:"note"`

	InputDatas []InputData
}

type InputData struct {
	ID     uuid.UUID `gorm:"primaryKey;type:uuid;default:uuid_generate_v4()"`
	UserID uuid.UUID `json:"user_id" gorm:"type:uuid"`
	Key    string    `json:"key"`
	Value  string    `json:"value"`
}
