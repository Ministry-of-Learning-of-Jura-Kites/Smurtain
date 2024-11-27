package gmail_service

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

var GmailService *gmail.Service

var (
	_, b, _, _ = runtime.Caller(0)
	basepath   = filepath.Dir(b)
	rootpath   = filepath.Join(basepath, "..", "..", "..", "..")
)

func getClient(config *oauth2.Config) *http.Client {
	tokFile := filepath.Join(rootpath, "token.json")
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

func init() {
	ctx := context.Background()
	b, err := os.ReadFile(filepath.Join(rootpath, "credentials.json"))
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

	// user := "me"
	// r, err := srv.Users.Labels.List(user).Do()
	// if err != nil {
	// 	log.Fatalf("Unable to retrieve labels: %v", err)
	// }
	// if len(r.Labels) == 0 {
	// 	fmt.Println("No labels found.")
	// 	return
	// }gmailService
	// fmt.Println("Labels:")
	// for _, l := range r.Labels {
	// 	fmt.Printf("- %s\n", l.Name)
	// }

	// config := &oauth2.Config{
	// 	ClientID:     env.Env["GOOGLE_CLIENT_ID"],
	// 	ClientSecret: env.Env["GOOGLE_API_KEY"],
	// 	Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
	// 	Endpoint:     google.Endpoint,
	// }
	// ctx := context.Background()
	// // Generate the URL for user authorization
	// authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	// log.Printf("Visit the following URL, then paste the authorization code here:\n%v\n", authURL)

	// // var authCode string
	// // log.Print(Client"Enter the authorization code: ")
	// // log.Scan(&authCode)

	// token, err := config.Exchange(ctx, "000")
	// var tokenSource = config.TokenSource(ctx, &token)
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// log.Println(token)

	// client := config.Client(context.Background(), token)
	// gmailService, err := gmail.NewService(ctx, option.WithTokenSource(config.TokenSource(ctx, token)))
	// gmailService, err := gmail.NewService(ctx, option.WithHTTPClient(client))
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// GmailService = gmailService
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
