import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-open-close-button',
  standalone: true,
  imports: [],
  templateUrl: './open-close-button.component.html',
  styleUrl: './open-close-button.component.css'
})
export class OpenCloseButtonComponent {
  isChecked = false;

  click() {
    this.isChecked = !this.isChecked;
  }
}
