import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import mqtt from 'mqtt-browser';

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

  // Map to store DataWithTime for each topic
  private dataStore: Map<string, DataWithTime[]> = new Map();
  private db: IDBDatabase | undefined;
  private dbInitialized = new Subject<boolean>(); // To track the DB initialization status

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Object>) {
    if (isPlatformBrowser(platformId)) {
      this.initializeDatabase();
      this.client = mqtt.connect(MQTT_OPTIONS);

      this.client.on('connect', () => {
        this.subscribeToTopic(TEMPERATURE_TOPIC);
        this.subscribeToTopic(LIGHT_TOPIC);
        this.subscribeToTopic(HUMIDITY_TOPIC);
      });

      this.client.on('message', (topic, message) => {
        const dataValue = parseFloat(message.toString());
        const timestamp = Date.now();

        // Save the data into the dataStore map
        const newData: DataWithTime = { Time: timestamp, Data: dataValue };

        if (!this.dataStore.has(topic)) {
          this.dataStore.set(topic, []);
        }
        const topicData = this.dataStore.get(topic);
        topicData?.push(newData);

        // Store data in IndexedDB
        this.storeData(topic, newData);

        // Emit the latest value via Subject
        switch (topic) {
          case TEMPERATURE_TOPIC:
            this.temperature.next(dataValue);
            console.log(this.dataStore);
            break;
          case LIGHT_TOPIC:
            this.light.next(dataValue);
            console.log(this.dataStore);
            break;
          case HUMIDITY_TOPIC:
            this.humidity.next(dataValue);
            console.log(this.dataStore);
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

  private initializeDatabase(): void {
    const request = indexedDB.open('BrokerDataDB', 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;

      if (!db.objectStoreNames.contains(TEMPERATURE_TOPIC)) {
        db.createObjectStore(TEMPERATURE_TOPIC, { keyPath: 'Time' });
      }
      if (!db.objectStoreNames.contains(LIGHT_TOPIC)) {
        db.createObjectStore(LIGHT_TOPIC, { keyPath: 'Time' });
      }
      if (!db.objectStoreNames.contains(HUMIDITY_TOPIC)) {
        db.createObjectStore(HUMIDITY_TOPIC, { keyPath: 'Time' });
      }
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('IndexedDB Initialized');
      this.dbInitialized.next(true); // Notify that the DB is ready
    };

    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event);
    };
  }

  private storeData(topic: string, data: DataWithTime): void {
    if (!this.db) {
      console.error('IndexedDB not initialized.');
      return;
    }

    const transaction = this.db.transaction(topic, 'readwrite');
    const store = transaction.objectStore(topic);

    store.add(data);

    transaction.onerror = (event) => {
      console.error(`Error storing data for topic ${topic}:`, event);
    };

    transaction.oncomplete = () => {
      console.log(`Data stored successfully for topic ${topic}:`, data);
      this.printDatabaseContents(topic); // Print the contents of the store for debugging
    };
  }

  // Wait until the IndexedDB is initialized before accessing it
  public getData(topic: string): Promise<DataWithTime[]> {
    return new Promise((resolve, reject) => {
      this.dbInitialized.subscribe((initialized) => {
        if (initialized) {
          if (!this.db) {
            reject('IndexedDB not initialized.');
            return;
          }

          const transaction = this.db.transaction(topic, 'readonly');
          const store = transaction.objectStore(topic);

          const request = store.getAll();

          request.onsuccess = () => {
            console.log(`Data retrieved for topic ${topic}:`, request.result);
            resolve(request.result as DataWithTime[]);
          };

          request.onerror = (event) => {
            console.error(`Error retrieving data for topic ${topic}:`, event);
            reject(event);
          };
        } else {
          reject('IndexedDB not initialized.');
        }
      });
    });
  }

  // Debugging method to print the content of the IndexedDB store for a topic
  private printDatabaseContents(topic: string): void {
    if (!this.db) {
      console.error('IndexedDB not initialized.');
      return;
    }

    const transaction = this.db.transaction(topic, 'readonly');
    const store = transaction.objectStore(topic);
    const request = store.getAll();

    request.onsuccess = () => {
      console.log(`Contents of IndexedDB for topic ${topic}:`, request.result);
    };

    request.onerror = (event) => {
      console.error(`Error fetching data for topic ${topic}:`, event);
    };
  }
}

