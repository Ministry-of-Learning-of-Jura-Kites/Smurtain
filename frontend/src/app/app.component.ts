import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemperatureComponent } from '../component/temperature/temperature.component';
import {BrokerService} from '../../service/broker.service';
import { LightDetectionComponent } from "../component/light-detection/light-detection.component";
import { HumidityComponent } from "../component/humidity/humidity.component";
import { TemperatureGraphComponent } from "../component/temperature-graph/temperature-graph.component";
import { LightGraphComponent } from "../component/light-graph/light-graph.component";
import { HumidityGraphComponent } from "../component/humidity-graph/humidity-graph.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TemperatureComponent, LightDetectionComponent, HumidityComponent, TemperatureGraphComponent, LightGraphComponent, HumidityGraphComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'web';
  constructor(private broker: BrokerService){
    
  }
}
