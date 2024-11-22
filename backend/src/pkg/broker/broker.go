package broker

import (
	"log"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/hooks/auth"
	"github.com/mochi-mqtt/server/v2/listeners"
)

var MqttServer *mqtt.Server

func init() {
	MqttServer = mqtt.New(&mqtt.Options{
		InlineClient: true,
	})

	_ = MqttServer.AddHook(new(auth.AllowHook), nil)

	tcp := listeners.NewTCP(listeners.Config{ID: "t1", Address: ":1883"})
	ws := listeners.NewWebsocket(listeners.Config{ID: "ws1", Address: ":1884"})
	err := MqttServer.AddListener(tcp)
	if err != nil {
		log.Fatal(err)
	}
	err = MqttServer.AddListener(ws)
	if err != nil {
		log.Fatal(err)
	}
}
