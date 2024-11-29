import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  recognition: any | undefined;
  text = '';
  tempWords = '';

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (isPlatformBrowser(platformId)) {
      // console.log(window.webkitSpeechRecognition)
      if (window.SpeechRecognition == undefined && window.webkitSpeechRecognition == undefined) {
        alert(
          "Your browser doesn't support Speech Recognition"
        );
        return;
      }
      this.recognition = new window.webkitSpeechRecognition();

      this.recognition.lang = "en-US";
      this.recognition.onresult = (event: any) => {
        console.log(event.results)
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        this.tempWords = transcript;
        console.log(event.results)
        console.log('temp:', transcript);
      };

      this.recognition.onend = () => {
        console.log('recognition ended');
        this.recognition!.start();
      };

      this.recognition.onerror = (err: any) => {
        console.log('error',err);
      };

      this.recognition.start();
    }
  }
}
