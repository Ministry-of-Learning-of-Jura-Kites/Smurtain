import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VoiceRecognitionService {
  isSupported = true;
  commandSubject: Subject<CommandEvent> = new Subject();
  recognition: any | undefined;
  text = '';
  smutainList = [
    'smirton',
    'smirtain',
    'some will turn',
    'summer turn',
    'smilton',
    'smitten',
    'certain',
    'sumatra',
    'smirting'
  ];

  isSmurtainOn(smurtainWord: string) {
    return this.text.includes(smurtainWord + ' on');
  }

  isSmurtainOff(smurtainWord: string) {
    return this.text.includes(smurtainWord + ' off');
  }

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (isPlatformBrowser(platformId)) {
      console.log("constuct")
      // console.log(window.webkitSpeechRecognition)
      if (
        window.SpeechRecognition == undefined &&
        window.webkitSpeechRecognition == undefined
      ) {
        this.isSupported=false;
        return;
      }
      this.recognition = new window.webkitSpeechRecognition();

      this.recognition.lang = 'en-US';
      this.recognition.onresult = (event: any) => {
        console.log(event.results);
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('')
          .toLowerCase();

        this.text += ' ' + transcript;
        console.log('text:', this.text);
        if (this.smutainList.some(this.isSmurtainOn.bind(this))) {
          console.log('on!');
          this.commandSubject.next('on');
          this.text = '';
        } else if (this.smutainList.some(this.isSmurtainOff.bind(this))) {
          console.log('off!');
          this.commandSubject.next('off');
          this.text = '';
        } else if (this.text.length > 50) {
          let splitted = this.text.split(' ');
          this.text =
            splitted.slice(Math.max(splitted.length - 5, 0)).join(' ') || '';
        }
      };

      this.recognition.onend = () => {
        console.log('recognition ended');
        this.recognition!.start();
      };

      this.recognition.start();
    }
  }
}

type CommandEvent = "on"|"off"