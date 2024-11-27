#include <Arduino.h>
#include "RequestType.h"
#include <stdexcept>

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
  if (input == "off")
  {
    return RequestType::Off;
  }
  if (input == "light")
  {
    return RequestType::Light;
  }
  if (input == "curtain_status")
  {
    return RequestType::CurtainStatus;
  }
  return RequestType::None;
}

RequestType intToRequestType(int input){
  switch (input)
{
    case static_cast<int>(RequestType::Temperature):
    case static_cast<int>(RequestType::Light):
    case static_cast<int>(RequestType::Humidity):
    case static_cast<int>(RequestType::CurtainStatus):
    case static_cast<int>(RequestType::On):
    case static_cast<int>(RequestType::Off):
        return static_cast<RequestType>(input);
    default:
    return RequestType::None;
}
}