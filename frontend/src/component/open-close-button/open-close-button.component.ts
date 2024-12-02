import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BrokerService } from '../../../service/broker.service';
import { CURTAIN_STATUS_TOPIC, REQUEST_TOPIC } from '@src/shared/topicNames';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Subject } from 'rxjs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-open-close-button',
  standalone: true,
  imports: [MatProgressSpinnerModule, NgClass, NgIf,FormsModule],
  templateUrl: './open-close-button.component.html',
  styleUrl: './open-close-button.component.css',
})
export class OpenCloseButtonComponent implements OnInit {
  // only subject of boolean
  @Input({ required: true }) subject!: Subject<boolean>;
  @Input({ required: true }) topicWhenClick!: string;
  @Input({ required: true }) requestStatusMessage!: string;
  isChecked = false;
  isLoading = true;

  constructor(public brokerService: BrokerService) {
  }

  ngOnInit(): void {
    this.subject.subscribe(
      (newValue: boolean) => {
        this.isLoading = false;
        this.isChecked = newValue;
      }
    );
    this.brokerService.client?.publish(REQUEST_TOPIC, this.requestStatusMessage!);
  }

  onclick() {
    if (this.isLoading) {
      this.isChecked = false;
      return;
    }
    this.isChecked = !this.isChecked;
    if (!this.isChecked) {
      this.clickToOn();
    } else {
      this.clickToOff();
    }
    // let message = this.isCheckedToMessage()
    // this.brokerService.client?.publish(REQUEST_TOPIC, message);
    this.isLoading = true;
  }

  clickToOn() {
    if (this.isLoading || this.isChecked) {
      return;
    }
    this.isChecked = true;
    this.brokerService.client?.publish(this.topicWhenClick, 'on');
    this.isLoading = true;
  }

  clickToOff() {
    if (this.isLoading || !this.isChecked) {
      return;
    }
    this.isChecked = false;
    this.brokerService.client?.publish(this.topicWhenClick, 'off');
    this.isLoading = true;
  }
}
