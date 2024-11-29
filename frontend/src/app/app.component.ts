import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TemperatureChartComponent } from '@src/component/temperature-chart/temperature-chart.component';
import { BrokerService } from '../../service/broker.service';
import { LightChartComponent } from '../component/light-chart/light-chart.component';
import { HumidityChartComponent } from '@src/component/humidity-chart/humidity-chart.component';
import { TemperatureGraphComponent } from '../component/temperature-graph/temperature-graph.component';
import { LightGraphComponent } from '../component/light-graph/light-graph.component';
import { HumidityGraphComponent } from '../component/humidity-graph/humidity-graph.component';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule } from '@angular/common/http';
import {VoiceRecognitionService} from '../../service/voice-recognition.service';
import { OpenCloseButtonComponent } from '@src/component/open-close-button/open-close-button.component';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [
    MatTabsModule,
    RouterOutlet,
    TemperatureChartComponent,
    LightChartComponent,
    HumidityChartComponent,
    TemperatureGraphComponent,
    LightGraphComponent,
    HumidityGraphComponent,
    OpenCloseButtonComponent
  ],
  providers : [HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css','app.component.scss'],
})
export class AppComponent {
  title = 'web';
  constructor(private broker: BrokerService, private voiceRecognition: VoiceRecognitionService) {}
}
