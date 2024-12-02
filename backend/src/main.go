package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	// "smurtain.com/backend/src/pkg/broker"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"smurtain.com/backend/src/pkg/broker"
)

func printMessage(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
	log.Println("Message from request:", string(pk.Payload), "from topic:", pk.TopicName)
}

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
		broker.MqttServer.Subscribe("request", 1, printMessage)
		broker.MqttServer.Subscribe("status/#", 4, printMessage)
	}()
	<-done
}
