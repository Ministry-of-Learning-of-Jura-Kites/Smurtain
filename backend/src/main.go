package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	// "smurtain.com/backend/src/pkg/broker"
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

	// go func() {
	// 	err := broker.MqttServer.Serve()
	// 	if err != nil {
	// 		log.Fatal(err)
	// 	}
	// }()

	go func() {

		err := gmail_service.SendEmail(false)
		if err != nil {
			log.Fatal(err)
		}
		// err := broker.MqttServer.Subscribe("curtain_status", 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		// 	broker.MqttServer.Log.Info("received")
		// 	var isOn bool
		// 	message := string(pk.Payload)
		// 	if message == "on" {
		// 		isOn = true
		// 	} else if message == "off" {
		// 		isOn = false
		// 	}
		// 	err := gmail_service.SendEmail(isOn)
		// 	if err != nil {
		// 		log.Fatal(err)
		// 	}
		// })
		// if err != nil {
		// 	log.Fatal(err)
		// }
	}()

	<-done
}
