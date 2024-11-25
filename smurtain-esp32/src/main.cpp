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
#define ULTRASONIC_ECHO_PIN 26
#define MOTOR_PIN 33
#define TX_PIN 18
#define RX_PIN 19

enum UltrasonicSensorState
{
  TriggerLow1,
  TriggerWait1,
  TriggerHigh,
  TriggerWait2,
  Echo
};

UltrasonicSensorState ultrasonicSensorState;

// EspSoftwareSerial::UART gatewaySerial;

#define gatewaySerial Serial2

#define RXD2 16
#define TXD2 17

DHTesp dht;

void handleRequest(RequestType requestType);

std::array<unsigned char, 4> floatToUCharArray(float input);

template <typename T>
void printArray(Stream &Serial, T *array, size_t size);

ulong lastUltrasonicTime = 0;

double distance = 0;

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  gatewaySerial.begin(9600, SerialConfig::SERIAL_8O1, RXD2, TXD2);

  // gatewaySerial.begin(9600, EspSoftwareSerial::Config::SWSERIAL_8O1,RX_PIN);

  while (!gatewaySerial)
    ;

  Serial.println("started");

  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(MOTOR_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);
}

void loop()
{
  switch (ultrasonicSensorState)
  {
  case TriggerLow1:
    digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
    ultrasonicSensorState = TriggerWait1;
    break;

  case TriggerWait1:
    if (millis() >= 2 + lastUltrasonicTime)
    {
      ultrasonicSensorState = TriggerHigh;
      lastUltrasonicTime = millis();
    }
    break;

  case TriggerHigh:
    digitalWrite(ULTRASONIC_TRIG_PIN, HIGH);
    ultrasonicSensorState = TriggerWait2;
    break;

  case TriggerWait2:
    if (millis() >= 10 + lastUltrasonicTime)
    {
      ultrasonicSensorState = Echo;
      lastUltrasonicTime = millis();
    }
    break;

  case Echo:
    digitalWrite(ULTRASONIC_TRIG_PIN, LOW);
    ulong duration = pulseIn(ULTRASONIC_ECHO_PIN, HIGH);
    distance = (duration * .0343) / 2;
    // if (distance > 5)
    // {
    //   digitalWrite(MOTOR_PIN, HIGH);
    // }
    // else
    // {
    //   digitalWrite(MOTOR_PIN, LOW);
    // }
    ultrasonicSensorState = TriggerLow1;
    break;
  }

  // if (gatewaySerial.available())
  // {
  //   int data = gatewaySerial.read();
  //   if (data == (int)'\n')
  //   {
  //     return;
  //   }
  //   Serial.println("received message: " + String(data));
  //   try
  //   {
  //     int requestTypeInt = data;
  //     RequestType requestType = intToRequestType(requestTypeInt);
  //     Serial.println("Survived");
  //     handleRequest(requestType);
  //   }
  //   catch (const std::invalid_argument &e)
  //   {
  //     Serial.println("Invalid");
  //     return;
  //   }
  //   catch (const std::out_of_range &e)
  //   {
  //     return;
  //   }
  // }
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
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    printArray<u_char>(gatewaySerial, ucharArray.begin(), 4);
    gatewaySerial.write('\n');
    break;
  }
  case RequestType::Humidity:
  {
    dht.setup(DHT_PIN, DHT_TYPE);
    float value = dht.getHumidity();
    auto ucharArray = floatToUCharArray(value);
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    printArray<u_char>(gatewaySerial, ucharArray.begin(), 4);
    gatewaySerial.write('\n');
    break;
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