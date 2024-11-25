#include <Arduino.h>

#define POS_MOTOR 27
#define NEG_MOTOR 26

void setup() {
  pinMode(POS_MOTOR,OUTPUT);
  pinMode(NEG_MOTOR,OUTPUT);

  digitalWrite(POS_MOTOR,LOW);
  digitalWrite(NEG_MOTOR,HIGH);
}

void loop() {
}