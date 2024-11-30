import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { VoiceRecognitionService } from '../../service/voice-recognition.service';
import { OpenCloseButtonComponent } from '@src/component/open-close-button/open-close-button.component';
import { AlertComponent } from '@coreui/angular';
import {NgIf} from '@angular/common';
import { cilCheck, cilWarning } from '@coreui/icons';
import {IconDirective} from '@coreui/icons-angular';

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
    OpenCloseButtonComponent,
    AlertComponent,
    IconDirective,
    NgIf
  ],
  providers: [HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', 'app.component.scss'],
})
export class AppComponent {
  @ViewChild(OpenCloseButtonComponent)
  openCloseButtonComponent!: OpenCloseButtonComponent;

  icons = { cilWarning };
  title = 'smurtain';
  isAlerting = false;
  message = ""

  constructor(
    private broker: BrokerService,
    private voiceRecognition: VoiceRecognitionService
  ) {
    if(!voiceRecognition.isSupported){
      this.isAlerting=true;
      this.message="Your browser does not support speech recognition!"
    }
    else{
      voiceRecognition.commandSubject.subscribe((event)=>{
        if(event=="on"){
          this.openCloseButtonComponent.clickToOn()
        }
        else if(event=="off"){
          this.openCloseButtonComponent.clickToOff()
        }
      })
    }
  }
}
