package broker

import (
	"log"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/hooks/auth"
	"github.com/mochi-mqtt/server/v2/listeners"
	"smurtain.com/backend/src/pkg/firebase_service"
	"smurtain.com/backend/src/pkg/gmail_service"
	"smurtain.com/backend/src/pkg/mongo_service"
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
	mongo_service.ConnectToMongoDB()
	mongo_service.SubscribeToTopics(MqttServer)
	mongo_service.GetDataMongoUsingMQTT(MqttServer)
	firebase_service.ConnectToFirebase()
	firebase_service.SubscribeToTopics(MqttServer)
	firebase_service.GetDataFirestoreUsingMQTT(MqttServer)
	gmail_service.SubscribeToTopics(MqttServer)
}
