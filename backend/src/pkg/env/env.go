package env

import (
	"log"
	"path/filepath"
	"runtime"

	"github.com/joho/godotenv"
)

var Env map[string]string

func init() {
	_, b, _, _ := runtime.Caller(0)

	projectRootPath := filepath.Join(filepath.Dir(b), "../../../..")
	log.Println(projectRootPath)
	env, err := godotenv.Read(projectRootPath + "/.env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	Env = env
	if _, ok := Env["GOOGLE_API_KEY"]; !ok {
		log.Fatal("GOOGLE_API_KEY not found")
	}

	if _, ok := Env["GOOGLE_CLIENT_ID"]; !ok {
		log.Fatal("GOOGLE_CLIENT_ID not found")
	}
}
