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
import { REQUEST_TOPIC } from '@src/shared/topicNames';
import { StatusChartComponent } from '@src/component/status-chart/status-chart.component';
import {
  HUMIDITY_CONFIG,
  LIGHT_CONFIG,
  TEMPERATURE_CONFIG,
} from '@src/shared/config';
import { StatusGraphComponent } from '../component/status-graph/status-graph.component';
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
  ],
  providers: [HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', 'app.component.scss'],
})
export class AppComponent {
  @ViewChild(OpenCloseButtonComponent)
  openCloseButtonComponent!: OpenCloseButtonComponent;
  REQUEST_TOPIC = REQUEST_TOPIC;
  LIGHT_CONFIG = LIGHT_CONFIG;
  TEMPERATURE_CONFIG = TEMPERATURE_CONFIG;
  HUMIDITY_CONFIG = HUMIDITY_CONFIG;

  onCurtainButtonInit(this: OpenCloseButtonComponent) {
    this.brokerService.subjects.curtainStatus.subscribe((newValue) => {
      this.isLoading = false;
      this.isChecked = newValue;
    });
    this.brokerService.client?.publish(REQUEST_TOPIC, 'curtain_status');
  }

  onCurtainButtonOn(this: OpenCloseButtonComponent) {
    this.brokerService.client?.publish(REQUEST_TOPIC, 'on');
  }

  onCurtainButtonOff(this: OpenCloseButtonComponent) {
    this.brokerService.client?.publish(REQUEST_TOPIC, 'off');
  }

  // onAutoLightButtonInit(this: OpenCloseButtonComponent) {
  //   this.brokerService.subjects.settingLight.subscribe((newValue) => {
  //     this.isLoading = false;
  //     this.isChecked = newValue;
  //   });
  //   this.brokerService.client?.publish(REQUEST_TOPIC, 'status/setting_light');
  // }

  // onAutoLightButtonOn(this: OpenCloseButtonComponent) {
  //   this.brokerService.client?.publish(REQUEST_TOPIC, 'on');
  // }

  // onAutoLightButtonOff(this: OpenCloseButtonComponent) {
  //   this.brokerService.client?.publish(REQUEST_TOPIC, 'off');
  // }

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
