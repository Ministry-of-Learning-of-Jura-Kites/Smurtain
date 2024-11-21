package routes

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"smurtain.com/backend/src/pkg/mqtt"
)

func GetTemperature(c echo.Context) error {
	mqtt.MqttServer.Publish("request", []byte("temperature"), false, 1)
	// mqtt.MqttServer.Subscribe("temperature",0,func(){

	// })
	return c.String(http.StatusOK, "")
}
