import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import mqtt from 'mqtt-browser';
import { isPlatformBrowser } from '@angular/common';
import { MongoDBServiceService } from './mongo-dbservice.service';

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
  public client: mqtt.MqttClient | undefined;

  // Subjects to expose the latest value
  temperature: Subject<number> = new Subject();
  light: Subject<number> = new Subject();
  humidity: Subject<number> = new Subject();

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Object>,
    private mongoService: MongoDBServiceService // Inject MongoDB Service
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

        // Save the data into MongoDB
        this.storeData(topic, newData);

        // Emit the latest value via Subject
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

  // Store data in MongoDB
  private storeData(topic: string, data: DataWithTime): void {
    console.log(data) ;
    this.mongoService.createItem({ topic, ...data }).subscribe({
      next: (response) => {
        console.log(`Data stored successfully in MongoDB for topic ${topic}:`, response);
      },
      error: (err) => {
        console.error(`Error storing data in MongoDB for topic ${topic}:`, err);
      },
    });
  }

  // Fetch data from MongoDB
  public getData(topic: string): Promise<DataWithTime[]> {
    return new Promise((resolve, reject) => {
      this.mongoService
        .getItems()
        .subscribe({
          next: (response) => {
            // Filter items by topic
            const filteredData = response.documents.filter(
              (doc: any) => doc.topic === topic
            ) as DataWithTime[];
            console.log(`Data retrieved from MongoDB for topic ${topic}:`, filteredData);
            resolve(filteredData);
          },
          error: (err) => {
            console.error(`Error retrieving data from MongoDB for topic ${topic}:`, err);
            reject(err);
          },
        });
    });
  }
}
