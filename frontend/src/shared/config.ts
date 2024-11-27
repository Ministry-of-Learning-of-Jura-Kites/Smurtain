export interface MeasurementConfig {
  TITLE: string;
  UNIT: string;
  MIN: number;
  MAX: number;
}

export class HUMIDITY_CONFIG {
  static readonly TITLE = 'Humidity';
  static readonly UNIT = '% RH';
  static readonly MIN = 0;
  static readonly MAX = 100;
}

export class TEMPERATURE_CONFIG {
  static readonly TITLE = 'Temperature';
  static readonly UNIT = '°C';
  static readonly MIN = 0;
  static readonly MAX = 50;
}

export class LIGHT_CONFIG {
  static readonly TITLE = 'Light';
  static readonly UNIT = '%';
  static readonly MIN = 0;
  static readonly MAX = 100;
}

// ensure each one follows interface
{
  const _: MeasurementConfig = HUMIDITY_CONFIG;
}
{
  const _: MeasurementConfig = TEMPERATURE_CONFIG;
}
{
  const _: MeasurementConfig = LIGHT_CONFIG;
}
