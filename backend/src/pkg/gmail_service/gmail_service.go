package gmail_service

import (
	"context"
	"log"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/gmail/v1"
	"smurtain.com/backend/src/pkg/env"
)

var GmailService *gmail.Service

func init() {
	log.Println(env.Env)
	config := &oauth2.Config{
		ClientID:     env.Env["GOOGLE_CLIENT_ID"],
		ClientSecret: env.Env["GOOGLE_API_KEY"],
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email"},
		Endpoint:     google.Endpoint,
	}
	ctx := context.Background()
	// Generate the URL for user authorization
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	log.Printf("Visit the following URL, then paste the authorization code here:\n%v\n", authURL)

	// var authCode string
	// log.Print("Enter the authorization code: ")
	// log.Scan(&authCode)

	token, err := config.Exchange(ctx, "000")
	var tokenSource = config.TokenSource(ctx, &token)
	if err != nil {
		log.Fatal(err)
	}
	log.Println(token)

	// client := config.Client(context.Background(), token)
	// // gmailService, err := gmail.NewService(ctx, option.WithTokenSource(config.TokenSource(ctx, token)))
	// gmailService, err := gmail.NewService(ctx, option.WithHTTPClient(client))
	// if err != nil {
	// 	log.Fatal(err)
	// }
	// GmailService = gmailService
}

func SendEmail(isOn bool) error {
	// updatedToken, err := config.TokenSource(context.TODO(), token).Token()
	// to := "chanmetha.promvijitrakarn@gmail.com"
	// var msgString string
	// emailTo := "To: " + to + "\r\n"
	// msgString = emailTo
	// subject := "Subject: Smurtain Update\n"
	// msgString = msgString + subject
	// msgString = msgString + "\n" + "Curtain is now "
	// if isOn {
	// 	msgString += "on."
	// } else {
	// 	msgString += "off."
	// }
	// var msg []byte
	// msg = []byte(msgString)

	// //Stores the entire message
	// message := gmail.Message{
	// 	Raw: base64.URLEncoding.EncodeToString([]byte(msg)),
	// }

	// //"me" sets the sender email address, email that was used to create the crendentials
	// _, err := GmailService.Users.Messages.Send("me", &message).Do()
	// if err != nil {
	// 	return err
	// }
	return nil
}
