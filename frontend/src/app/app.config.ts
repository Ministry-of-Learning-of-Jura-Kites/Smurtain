import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { IMqttServiceOptions, MQTT_SERVICE_OPTIONS, MqttModule } from 'ngx-mqtt';
import {BrokerService} from '../../service/broker.service';


export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration()
  ],
};
