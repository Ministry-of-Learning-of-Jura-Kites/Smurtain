#ifndef REQUEST_TYPE_INCLUDED
#define REQUEST_TYPE_INCLUDED
#include <Arduino.h>

enum RequestType
{
  None,
  Temperature,
  Light,
  Humidity,
  CurtainStatus,
  On,
  Off,
  SettingLight,
  SettingTemperature,
  SettingHumidity,
  SettingLightStatus,
  SettingTemperatureStatus,
  SettingHumidityStatus
};

RequestType resolveRequestType(String input);

RequestType intToRequestType(int input);

#endif