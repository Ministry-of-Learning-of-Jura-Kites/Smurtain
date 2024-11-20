#ifndef REQUEST_TYPE_INCLUDED
#define REQUEST_TYPE_INCLUDED
#include <Arduino.h>

enum RequestType
{
  None,
  Temperature,
  Humidity,
  On,
  Off,
};

RequestType resolveRequestType(String input);

RequestType intToRequestType(int input);

#endif