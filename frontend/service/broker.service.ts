import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import mqtt from 'mqtt-browser';
import { isPlatformBrowser } from '@angular/common';
import {
  CURTAIN_STATUS_TOPIC,
  HUMIDITY_TOPIC,
  LIGHT_TOPIC,
  SETTING_HUMIDITY_STATUS_TOPIC,
  SETTING_LIGHT_STATUS_TOPIC,
  SETTING_TEMPERATURE_STATUS_TOPIC,
  TEMPERATURE_TOPIC,
} from '@src/shared/topicNames';

export interface DataWithTime {
  Time: number;
  Data: number;
}

export const MQTT_OPTIONS: mqtt.IClientOptions = {
  hostname: 'localhost',
  port: 1884,
  protocol: 'ws',
};

@Injectable({
  providedIn: 'root',
})
export class BrokerService {
  public client: mqtt.MqttClient | undefined;

  public subjects = {
    temperature: new Subject<number>(),
    light: new Subject<number>(),
    humidity: new Subject<number>(),
    curtainStatus: new Subject<boolean>(),
    temperatureSettingStatus: new Subject<boolean>(),
    lightSettingStatus: new Subject<boolean>(),
    humiditySettingStatus: new Subject<boolean>(),
  };

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Object>) {
    if (isPlatformBrowser(platformId)) {
      this.client = mqtt.connect(MQTT_OPTIONS);

      this.client.on('connect', () => {
        this.subscribeToTopic(TEMPERATURE_TOPIC);
        this.subscribeToTopic(LIGHT_TOPIC);
        this.subscribeToTopic(HUMIDITY_TOPIC);
        this.subscribeToTopic(CURTAIN_STATUS_TOPIC);
        this.subscribeToTopic(SETTING_HUMIDITY_STATUS_TOPIC);
        this.subscribeToTopic(SETTING_LIGHT_STATUS_TOPIC);
        this.subscribeToTopic(SETTING_TEMPERATURE_STATUS_TOPIC);
      });

      this.client.on('message', (topic, message) => {
        let messageString: string = message.toString();
        switch (topic) {
          case TEMPERATURE_TOPIC:
            this.subjects.temperature.next(parseFloat(messageString));
            break;
          case LIGHT_TOPIC:
            this.subjects.light.next(parseFloat(messageString));
            break;
          case HUMIDITY_TOPIC:
            this.subjects.humidity.next(parseFloat(messageString));
            break;
          case CURTAIN_STATUS_TOPIC:
            this.subjects.curtainStatus.next(messageString == 'on');
            break;
          case SETTING_HUMIDITY_STATUS_TOPIC:
            this.subjects.humiditySettingStatus.next(messageString == 'on');
            break;
          case SETTING_TEMPERATURE_STATUS_TOPIC:
            this.subjects.temperatureSettingStatus.next(messageString == 'on');
            break;
          case SETTING_LIGHT_STATUS_TOPIC:
            this.subjects.lightSettingStatus.next(messageString == 'on');
            break;
        }
      });
    }
  }

  private subscribeToTopic(topic: string): void {
    this.client?.subscribe(topic, (err) => {
      if (err) {
        console.log(`Error subscribing to topic ${topic}`, err);
      }
    });
  }
}
