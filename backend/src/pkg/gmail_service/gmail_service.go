package gmail_service

import (
	"context"
	// "encoding/base64"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	mqtt "github.com/mochi-mqtt/server/v2"
	"github.com/mochi-mqtt/server/v2/packets"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"

	// "golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
	// "google.golang.org/api/option"
)

var GmailService *gmail.Service

var (
	_, b, _, _ = runtime.Caller(0)
	basepath   = filepath.Dir(b)
	Rootpath   = filepath.Join(basepath, "..", "..", "..", "..")
)

func getClient(config *oauth2.Config) *http.Client {
	tokFile := filepath.Join(Rootpath, "token.json")
	tok, err := tokenFromFile(tokFile)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(tokFile, tok)
	}
	return config.Client(context.Background(), tok)
}

func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Printf("Go to the following link in your browser then type the "+
		"authorization code: \n%v\n", authURL)

	var authCode string
	if _, err := fmt.Scan(&authCode); err != nil {
		log.Fatalf("Unable to read authorization code: %v", err)
	}

	tok, err := config.Exchange(context.TODO(), authCode)
	if err != nil {
		log.Fatalf("Unable to retrieve token from web: %v", err)
	}
	return tok
}

// Retrieves a token from a local file.
func tokenFromFile(file string) (*oauth2.Token, error) {
	f, err := os.Open(file)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	tok := &oauth2.Token{}
	err = json.NewDecoder(f).Decode(tok)
	return tok, err
}

// Saves a token to a file path.
func saveToken(path string, token *oauth2.Token) {
	fmt.Printf("Saving credential file to: %s\n", path)
	f, err := os.OpenFile(path, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		log.Fatalf("Unable to cache oauth token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
}

var isCurtainOn = false
var isFirstCurtainStatus = true

func init() {
	ctx := context.Background()
	b, err := os.ReadFile(filepath.Join(Rootpath, "credentials.json"))
	if err != nil {
		log.Fatalf("Unable to read client secret file: %v", err)
	}

	config, err := google.ConfigFromJSON(b, gmail.GmailSendScope)
	if err != nil {
		log.Fatalf("Unable to parse client secret file to config: %v", err)
	}
	client := getClient(config)

	srv, err := gmail.NewService(ctx, option.WithHTTPClient(client))
	if err != nil {
		log.Fatalf("Unable to retrieve Gmail client: %v", err)
	}

	GmailService = srv
}

func SendEmail(isOn bool) error {
	to := "chanmetha.promvijitrakarn@gmail.com"
	var msgString string
	emailTo := "To: " + to + "\r\n"
	msgString = emailTo
	subject := "Subject: Smurtain Update\n"
	msgString = msgString + subject
	msgString = msgString + "\n" + "Curtain is now "
	if isOn {
		msgString += "on."
	} else {
		msgString += "off."
	}
	var msg []byte
	msg = []byte(msgString)

	//Stores the entire message
	message := gmail.Message{
		Raw: base64.URLEncoding.EncodeToString([]byte(msg)),
	}

	//"me" sets the sender email address, email that was used to create the crendentials
	_, err := GmailService.Users.Messages.Send("me", &message).Do()
	if err != nil {
		return err
	}
	return nil
}

func SubscribeToTopics(server *mqtt.Server) {
	err := server.Subscribe("status/curtain_status", 5, func(cl *mqtt.Client, sub packets.Subscription, pk packets.Packet) {
		var newIsCurtainOn bool
		message := string(pk.Payload)
		if message == "on" {
			newIsCurtainOn = true
		} else if message == "off" {
			newIsCurtainOn = false
		} else {
			return
		}
		if isFirstCurtainStatus {
			isCurtainOn = newIsCurtainOn
			isFirstCurtainStatus = false
			return
		}
		if isCurtainOn != newIsCurtainOn {
			err := SendEmail(newIsCurtainOn)
			if err != nil {
				log.Fatal(err)
			}
		}
		log.Println("mail is sent")
		isCurtainOn = newIsCurtainOn
	})
	if err != nil {
		log.Fatal(err)
	}
}
