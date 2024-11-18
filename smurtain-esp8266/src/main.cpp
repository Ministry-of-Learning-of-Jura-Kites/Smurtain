#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include "RequestType.cpp"
#include <SoftwareSerial.h>

#define WIFI_SSID "ggwp"
#define WIFI_PASS "ggnaja123"
#define BROKER_HOST ""
#define BROKER_PORT 1883
#define REQUEST_TOPIC "request"
#define BROKER_INTERVAL 5 // ms
#define TX_PIN 16
#define RX_PIN 19

EspSoftwareSerial::UART sensorSerial;

WiFiClient wifiClient;

MqttClient mqttClient(wifiClient);

// auto sensorSerial = SoftwareSerial::UA

ulong previousMillis = millis();

void onMqttMessage(int messageSize);

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  sensorSerial.begin(115200, EspSoftwareSerial::SWSERIAL_7O1, RX_PIN, TX_PIN);

  while (!sensorSerial)
    ;

  // while (WiFi.begin(WIFI_SSID, WIFI_PASS) != WL_CONNECTED)
  // {

  //   Serial.print(".");

  //   delay(5000);
  // }

  // Serial.println("\nWifi is Connected.");

  // if (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
  // {

  //   Serial.print("MQTT connection failed! Error code = ");

  //   Serial.println(mqttClient.connectError());

  //   while (1)
  //     ;
  // }

  // Serial.println("MQTT broker is connected.");

  // mqttClient.onMessage(onMqttMessage);

  // mqttClient.subscribe(REQUEST_TOPIC);
}

void loop()
{
  // mqttClient.poll();
  while (sensorSerial.available())
  {
    Serial.print((char)sensorSerial.read());
  }
}

// void onMqttMessage(int messageSize)
// {
//   String topic = mqttClient.messageTopic();
//   String message;
//   while (mqttClient.available())
//   {
//     message += mqttClient.readString();
//   }

//   if (topic == REQUEST_TOPIC)
//   {
//     // switch (resolveRequestType(message))
//     // {
//     // case Temperature:
//     // {
//     //   respondTemp();
//     // }
//     // case Humidity:
//     // {
//     //   respondHumidity();
//     // }
//     // case On:
//     // {
//     //   turnOn();
//     // }
//     // case Off:
//     // {
//     //   turnOff();
//     // }
//     // }
//   }
// }