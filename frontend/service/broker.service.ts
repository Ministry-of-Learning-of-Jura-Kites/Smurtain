import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import mqtt from 'mqtt-browser';
import { isPlatformBrowser } from '@angular/common';

export interface DataWithTime {
  Time: number;
  Data: number;
}

const REQUEST_TOPIC = 'request';
const TEMPERATURE_TOPIC = 'status/temperature';
const LIGHT_TOPIC = 'status/light';
const HUMIDITY_TOPIC = 'status/humidity';

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
  ) {
    if (isPlatformBrowser(platformId)) {
      this.client = mqtt.connect(MQTT_OPTIONS);

      this.client.on('connect', () => {
        this.subscribeToTopic(TEMPERATURE_TOPIC);
        this.subscribeToTopic(LIGHT_TOPIC);
        this.subscribeToTopic(HUMIDITY_TOPIC);
      });

      this.client.on('message', (topic, message) => {
        const dataValue = parseFloat(message.toString());
        const timestamp = Date.now();

        const newData: DataWithTime = { Time: timestamp, Data: dataValue };

        switch (topic) {
          case TEMPERATURE_TOPIC:
            this.temperature.next(dataValue);
            break;
          case LIGHT_TOPIC:
            this.light.next(dataValue);
            break;
          case HUMIDITY_TOPIC:
            this.humidity.next(dataValue);
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
