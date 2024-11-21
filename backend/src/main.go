package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"smurtain.com/backend/src/api"
	"smurtain.com/backend/src/pkg/broker"
	_ "smurtain.com/backend/src/pkg/broker"

	"github.com/labstack/echo/v4"
)

func main() {
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		done <- true
	}()

	e := echo.New()
	apiGroup := e.Group("/api")
	api.CreateRoutes(apiGroup)

	go func() {
		e.Logger.Fatal(e.Start(":8080"))
	}()

	go func() {
		err := broker.MqttServer.Serve()
		if err != nil {
			log.Fatal(err)
		}
	}()

	<-done
}
