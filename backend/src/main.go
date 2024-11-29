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

func main() {
	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// isCurtainOn := false

	go func() {
		<-sigs
		done <- true
	}()

	go func() {
		err := broker.MqttServer.Serve()
		if err != nil {
			log.Fatal(err)
		}
		broker.MqttServer.Subscribe("request", 2, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
			log.Println("Message from request:", string(pk.Payload))
		})
	}()

	go func() {
		// err := broker.MqttServer.Subscribe("status/curtain_status", 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		// 	broker.MqttServer.Log.Info("received")
		// 	var newIsCurtainOn bool
		// 	message := string(pk.Payload)
		// 	if message == "on" {
		// 		newIsCurtainOn = true
		// 	} else if message == "off" {
		// 		newIsCurtainOn = false
		// 	}
		// 	if isCurtainOn != newIsCurtainOn {
		// 		err := gmail_service.SendEmail(newIsCurtainOn)
		// 		if err != nil {
		// 			log.Fatal(err)
		// 		}
		// 	}
		// 	isCurtainOn = newIsCurtainOn
		// })
		// if err != nil {
		// 	log.Fatal(err)
		// }
	}()

	<-done
}
