#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <WiFi.h>
#include <SoftwareSerial.h>
#include <string>
#include "../../shared/RequestType.h"
#include <DHTesp.h>

#define LIGHT_PIN 34
// Digital Humidity and Temperature sensor(DHT)
#define DHT_PIN 4
#define DHT_TYPE DHTesp::DHT11
#define ULTRASONIC_TRIG_PIN 27
#define ULTRASONIC_ECHO_PIN 27
#define TX_PIN 18
#define RX_PIN 19

EspSoftwareSerial::UART gatewaySerial;

DHTesp dht;

void handleRequest(RequestType requestType);

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  gatewaySerial.begin(9600, EspSoftwareSerial::SWSERIAL_8O1, RX_PIN, TX_PIN);

  while (!gatewaySerial)
    ;

  Serial.println("started");
}

void loop()
{
  if (gatewaySerial.available())
  {
    String messageChar = gatewaySerial.readString();
    try
    {
      // use stoi for safety
      int requestTypeInt = std::stoi(messageChar.c_str());
      RequestType requestType = intToRequestType(requestType);
      handleRequest(requestType);
    }
    catch (const std::invalid_argument &e)
    {
      return;
    }
    catch (const std::out_of_range &e)
    {
      return;
    }
  }
}

void handleRequest(RequestType requestType)
{
  switch (requestType)
  {
  // case RequestType::On: {

  // }
  // case RequestType::Off: {

  // }
  case RequestType::Temperature:
  {
    dht.setup(DHT_PIN, DHT_TYPE);
    Serial.println(String(static_cast<int>(requestType)) + String(dht.getTemperature()));
  }
  case RequestType::Humidity:
  {
    dht.setup(DHT_PIN, DHT_TYPE);
    Serial.println(String(static_cast<int>(requestType)) + String(dht.getHumidity()));
  }
  }
}