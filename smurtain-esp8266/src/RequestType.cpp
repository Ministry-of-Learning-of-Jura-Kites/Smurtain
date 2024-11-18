#include <Arduino.h>

enum RequestType
{
  None,
  Temperature,
  Humidity,
  On,
  Off,
};

RequestType resolveRequestType(String input)
{
  if (input == "temperature")
  {
    return Temperature;
  }
  if (input == "humidity")
  {
    return Humidity;
  }
  if (input == "on")
  {
    return On;
  }
  if (input == "temperature")
  {
    return Off;
  }
  return None;
}