package api

import (
	"github.com/labstack/echo/v4"
	"smurtain.com/backend/src/api/routes"
)

func CreateRoutes(group *echo.Group) {
	group.GET("/temperature", routes.GetTemperature)
}
