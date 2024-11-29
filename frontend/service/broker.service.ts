import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import mqtt from 'mqtt-browser';
import { isPlatformBrowser } from '@angular/common';
import {
  CURTAIN_STATUS_TOPIC,
  HUMIDITY_TOPIC,
  LIGHT_TOPIC,
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

  // Subjects to expose the latest value
  temperature: Subject<number> = new Subject();
  light: Subject<number> = new Subject();
  humidity: Subject<number> = new Subject();
  curtainStatus: Subject<boolean> = new Subject();

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Object>) {
    if (isPlatformBrowser(platformId)) {
      this.client = mqtt.connect(MQTT_OPTIONS);

      this.client.on('connect', () => {
        this.subscribeToTopic(TEMPERATURE_TOPIC);
        this.subscribeToTopic(LIGHT_TOPIC);
        this.subscribeToTopic(HUMIDITY_TOPIC);
        this.subscribeToTopic(CURTAIN_STATUS_TOPIC);
      });

      this.client.on('message', (topic, message) => {
        let messageString: string = message.toString();
        switch (topic) {
          case TEMPERATURE_TOPIC:
            this.temperature.next(parseFloat(messageString));
            break;
          case LIGHT_TOPIC:
            this.light.next(parseFloat(messageString));
            break;
          case HUMIDITY_TOPIC:
            this.humidity.next(parseFloat(messageString));
            break;
          case CURTAIN_STATUS_TOPIC:
            this.curtainStatus.next(messageString == 'on');
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
