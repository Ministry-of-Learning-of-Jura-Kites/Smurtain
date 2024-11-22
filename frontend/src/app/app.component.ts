import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemperatureComponent } from '../component/temperature/temperature.component';
import {BrokerService} from '../../service/broker.service';
import {MQTT_SERVICE_OPTIONS, MqttModule} from 'ngx-mqtt';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TemperatureComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'web';
  constructor(private broker: BrokerService){
    
  }
}
