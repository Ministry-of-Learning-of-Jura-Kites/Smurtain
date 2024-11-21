#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <SoftwareSerial.h>
#include "RequestType.h"
#include <stdexcept>

#define WIFI_SSID "ggwp"
#define WIFI_PASS "ggnaja123"
#define BROKER_HOST "laptop.local"
#define BROKER_PORT 1883
#define REQUEST_TOPIC "request"
#define TEMP_TOPIC "temperature"
#define HUMIDITY_TOPIC "humidity"
#define BROKER_INTERVAL 5 // ms
#define TX_PIN D0
#define RX_PIN D1

boolean has_encountered_error = false;

EspSoftwareSerial::UART sensorSerial;

WiFiClient wifiClient;

MqttClient mqttClient(wifiClient);

ulong previousMillis = millis();

u_char buffer[16];

void onMqttMessage(int messageSize);

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  Serial.println("Serial connected");

  sensorSerial.begin(9600, EspSoftwareSerial::SWSERIAL_8O1, RX_PIN, TX_PIN);

  while (!sensorSerial)
    ;

  Serial.println("Sensor connected");

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nWifi connected.");

  // IPAddress serverIP;
  // if (!WiFi.hostByName("laptop.local", serverIP))
  // {
  //   Serial.println("Failed to resolve laptop.local");
  //   while (1)
  //     ;
  // }

  if (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
  {
    Serial.print("MQTT connection failed! Error code = ");

    Serial.println(mqttClient.connectError());

    has_encountered_error = true;

    return;
  }

  Serial.println("MQTT broker is connected.");

  mqttClient.onMessage(onMqttMessage);

  mqttClient.subscribe(REQUEST_TOPIC);
}

void loop()
{
  if (has_encountered_error)
  {
    return;
  }
  mqttClient.poll();

  if (sensorSerial.available())
  {
    sensorSerial.readBytesUntil('\n', buffer, 16);
    int requestTypeInt = (int)buffer[0];
    try
    {
      RequestType requestType = intToRequestType(requestTypeInt);
      float value = 0;
      memcpy(&value, buffer + 1, 4);
      switch (requestType)
      {
      case Temperature:
      {
        mqttClient.beginMessage(TEMP_TOPIC);
      }
      case Humidity:
      {
        mqttClient.beginMessage(HUMIDITY_TOPIC);
      }
      default:
      {
        return;
      }
      }
      mqttClient.print(value);
      mqttClient.endMessage();
    }
    catch (const std::invalid_argument &e)
    {
      return;
    }
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

  Serial.println("received message");

  if (topic == REQUEST_TOPIC)
  {
    RequestType requestType = resolveRequestType(message);
    if (requestType != RequestType::None)
    {
      sensorSerial.println(static_cast<int>(requestType));
    }
  }
}