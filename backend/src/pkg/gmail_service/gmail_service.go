package gmail_service

import (
	"context"
	"encoding/base64"
	"log"

	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

var GmailService *gmail.Service

func Init() {

	ctx := context.Background()
	gmailService, err := gmail.NewService(ctx, option.WithAPIKey(""))
	if err != nil {
		log.Fatal(err)
	}
	GmailService = gmailService
}
func SendEmail(isOn bool) (bool, error) {
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
		return false, err
	}
	return true, nil
}
