package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"smurtain.com/backend/src/pkg/broker"
	_ "smurtain.com/backend/src/pkg/broker"
	"smurtain.com/backend/src/pkg/gmail_service"
)

func main() {
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-sigs
		done <- true
	}()

	broker.MqttServer.Subscribe("curtain_status", 0, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		var isOn bool
		message := string(pk.Payload)
		if message == "on" {
			isOn = true
		} else if message == "off" {
			isOn = false
		}
		gmail_service.SendEmail(isOn)
	})

	go func() {
		err := broker.MqttServer.Serve()
		if err != nil {
			log.Fatal(err)
		}
	}()

	<-done
}
