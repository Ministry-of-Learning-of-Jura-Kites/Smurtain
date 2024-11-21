#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <WiFi.h>
#include <SoftwareSerial.h>
#include <string>
#include "RequestType.h"
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

std::array<unsigned char, 4> floatToUCharArray(float input);

template <typename T>
void printArray(Stream &Serial, T *array, size_t size);

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
    float value = dht.getTemperature();
    auto ucharArray = floatToUCharArray(value);
    Serial.print(static_cast<char>(requestType));
    printArray<u_char>(Serial, ucharArray.begin(), 4);
    Serial.println();
  }
  case RequestType::Humidity:
  {
    dht.setup(DHT_PIN, DHT_TYPE);
    float value = dht.getHumidity();
    auto ucharArray = floatToUCharArray(value);
    Serial.print(static_cast<char>(requestType));
    printArray<u_char>(Serial, ucharArray.begin(), 4);
    Serial.println();
  }
  }
}

std::array<unsigned char, 4> floatToUCharArray(float input)
{
  std::array<unsigned char, 4> array = {0};
  memcpy(array.begin(), &input, 4);
  return array;
}

template <typename T>
void printArray(Stream &Serial, T *array, size_t size)
{
  for (size_t i = 0; i < size; i++)
  {
    Serial.write(array[i]);
  }
}