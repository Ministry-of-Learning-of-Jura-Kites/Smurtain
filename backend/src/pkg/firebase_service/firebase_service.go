package firebase_service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go"
	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"google.golang.org/api/option"
)

var FirebaseApp *firebase.App
var FirestoreClient *firestore.Client

func ConnectToFirebase() {
	serviceAccountKeyFile := ""

	ctx := context.Background()
	opt := option.WithCredentialsFile(serviceAccountKeyFile)
	app, err := firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase App: %v", err)
	}

	FirebaseApp = app
	FirestoreClient, err = app.Firestore(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize Firestore client: %v", err)
	}

	log.Println("Connected to Cloud Firestore")
}

func SubscribeToTopics(server *mqtt.Server) {
	err := server.Subscribe("status/#", 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		message := string(pk.Payload)
		topic := pk.TopicName
		fmt.Println("Message received:", message, topic)

		insertDataToFirestore(topic, message)
	})
	if err != nil {
		log.Fatal(err)
	}
}

func insertDataToFirestore(topic string, message string) {
	ctx := context.Background()

	doc := map[string]interface{}{
		"topic":     topic,
		"message":   message,
		"timestamp": time.Now(),
	}

	_, _, err := FirestoreClient.Collection("smurtain").Add(ctx, doc)
	if err != nil {
		log.Printf("Failed to insert message into Firestore: %v", err)
	} else {
		log.Println("Message successfully inserted into Firestore")
	}
}

func GetDataFirestoreUsingMQTT(server *mqtt.Server) {
	requestTopic := "data/record/request"
	responseTopic := "data/record/response"

	err := server.Subscribe(requestTopic, 1, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		server.Log.Info("Data request received")

		ctx := context.Background()
		fiveMinutesAgo := time.Now().Add(-5 * time.Minute)

		iter := FirestoreClient.Collection("smurtain").Where("timestamp", ">=", fiveMinutesAgo).Documents(ctx)

		var results []map[string]interface{}
		for {
			doc, err := iter.Next()
			if err != nil {
				break
			}
			results = append(results, doc.Data())
		}

		responsePayload, err := json.Marshal(results)
		if err != nil {
			log.Printf("Error marshalling results: %v\n", err)
			return
		}

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
