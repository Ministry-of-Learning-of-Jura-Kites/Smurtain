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
#define TEMP_TOPIC "status/temperature"
#define HUMIDITY_TOPIC "status/humidity"
#define LIGHT_TOPIC "status/light"
#define CURTAIN_STATUS_TOPIC "status/curtain_status"
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

void sendBooleanValue(String topic);

void sendFloatValue(String topic);

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

  while (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
  {
    Serial.print("MQTT connection failed! Error code = ");

    Serial.println(mqttClient.connectError());

    has_encountered_error = true;

    delay(5000);
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
  if (!mqttClient.connected())
  {
    while (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
    {
      Serial.print("MQTT connection failed! Error code = ");

      Serial.println(mqttClient.connectError());

      has_encountered_error = true;

      delay(5000);
    }
  }

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
  RequestType requestType = intToRequestType(requestTypeInt);
  if (requestType == RequestType::None)
  {
    return;
  }
  switch (requestType)
  {
  case Temperature:
  {
    Serial.println("temperature");
    sendFloatValue(TEMP_TOPIC);
    break;
  }
  case Humidity:
  {
    Serial.println("humidity");
    sendFloatValue(HUMIDITY_TOPIC);
    break;
  }
  case Light:
  {
    Serial.println("light");
    sendFloatValue(LIGHT_TOPIC);
    break;
  }
  case CurtainStatus:
  {
    Serial.println("curtain status");
    sendBooleanValue(CURTAIN_STATUS_TOPIC);
    break;
  }
  default:
  {
    return;
  }
  }
}

void sendFloatValue(String topic)
{
  float value = 0;
  memcpy(&value, buffer + 1, 4);
  mqttClient.beginMessage(topic);
  mqttClient.print(value);
  mqttClient.endMessage();
}

void sendBooleanValue(String topic)
{
  String value;
  switch (buffer[1])
  {
  case 0:
  {
    value = "off";
    break;
  }
  case 1:
  {
    value = "on";
    break;
  }
  default:
  {
    return;
  }
  }
  mqttClient.beginMessage(topic);
  mqttClient.print(value);
  mqttClient.endMessage();
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
      Serial.print("received from MQTT: ");
      Serial.println(static_cast<uint8_t>(requestType));
      sensorSerial.write(static_cast<uint8_t>(requestType));
      sensorSerial.write('\n');
      sensorSerial.flush();
    }
  }
}