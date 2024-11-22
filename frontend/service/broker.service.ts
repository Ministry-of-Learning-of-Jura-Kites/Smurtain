import { isPlatformBrowser } from '@angular/common';
import {
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import mqtt from 'mqtt-browser';

const REQUEST_TOPIC = 'request';
const TEMPERATURE_TOPIC = 'temperature';
const LIGHT_TOPIC = 'light';
const HUMIDITY_TOPIC = 'humidity';

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
  temperature: Subject<number> = new Subject();
  light: Subject<number> = new Subject();
  humidity: Subject<number> = new Subject();
  // humidity = new Subject();

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Object>) {
    if (isPlatformBrowser(platformId)) {
      this.client = mqtt.connect(MQTT_OPTIONS);
      this.client.on('connect', () => {
        this.client?.subscribe(TEMPERATURE_TOPIC, (err) => {
          if (err) {
            console.log('error from connecting mqtt', err);
          }
        });
        this.client?.subscribe(LIGHT_TOPIC, (err) => {
          if (err) {
            console.log('error from connecting mqtt', err);
          }
        });
        this.client?.subscribe(LIGHT_TOPIC, (err) => {
          if (err) {
            console.log('error from connecting mqtt', err);
          }
        });
        this.client?.subscribe(HUMIDITY_TOPIC, (err) => {
          if (err) {
            console.log('error from connecting mqtt', err);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        if (topic == TEMPERATURE_TOPIC) {
          this.temperature.next(parseFloat(message.toString()))
          // this.light.next(parseFloat(message.toString()))
        }
        if (topic == LIGHT_TOPIC) {
          this.light.next(parseFloat(message.toString()))
        }
        if (topic == HUMIDITY_TOPIC) {
          this.humidity.next(parseFloat(message.toString()))
        }
      });
    }
  }
 
}
