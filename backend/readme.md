1. go to https://console.cloud.google.com/apis/credentials/oauthclient/
2. download client secrets, name it as "credentials.json" in root project
- Smurtain
  - backend
  - frontend
  - shared
  - smurtain-esp32
  - smutain-esp8266
  - credentials.json
3. run main.go, go to link in terminal
4. login to carbonull.official@gmail.com
5. it will redirect to oat's website, copy query parameter "code" in url
6. use decodeURIcomponent to decode it in js console
7. paste it in terminal