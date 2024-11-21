import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
@Injectable({
  providedIn: 'root',
})
export class FlowbiteService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  loadFlowbite(callback: (flowbite: any) => void) {
    console.log('TEST TEST');
    if (isPlatformBrowser(this.platformId)) {
      console.log('In browser');
      import('flowbite').then((flowbite) => {
        callback(flowbite);
      });
    }
  }
}
