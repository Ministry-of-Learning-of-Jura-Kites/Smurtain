package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"smurtain.com/backend/src/pkg/broker"
	_ "smurtain.com/backend/src/pkg/broker"
)

func main() {
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigs
		done <- true
	}()

	go func() {
		err := broker.MqttServer.Serve()
		if err != nil {
			log.Fatal(err)
		}
	}()

	<-done
}
