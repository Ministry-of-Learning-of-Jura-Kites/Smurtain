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
	// serviceAccountKeyFile := "../smurtain-firebase-adminsdk-so189-2e9b78bd1c.json"
	serviceAccountJSON := []byte(`{
       	"type": "service_account",
		"project_id": "smurtain",
		"private_key_id": "2e9b78bd1cc1f992da02724ba88d1547eed6765d",
		"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCY/yMLTXHqxUkp\nAYo0QKwrvm84rQWbLOnk4J/IWlKP2qNDgjWkR7TOlbN4ZKB3HxNW0z61+W3FdqVz\nNaNW7RaVwJJx4j6o3rx/Rn4/JapHeSWIUH2PeM6i1E4dJvtE+I4fMDE5V5w4chnR\n/KAOVyCqTgxKrE5WYwIVZ5gWcltahjDwPQLQOrAK+ngNya/sBp/Lcsta81/ouvxJ\nDdECp2LpRWhFsdxH/5dgA4WNjnfbWjNre01wC65Iaz3ZbxFHVA1kFkFocJ8KF2/g\nuf/9G0j/Ehp7ZfhMbmOFdEjb7hGqNaOgtlR4ru4HHZlvLa6EIw/oDbJddi8sbzMj\n1t0lE2hZAgMBAAECggEAC1PrT/1A76VXIF5z0XXvCXdvxrN7fxzD3eVfueGDdrvf\nwLIrBJR755vKjkxtBm+E6rXN+9fm78A0HyPxNGYYzlJUGsh/OS5HUz5wlH5WbYpO\nZBm0N4418R+6VOA7qcSkHoez7U9LoBuam83nj92VlpEcHzSYwZP9EIFQumtnJibn\nYwCcEHf2X2iQmk39PT4aU96VkhbcxqxCEsgYHlZRONTAWnYIYfHMLOdXA03tpD8Z\nRpHOxO0wjwEHZNPKoBC4xIiyKlQ5ftGVg9b7B786jasH/ThLkdGHtBJwz3cgHBej\n69znQ2kGHXxghAgCyt21GD9mxp2pMR8VbFzN2YaK3QKBgQDJlRlZuJpOTAwIR24K\nN8uo9x2a2ivIOG41/TZU0fsDWQo4sA87BOantCuAdzZukQ8vcOaQBUNQyf8vLFSU\n1kaXhTHBH2L2lI7/cYE8OT0kU0xXohC7FyAIaJT5HAI1iCeZy974vGIxrDIqydmA\nm3dNVAn0SQs2JJHRJJR/O6072wKBgQDCTGKCbx2aUXGpvszI5igZdTJqjeBBWR/E\niRpIPFzWWWq6ksiWvzFN3DsjoqqABZ2bcoNvWV/p6HzZPWMcM2Uru2WmuiVtEZra\nDSvGhd0Ae/7dDnaF4qV8G4u2tA3byZM3fk9A2PepdVxVom88aACvZOkdsbOzgcq2\nffjmFKPc2wKBgAPlqQbOBdWrrLPgRaVW7M4IcP8UZrJJPQA4M/uxz4uCBiuQY8r9\nTkRBvHGQXHIIxeVh5mM0ZtfB//f2gHAcMGMvhQW5yJ0BxD32AMycQq1YGuq6zF4B\nlXH0K6UhQH2ucy2K/nWKls9lB9dB7b2Jw+Wv0T1yyA+050jGz0QicDfvAoGAGsY5\n4O1879H/TrvbLmgA6JkszGAmofqtFQErnP6scGE8At/NQnCwU6FgiOWWhzO+5zfd\ngs+XFv2RjsIV0UIH1AHr3RDTrXb6lsev25iAvttXYJDopkR4N2T4WMHxEvNxFPmT\n5ETBxBlHEwniODnAtmq6cPwW3kqpa4JqdRItDncCgYBQSUAxpHQHnhf3m5e/bbXi\nwsWyT90fEH+B5qclWmOHFdhaWgtpIEiIo4UAdyjV1pGSdtIyqyR+hQdvKQj8lPqk\n7RSnFZJPEEEMxCHcep/v3yMpdEtPkJohvy3zapYthW7C03vfPwlCI+F5FmZDozmk\nl2u3EuP92KoAd0uT+V8t3A==\n-----END PRIVATE KEY-----\n",
		"client_email": "firebase-adminsdk-so189@smurtain.iam.gserviceaccount.com",
		"client_id": "100425509743083529371",
		"auth_uri": "https://accounts.google.com/o/oauth2/auth",
		"token_uri": "https://oauth2.googleapis.com/token",
		"auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
		"client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-so189%40smurtain.iam.gserviceaccount.com",
		"universe_domain": "googleapis.com"
    }`)

	ctx := context.Background()
	opt := option.WithCredentialsJSON(serviceAccountJSON)
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
