import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import mqtt from 'mqtt-browser';
import NodeCache from 'node-cache'; // Import NodeCache

export interface DataWithTime {
  Time: number;
  Data: number;
}

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
  private cache: NodeCache = new NodeCache(); // Use NodeCache instead of Map
  public cache$ = new BehaviorSubject<DataWithTime[]>([]);
  public client: mqtt.MqttClient | undefined;
  temperature: Subject<number> = new Subject();
  light: Subject<number> = new Subject();
  humidity: Subject<number> = new Subject();

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Object>) {
    if (isPlatformBrowser(platformId)) {
      this.cache = new NodeCache(); // Initialize NodeCache
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
        this.client?.subscribe(HUMIDITY_TOPIC, (err) => {
          if (err) {
            console.log('error from connecting mqtt', err);
          }
        });
      });

      this.client.on('message', (topic, message) => {
        if (topic == TEMPERATURE_TOPIC) {
          this.temperature.next(parseFloat(message.toString()));
          const time = Date.now();
          this.set(topic, {
            Time: time,
            Data: parseFloat(message.toString()),
          });
          console.log('cache', this.cache);
          console.log('behavior', this.cache$);
        }
        if (topic == LIGHT_TOPIC) {
          this.light.next(parseFloat(message.toString()));
          const time = Date.now();
          this.set(topic, {
            Time: time,
            Data: parseFloat(message.toString()),
          });
          console.log('cache', this.cache);
          console.log('behavior', this.cache$);
        }
        if (topic == HUMIDITY_TOPIC) {
          this.humidity.next(parseFloat(message.toString()));
          const time = Date.now();
          this.set(topic, {
            Time: time,
            Data: parseFloat(message.toString()),
          });
          console.log('cache', this.cache);
          console.log('behavior', this.cache$);
        }
      });
    }
  }

  set(key: string, data: DataWithTime) {
    let existingData = this.cache.get(key) as DataWithTime[]; // Get existing data from cache

    if (existingData) {
      existingData.push(data); // Push new data if exists
    } else {
      existingData = [data]; // Create new array if no data exists
    }

    this.cache.set(key, existingData); // Set the updated data back into cache

    // Flatten cache values and update BehaviorSubject
    const allCacheData = Array.from(this.cache.keys()).flatMap(
      (key) => this.cache.get(key) as DataWithTime[]
    );
    this.cache$.next(allCacheData);
  }
}
