#include <Arduino.h>
#include "RequestType.h"

RequestType resolveRequestType(String input)
{
  if (input == "temperature")
  {
    return RequestType::Temperature;
  }
  if (input == "humidity")
  {
    return RequestType::Humidity;
  }
  if (input == "on")
  {
    return RequestType::On;
  }
  if (input == "temperature")
  {
    return RequestType::Off;
  }
  return RequestType::None;
}

RequestType intToRequestType(int input){
  switch (input)
{
    case static_cast<int>(RequestType::Humidity):
    case static_cast<int>(RequestType::Off):
    case static_cast<int>(RequestType::On):
    case static_cast<int>(RequestType::Temperature):
        return static_cast<RequestType>(input);
    default:
        throw "invalid number";
}
}