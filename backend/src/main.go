package main

import (
	"smurtain.com/backend/src/api"
	_ "smurtain.com/backend/src/pkg/mqtt"

	"github.com/labstack/echo/v4"
)

func main() {
	e := echo.New()
	apiGroup := e.Group("/api")
	api.CreateRoutes(apiGroup)
	e.Logger.Fatal(e.Start(":8080"))
}
