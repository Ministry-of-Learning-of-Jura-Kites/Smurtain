import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemperatureComponent } from '../component/temperature/temperature.component';
import {BrokerService} from '../../service/broker.service';
import { LightDetectionComponent } from "../component/light-detection/light-detection.component";
import { HumidityComponent } from "../component/humidity/humidity.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TemperatureComponent, LightDetectionComponent, HumidityComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'web';
  constructor(private broker: BrokerService){
    
  }
}
