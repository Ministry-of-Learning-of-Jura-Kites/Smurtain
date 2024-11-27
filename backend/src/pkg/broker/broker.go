package broker

import (
	"context"
	"fmt"
	"log"
	"time"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/hooks/auth"
	"github.com/mochi-mqtt/server/v2/listeners"
	"github.com/mochi-mqtt/server/v2/packets"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	MqttServer  *mqtt.Server
	MongoClient *mongo.Client
)

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

	connectToMongoDB()
	subscribeToTopics()
}

func connectToMongoDB() {

	mongoURI := "mongodb+srv://sirawitv:Smurtain@smurtain.fjgsc.mongodb.net/"
	clientOptions := options.Client().ApplyURI(mongoURI)

	var err error
	MongoClient, err = mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Check connection
	err = MongoClient.Ping(context.Background(), nil)
	if err != nil {
		log.Fatal("MongoDB connection ping failed:", err)
	}

	log.Println("Connected to MongoDB")
}

func subscribeToTopics() {
	err := MqttServer.Subscribe("status/#", 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		MqttServer.Log.Info("received")
		message := string(pk.Payload)
		topic := pk.TopicName
		fmt.Println("Message received:", message, topic)

		insertDataToMongo(topic, message)

	})
	if err != nil {
		log.Fatal(err)
	}
}

func insertDataToMongo(topic string, message string) {
	collection := MongoClient.Database("smurtain").Collection("smurtain")

	// Create a document to insert
	doc := map[string]interface{}{
		"topic":     topic,
		"message":   message,
		"timestamp": time.Now(),
	}

	// Insert the document
	_, err := collection.InsertOne(context.Background(), doc)
	if err != nil {
		log.Printf("Failed to insert message into MongoDB: %v\n", err)
	} else {
		log.Println("Message successfully inserted into MongoDB")
	}
}
