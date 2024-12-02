import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrokerService } from '../../../service/broker.service';
import { CURTAIN_STATUS_TOPIC, REQUEST_TOPIC } from '@src/shared/topicNames';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-open-close-button',
  standalone: true,
  imports: [MatProgressSpinnerModule, NgClass, NgIf],
  templateUrl: './open-close-button.component.html',
  styleUrl: './open-close-button.component.css',
})
export class OpenCloseButtonComponent implements OnInit {
  // only subject of boolean
  @Input() brokerServiceKey:
    | {
        [K in keyof BrokerService['subjects']]: BrokerService['subjects'][K] extends Subject<boolean>
          ? K
          : never;
      }[keyof BrokerService['subjects']]
    | undefined;
  @Input() onClickTopic: string | undefined;
  @Input() requestMessage: string | undefined;
  isChecked = false;
  isLoading = true;

  constructor(public brokerService: BrokerService) {
    // this.brokerService.client?.publish(REQUEST_TOPIC, 'curtain_status');
    this.isLoading = true;
  }

  ngOnInit(): void {
    // this.onInit();
    this.brokerService.subjects[this.brokerServiceKey!]!.subscribe(
      (newValue: boolean) => {
        this.isLoading = false;
        this.isChecked = newValue;
      }
    );
    this.brokerService.client?.publish(REQUEST_TOPIC, this.requestMessage!);
  }

  click() {
    if (this.isLoading) {
      return;
    }
    this.isChecked = !this.isChecked;
    if (this.isChecked) {
      this.clickToOn();
    } else {
      this.clickToOff();
    }
    this.isLoading = true;
  }

  clickToOn() {
    if (this.isLoading || !this.isChecked) {
      return;
    }
    this.isChecked = true;
    this.brokerService.client?.publish(REQUEST_TOPIC, 'on');
    this.isLoading = true;
  }

  clickToOff() {
    if (this.isLoading || this.isChecked) {
      return;
    }
    this.isChecked = false;
    this.brokerService.client?.publish(REQUEST_TOPIC, 'off');
    this.isLoading = true;
  }
}
