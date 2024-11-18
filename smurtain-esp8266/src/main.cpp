#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>

#define WIFI_SSID "ggwp"
#define WIFI_PASS "ggnaja123"
#define BROKER_HOST "192.168.194.126"
#define BROKER_PORT 1883
#define REQUEST_TOPIC "request"
#define BROKER_INTERVAL 5 // ms
#define TX_PIN D0
#define RX_PIN D1

EspSoftwareSerial::UART sensorSerial;

WiFiClient wifiClient;

MqttClient mqttClient(wifiClient);

ulong previousMillis = millis();

void onMqttMessage(int messageSize);

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  sensorSerial.begin(9600, EspSoftwareSerial::SWSERIAL_8O1, RX_PIN, TX_PIN);

  while (!sensorSerial)
  {
    Serial.println("error");
  }

  Serial.println("started");

  wl_status_t status = WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    status = WiFi.begin(WIFI_SSID, WIFI_PASS);
    Serial.print(status);
    delay(1000);
  }

  Serial.println("\nWifi is Connected.");

  if (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
  {
    Serial.print("MQTT connection failed! Error code = ");

    Serial.println(mqttClient.connectError());

    while (1)
      ;
  }

  Serial.println("MQTT broker is connected.");

  mqttClient.onMessage(onMqttMessage);

  mqttClient.subscribe(REQUEST_TOPIC);
}

void loop()
{
  mqttClient.poll();

  while (sensorSerial.available())
  {
    Serial.print((char)sensorSerial.read());
  }
}

void onMqttMessage(int messageSize)
{
  String topic = mqttClient.messageTopic();
  String message;
  while (mqttClient.available())
  {
    message += mqttClient.readString();
  }

  if (topic == REQUEST_TOPIC)
  {
    // switch (resolveRequestType(message))
    // {
    // case Temperature:
    // {
    //   respondTemp();
    // }
    // case Humidity:
    // {
    //   respondHumidity();
    // }
    // case On:
    // {
    //   turnOn();
    // }
    // case Off:
    // {
    //   turnOff();
    // }
    // }
  }
}