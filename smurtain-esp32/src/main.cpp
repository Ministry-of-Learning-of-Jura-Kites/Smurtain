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
#define TX_PIN 18
#define RX_PIN 19
#define SAMPLING_INTERVAL 4000 // ms
// #define SAMPLING_INTERVAL 10000000000 // ms
#define MIN_LIGHT 2000
#define MAX_LIGHT 4500
#define MOTOR_SPEED_PIN 15
#define MOTOR_DIR1_PIN 33
#define MOTOR_DIR2_PIN 32
#define BELT_DISTANCE 25 // cm
#define MOTOR_MAX_VOLTAGE 255
#define MOTOR_MIN_VOLTAGE 50
#define ON_ULTRASONIC_DISTANCE 3

enum UltrasonicSensorState
{
  TriggerLow1,
  TriggerWait1,
  TriggerHigh,
  TriggerWait2,
  Echo
};

enum CurtainState
{
  CurtainOn,
  TurningOn,
  CurtainOff,
  TurningOff
};

UltrasonicSensorState ultrasonicSensorState = TriggerLow1;

CurtainState curtainState = CurtainState::CurtainOff;

// EspSoftwareSerial::UART gatewaySerial;

#define gatewaySerial Serial2

#define RXD2 16
#define TXD2 17

ulong lastUltrasonicTime = 0;

double distance = 0;

DHTesp dht;

boolean isCurtainOn = false;

ulong lastSamplingTime = 0;

void handleRequest(RequestType requestType);

std::array<unsigned char, 4> floatToUCharArray(float input);

template <typename T>
void printArray(Stream &Serial, T *array, size_t size);

void distanceUpdate();

void handleGatewayMessage();

void sample();

void moveMotor();

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

  pinMode(LIGHT_PIN, INPUT);
  pinMode(ULTRASONIC_TRIG_PIN, OUTPUT);
  pinMode(MOTOR_DIR1_PIN, OUTPUT);
  pinMode(MOTOR_DIR2_PIN, OUTPUT);
  pinMode(MOTOR_SPEED_PIN, OUTPUT);
  pinMode(ULTRASONIC_ECHO_PIN, INPUT);

  dht.setup(DHT_PIN, DHT_TYPE);
}

void loop()
{
  distanceUpdate();
  sample();
  if (gatewaySerial.available())
  {
    handleGatewayMessage();
  }
}

void sample()
{
  if (millis() >= SAMPLING_INTERVAL + lastSamplingTime)
  {
    handleRequest(RequestType::Temperature);
    handleRequest(RequestType::Light);
    handleRequest(RequestType::Humidity);
    lastSamplingTime = millis();
  }
}

void handleGatewayMessage()
{
  int data = gatewaySerial.read();
  if (data == (int)'\n')
  {
    return;
  }
  Serial.println("received message: " + String(data));
  int requestTypeInt = data;
  RequestType requestType = intToRequestType(requestTypeInt);
  handleRequest(requestType);
}

void handleRequest(RequestType requestType)
{
  switch (requestType)
  {
  case RequestType::On:
  {
    Serial.println("on");
    curtainState = TurningOn;
    break;
  }
  case RequestType::Off:
  {
    Serial.println("off");
    curtainState = TurningOff;
    break;
  }
  case RequestType::Temperature:
  {
    float value = dht.getTemperature();
    auto ucharArray = floatToUCharArray(value);
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    printArray<u_char>(gatewaySerial, ucharArray.begin(), 4);
    gatewaySerial.write('\n');
    break;
  }
  case RequestType::Humidity:
  {
    float value = dht.getHumidity();
    auto ucharArray = floatToUCharArray(value);
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    printArray<u_char>(gatewaySerial, ucharArray.begin(), 4);
    gatewaySerial.write('\n');
    break;
  }
  case RequestType::Light:
  {
    uint32_t lightRead = analogRead(LIGHT_PIN);
    float value = ((float)lightRead - MIN_LIGHT) / (MAX_LIGHT - MIN_LIGHT) * 100;
    auto ucharArray = floatToUCharArray(value);
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    printArray<u_char>(gatewaySerial, ucharArray.begin(), 4);
    gatewaySerial.write('\n');
    break;
  }
  case RequestType::CurtainStatus:
  {
    gatewaySerial.write(static_cast<uint8_t>(requestType));
    gatewaySerial.write(curtainState == CurtainOn ? 1 : 0);
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

void distanceUpdate()
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
    ultrasonicSensorState = TriggerLow1;
    moveMotor();
    break;
  }
}

void moveMotor()
{
  // Serial.println("distance: " + String(distance));
  switch (curtainState)
  {
  case CurtainState::TurningOn:
  {
    if (distance >= ON_ULTRASONIC_DISTANCE)
    {
      int analogValue = MOTOR_MIN_VOLTAGE + std::min(1.0, std::max(0.0, (distance - ON_ULTRASONIC_DISTANCE) / BELT_DISTANCE)) * (MOTOR_MAX_VOLTAGE - MOTOR_MIN_VOLTAGE);
      digitalWrite(MOTOR_DIR1_PIN, LOW);
      digitalWrite(MOTOR_DIR2_PIN, HIGH);
      analogWrite(MOTOR_SPEED_PIN, analogValue);
    }
    else
    {
      analogWrite(MOTOR_SPEED_PIN, 0);
      curtainState = CurtainState::CurtainOn;
      handleRequest(CurtainStatus);
    }
    break;
  }
  case CurtainState::TurningOff:
  {
    if (distance <= BELT_DISTANCE - 0.5)
    {
      int analogValue = MOTOR_MAX_VOLTAGE - std::min(1.0, std::max(0.0, (distance - ON_ULTRASONIC_DISTANCE) / BELT_DISTANCE)) * (MOTOR_MAX_VOLTAGE - MOTOR_MIN_VOLTAGE);
      digitalWrite(MOTOR_DIR1_PIN, HIGH);
      digitalWrite(MOTOR_DIR2_PIN, LOW);
      analogWrite(MOTOR_SPEED_PIN, analogValue);
    }
    else
    {
      analogWrite(MOTOR_SPEED_PIN, 0);
      curtainState = CurtainState::CurtainOff;
      handleRequest(CurtainStatus);
    }
    break;
  }
  }
}