package database

import (
	"fmt"
	"sketch_hit/config"
	"sketch_hit/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func Init() {
	// db, err = gorm.Open(sqlite.Open("chat.sqlite3"), &gorm.Config{})
	cfg, err := config.Load()
	if err != nil {
		panic(err)
	}
	var dsn = fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%d sslmode=disable TimeZone=Asia/Tokyo", cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBHost, cfg.DBPort)
	db, err = gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // disables implicit prepared statement usage
	}), &gorm.Config{})
	if err != nil {
		panic(err)
	}

	//Enable to use uuid
	db.Exec(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`)

	//Migrate
	db.AutoMigrate(&model.Task{})
	db.AutoMigrate(&model.Result{})
	db.AutoMigrate(&model.ResultParam{})
	db.AutoMigrate(&model.ResultTimeSeries{})
	db.AutoMigrate(&model.ResultRawTimeSeries{})

	//Insert sample data
	{
	}
}

func GetDB() *gorm.DB {
	return db
}

func Close() {
	db_v2, _ := db.DB()
	if err := db_v2.Close(); err != nil {
		panic(err)
	}
}
