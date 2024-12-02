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
#define SETTING_LIGHT_STATUS_TOPIC "status/setting_light"
#define SETTING_TEMPERATURE_STATUS_TOPIC "status/setting_temperature"
#define SETTING_HUMIDITY_STATUS_TOPIC "status/setting_humidity"
#define SETTINGS_LIGHT_TOPIC "settings/light"
#define SETTINGS_TEMPERATURE_TOPIC "settings/temperature"
#define SETTINGS_HUMIDITY_TOPIC "settings/humidity"
#define CURTAIN_STATUS_TOPIC "status/curtain_status"
#define BROKER_INTERVAL 5 // ms
#define TX_PIN D0
#define RX_PIN D1
#define FRAME_SEPERATOR 255

boolean has_encountered_error = false;

u_char buffer[6];

EspSoftwareSerial::UART sensorSerial;

WiFiClient wifiClient;

MqttClient mqttClient(wifiClient);

void onMqttMessage(int messageSize);

void handleSensorMessage();

void sendBooleanValue(String topic);

void sendFloatValue(String topic);

void setupMqtt();

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

  setupMqtt();

  Serial.println("MQTT broker is connected.");
}

void loop()
{
  if (!mqttClient.connected())
  {
  }
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

void setupMqtt()
{
  while (!mqttClient.connect(BROKER_HOST, BROKER_PORT))
  {
    Serial.print("MQTT connection failed! Error code = ");

    Serial.println(mqttClient.connectError());

    delay(5000);
  }

  mqttClient.onMessage(onMqttMessage);

  mqttClient.subscribe(REQUEST_TOPIC);
  mqttClient.subscribe(SETTINGS_LIGHT_TOPIC);
  mqttClient.subscribe(SETTINGS_HUMIDITY_TOPIC);
  mqttClient.subscribe(SETTINGS_TEMPERATURE_TOPIC);
}

void handleSensorMessage()
{
  size_t size = sensorSerial.readBytesUntil(FRAME_SEPERATOR, buffer, 6);
  int requestTypeInt = (int)buffer[0];
  Serial.print("received message from sensor: ");
  for(size_t i=0;i<size;i++){
    Serial.print(buffer[i]);
    Serial.print(" ");
  }
  Serial.println();
  RequestType requestType = intToRequestType(requestTypeInt);
  if (requestType == RequestType::None)
  {
    return;
  }
  switch (requestType)
  {
  case Temperature:
  {
    // Serial.println("temperature");
    sendFloatValue(TEMP_TOPIC);
    break;
  }
  case Humidity:
  {
    // Serial.println("humidity");
    sendFloatValue(HUMIDITY_TOPIC);
    break;
  }
  case Light:
  {
    // Serial.println("light");
    sendFloatValue(LIGHT_TOPIC);
    break;
  }
  case CurtainStatus:
  {
    // Serial.println("curtain status");
    sendBooleanValue(CURTAIN_STATUS_TOPIC);
    break;
  }
  case RequestType::SettingLightStatus:
  {
    Serial.println("light status");
    sendBooleanValue(SETTING_LIGHT_STATUS_TOPIC);
    break;
  }
  case RequestType::SettingTemperatureStatus:
  {
    Serial.println("temperature status");
    sendBooleanValue(SETTING_TEMPERATURE_STATUS_TOPIC);
    break;
  }
  case RequestType::SettingHumidityStatus:
  {
    Serial.println("humidity status");
    sendBooleanValue(SETTING_HUMIDITY_STATUS_TOPIC);
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
      uint8_t  buf[2]={static_cast<uint8_t>(requestType),FRAME_SEPERATOR};
      sensorSerial.write(buf,2);
    }
  }

  if (topic.startsWith("settings"))
  {
    uint8_t value;
    if (message == "on")
    {
      value = 1;
    }
    else if (message == "off")
    {
      value = 0;
    }
    else
    {
      return;
    }
    RequestType requestType;
    if (topic == "settings/light")
    {
      requestType = RequestType::SettingLight;
    }
    if (topic == "settings/humidity")
    {
      requestType = RequestType::SettingHumidity;
    }
    if (topic == "settings/temperature")
    {
      requestType = RequestType::SettingTemperature;
    }
    Serial.print("received from MQTT: ");
    Serial.println(message);
    sensorSerial.write(static_cast<uint8_t>(requestType));
    sensorSerial.write(value);
    sensorSerial.write(FRAME_SEPERATOR);
  }
}