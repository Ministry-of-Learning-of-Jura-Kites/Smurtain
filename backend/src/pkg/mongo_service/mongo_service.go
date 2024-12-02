package mongo_service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

func ConnectToMongoDB() {
	log.Println("connecting to mongo...")
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

func SubscribeToTopics(server *mqtt.Server) {
	err := server.Subscribe("status/#", 3, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		message := string(pk.Payload)
		topic := pk.TopicName
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
func GetDataMongoUsingMQTT(server *mqtt.Server) {
	requestTopic := "data/record/request"
	responseTopic := "data/record/response"

	err := server.Subscribe(requestTopic, 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		server.Log.Info("Data request received")

		// Parse any payload data if required
		fiveMinutesAgo := time.Now().Add(-5 * time.Minute)

		collection := MongoClient.Database("smurtain").Collection("smurtain")
		filter := bson.M{
			"timestamp": bson.M{
				"$gte": fiveMinutesAgo,
			},
		}

		var results []bson.D
		cursor, err := collection.Find(context.TODO(), filter)
		if err != nil {
			log.Printf("Error querying MongoDB: %v\n", err)
			return
		}

		if err = cursor.All(context.TODO(), &results); err != nil {
			log.Printf("Error parsing MongoDB cursor: %v\n", err)
			return
		}

		// Serialize results (e.g., JSON format)
		responsePayload, err := json.Marshal(results)
		fmt.Println(string(responsePayload))
		if err != nil {
			log.Printf("Error marshalling results: %v\n", err)
			return
		}

		// Publish results to the response topic
		err = server.Publish(responseTopic, responsePayload, false, 1)
		if err != nil {
			log.Printf("Failed to publish response: %v\n", err)
		} else {
			log.Println("Query results successfully published to response topic")
		}
	})

	if err != nil {
		log.Fatalf("Failed to subscribe to request topic: %v\n", err)
	}
}
