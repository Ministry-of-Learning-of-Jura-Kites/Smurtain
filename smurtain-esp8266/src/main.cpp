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

u_char buffer[6];

EspSoftwareSerial::UART sensorSerial;

WiFiClient wifiClient;

MqttClient mqttClient(wifiClient);

void onMqttMessage(int messageSize);

void handleSensorMessage();

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  Serial.println("Serial connected");

  sensorSerial.begin(9600, EspSoftwareSerial::Config::SWSERIAL_8O1, RX_PIN, TX_PIN);

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
    handleSensorMessage();
  }
}

void handleSensorMessage()
{
  sensorSerial.readBytesUntil('\n', buffer, 6);
  Serial.println("received message from sensor");
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
      break;
    }
    case Humidity:
    {
      mqttClient.beginMessage(HUMIDITY_TOPIC);
      break;
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

void onMqttMessage(int messageSize)
{
  String topic = mqttClient.messageTopic();
  String message;
  while (mqttClient.available())
  {
    message += mqttClient.readString();
  }

  Serial.println("received message from Mqtt");

  if (topic == REQUEST_TOPIC)
  {
    RequestType requestType = resolveRequestType(message);
    if (requestType != RequestType::None)
    {
      sensorSerial.write(static_cast<uint8_t>(requestType));
      sensorSerial.write('\n');
      sensorSerial.flush();
    }
  }
}