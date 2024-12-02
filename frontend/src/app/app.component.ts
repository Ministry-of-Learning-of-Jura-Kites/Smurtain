import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrokerService } from '../../service/broker.service';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpClientModule } from '@angular/common/http';
import { VoiceRecognitionService } from '../../service/voice-recognition.service';
import { OpenCloseButtonComponent } from '@src/component/open-close-button/open-close-button.component';
import { AlertComponent } from '@coreui/angular';
import { NgIf } from '@angular/common';
import { cilCheck, cilWarning } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import * as topicNames from '@src/shared/topicNames';
import { StatusChartComponent } from '@src/component/status-chart/status-chart.component';
import * as config from '@src/shared/config';
import { StatusGraphComponent } from '../component/status-graph/status-graph.component';
import { FormsModule } from '@angular/forms';
@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-root',
  standalone: true,
  imports: [
    MatTabsModule,
    RouterOutlet,
    OpenCloseButtonComponent,
    AlertComponent,
    IconDirective,
    NgIf,
    StatusChartComponent,
    StatusGraphComponent,
    FormsModule,
  ],
  providers: [HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', 'app.component.scss'],
})
export class AppComponent {
  @ViewChild('curtain_button')
  openCloseButtonComponent!: OpenCloseButtonComponent;
  topicNames = topicNames;
  config = config;

  icons = { cilWarning };
  title = 'smurtain';
  isAlerting = false;
  message = '';

  constructor(
    public broker: BrokerService,
    private voiceRecognition: VoiceRecognitionService
  ) {
    if (!voiceRecognition.isSupported) {
      this.isAlerting = true;
      this.message = 'Your browser does not support speech recognition!';
    } else {
      voiceRecognition.commandSubject.subscribe((event) => {
        if (event == 'on') {
          this.openCloseButtonComponent.clickToOn();
        } else if (event == 'off') {
          this.openCloseButtonComponent.clickToOff();
        }
      });
    }
  }
}
