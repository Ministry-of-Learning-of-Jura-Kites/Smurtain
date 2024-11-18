#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <WiFi.h>
#include <SoftwareSerial.h>

#define LIGHT_PIN 34
#define TEMP_PIN 4
#define ULTRASONIC_TRIG_PIN 27
#define ULTRASONIC_ECHO_PIN 27
#define TX_PIN 16
#define RX_PIN 19

EspSoftwareSerial::UART gatewaySerial;

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  gatewaySerial.begin(115200, EspSoftwareSerial::SWSERIAL_7O1, RX_PIN, TX_PIN);

  while (!gatewaySerial)
    ;
}

void loop()
{
  gatewaySerial.println("gg");
}
