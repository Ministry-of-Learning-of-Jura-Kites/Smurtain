package routes

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"

	"github.com/labstack/echo/v4"
	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"smurtain.com/backend/src/pkg/broker"
)

func GetTemperature(c echo.Context) error {
	err := broker.MqttServer.Publish("request", []byte("temperature"), false, 0)
	if err != nil {
		log.Fatal(err)
	}
	wg := sync.WaitGroup{}
	var data float64
	wg.Add(1)
	broker.MqttServer.Subscribe("temperature", 0, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		defer wg.Done()
		data, err = strconv.ParseFloat(string(pk.Payload[:]), 32)
	})
	wg.Wait()
	if err != nil {
		return c.String(http.StatusInternalServerError, "")
	}
	return c.String(http.StatusOK, fmt.Sprintf("%f", data))
}
