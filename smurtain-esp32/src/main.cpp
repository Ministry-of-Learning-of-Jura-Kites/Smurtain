#include <ArduinoMqttClient.h>
#include <Arduino.h>
#include <WiFi.h>
#include <SoftwareSerial.h>

#define LIGHT_PIN 34
#define TEMP_PIN 4
#define ULTRASONIC_TRIG_PIN 27
#define ULTRASONIC_ECHO_PIN 27
#define TX_PIN 18
#define RX_PIN 19

EspSoftwareSerial::UART gatewaySerial;

void setup()
{
  Serial.begin(115200);

  while (!Serial)
    ;

  gatewaySerial.begin(9600, EspSoftwareSerial::SWSERIAL_8O1, RX_PIN, TX_PIN);

  while (!gatewaySerial){
    Serial.println("error");
  }

  Serial.println("started");
}

void loop()
{
  gatewaySerial.println("something");
  while (gatewaySerial.available())
  {
    Serial.print((char)gatewaySerial.read());
  }
}
