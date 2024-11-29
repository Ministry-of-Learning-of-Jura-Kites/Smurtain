import { Component, EventEmitter, Output } from '@angular/core';
import { BrokerService } from '../../../service/broker.service';
import { CURTAIN_STATUS_TOPIC, REQUEST_TOPIC } from '@src/shared/topicNames';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {CommonModule, NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-open-close-button',
  standalone: true,
  imports: [MatProgressSpinnerModule,NgClass,NgIf],
  templateUrl: './open-close-button.component.html',
  styleUrl: './open-close-button.component.css',
})
export class OpenCloseButtonComponent {
  isChecked = false;
  isLoading = true;

  constructor(private brokerService: BrokerService) {
    brokerService.curtainStatus.subscribe((newValue) => {
      this.isLoading = false;
      this.isChecked = newValue;
    });
    this.brokerService.client?.publish(REQUEST_TOPIC, 'curtain_status');
    this.isLoading = true;
  }

  click() {
    if(this.isLoading){
      return;
    }
    this.isChecked = !this.isChecked;
    let message;
    if (this.isChecked) {
      message = 'on';
    } else {
      message = 'off';
    }
    this.brokerService.client?.publish(REQUEST_TOPIC, message);
    this.isLoading = true;
  }
}
