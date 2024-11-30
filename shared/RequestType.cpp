#include <Arduino.h>
#include "RequestType.h"
#include <stdexcept>

RequestType resolveRequestType(String input)
{
  if (input == "status/temperature")
  {
    return RequestType::Temperature;
  }
  if (input == "status/humidity")
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
  if (input == "status/light")
  {
    return RequestType::Light;
  }
  if (input == "status/curtain_status")
  {
    return RequestType::CurtainStatus;
  }
  if (input == "setting/light")
  {
    return RequestType::SettingLight;
  }
  if (input == "setting/temperature")
  {
    return RequestType::SettingTemperature;
  }
  if (input == "setting/humidity")
  {
    return RequestType::SettingHumidity;
  }
  if (input == "status/setting_light")
  {
    return RequestType::SettingLightStatus;
  }
  if (input == "status/setting_temperature")
  {
    return RequestType::SettingTemperatureStatus;
  }
  if (input == "status/setting_humidity")
  {
    return RequestType::SettingHumidityStatus;
  }
  return RequestType::None;
}

RequestType intToRequestType(int input)
{
  switch (input)
  {
  case static_cast<int>(RequestType::Temperature):
  case static_cast<int>(RequestType::Light):
  case static_cast<int>(RequestType::Humidity):
  case static_cast<int>(RequestType::CurtainStatus):
  case static_cast<int>(RequestType::On):
  case static_cast<int>(RequestType::Off):
  case static_cast<int>(RequestType::SettingHumidity):
  case static_cast<int>(RequestType::SettingLight):
  case static_cast<int>(RequestType::SettingTemperature):
  case static_cast<int>(RequestType::SettingHumidityStatus):
  case static_cast<int>(RequestType::SettingLightStatus):
  case static_cast<int>(RequestType::SettingTemperatureStatus):
    return static_cast<RequestType>(input);
  default:
    return RequestType::None;
  }
}