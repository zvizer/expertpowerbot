import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpService } from './http.service';
import { first } from 'rxjs/operators';

export class Message {
  constructor(public author: string, public content: string) {}
}

@Injectable()
export class ChatBotService {
  constructor(private httpService: HttpService) {}

  public conversation = new Subject<Message[]>();
  private beyMassages: any[] = [];
  private isWaitForCityName: boolean = false;

  getBotAnswer(msg: string, origUsrInput: string) {
    const userMessage = new Message('user', origUsrInput);
    this.conversation.next([userMessage]);

    if (this.isWaitForCityName) {
      this.isWaitForCityName = false;
      this.getWeather(msg);
      return;
    }

    const botMessage = new Message(
      'bot',
      this.getBotMessage(msg, origUsrInput)
    );

    if (botMessage?.content) {
      setTimeout(() => {
        this.conversation.next([botMessage]);
      }, 1000);
    }
  }

  public getBotMessage(question: string, origUsrInput: string): string {
    const byeRegex: RegExp = new RegExp(`\\bbye bye\\b`);
    const dayRegex: RegExp = new RegExp(`\\bday\\b`);
    const timeRegex: RegExp = new RegExp(`\\btime\\b`);
    const weatherRegex: RegExp = new RegExp(`\\bweather\\b`);

    let answer: string = '';
    switch (true) {
      case question.search(byeRegex) >= 0:
        this.getRandomBye();
        answer = '';
        break;
      case question.search(dayRegex) >= 0:
        answer = this.getCurrentDay();
        break;
      case question.search(timeRegex) >= 0:
        const time: Date = new Date();
        answer = this.getCurrentTime();
        break;
      case question.search(weatherRegex) >= 0:
        this.isWaitForCityName = true;
        answer = 'For which city?';
        break;
      default:
        answer = this.getReverseString(origUsrInput);
    }

    return answer;
  }

  private getCurrentDay(): string {
    const weekday = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const date = new Date();
    return weekday[date.getDay()];
  }

  private getCurrentTime(): string {
    const time: Date = new Date();
    return (
      ('0' + time.getHours()).slice(-2) +
      ':' +
      ('0' + time.getMinutes()).slice(-2)
    );
  }

  private getReverseString(str: string) {
    return str.split('').reverse().join('');
  }

  private getRandomBye(): void {
    const randomNum: number = Math.floor(Math.random() * 100);
    let randomByeMsg: string = '';
    if (this.beyMassages.length) {
      randomByeMsg =
        'Bye bye and remember: "' + this.beyMassages[randomNum]?.text + '"';
      const botMessage = new Message('bot', randomByeMsg);
      this.conversation.next([botMessage]);
    } else {
      this.httpService
        .getByeBye()
        .pipe(first())
        .subscribe((response: any) => {
          randomByeMsg =
            'Bye bye and remember: "' + response[randomNum]?.text + '"';
          const botMessage = new Message('bot', randomByeMsg);
          this.conversation.next([botMessage]);
          this.beyMassages = response;
        });
    }
  }

  private getWeather(city: string) {
    let botMessage: Message;
    this.httpService
      .getWeather(city)
      .pipe(first())
      .subscribe({
        next: (response: any) => {
          const weather: string =
            city + ' temperature is ' + response['main']['temp'] + 'º';
          botMessage = new Message('bot', weather);
          this.conversation.next([botMessage]);
        },
        error: (error) => {
          const errMsg: string = 'I do not know city name: ' + city;
          botMessage = new Message('bot', errMsg);
          this.conversation.next([botMessage]);
        },
      });
  }
}
