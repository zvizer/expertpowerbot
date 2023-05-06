import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Message, ChatBotService } from './chat-bot.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewChecked {
  @ViewChild('messageContainer') mContainer: ElementRef;
  @ViewChild('userInput') uInput: ElementRef;

  public messages: Message[] = [];
  public value: string = '';
  public disableInput: boolean = false;

  private hasUserSaidBye: boolean = false;

  constructor(public chatBotService: ChatBotService) {}

  ngOnInit() {
    this.chatBotService.conversation.subscribe((val) => {
      this.messages = this.messages.concat(val);

      setTimeout(() => {
        if (!this.hasUserSaidBye) {
          this.disableInput = false;
          this.uInput.nativeElement.select();
        }
      }, 1000);
    });
  }

  ngAfterViewChecked() {
    this.mContainer.nativeElement.scrollTop =
      this.mContainer.nativeElement.scrollHeight;
  }

  sendMessage() {
    const lowCaseInput: string = this.value?.trim().toLowerCase();
    const byeRegex: RegExp = new RegExp(`\\bbye bye\\b`);

    if (!lowCaseInput || lowCaseInput.indexOf('_') === 0) {
      this.value = '';
      this.uInput.nativeElement.select();
      return;
    }
    if (lowCaseInput.search(byeRegex) >= 0) {
      this.hasUserSaidBye = true;
    }

    this.disableInput = true;
    this.chatBotService.getBotAnswer(lowCaseInput, this.value);
    this.value = '';
  }

  reset() {
    this.value = '';
    this.disableInput = false;
    this.messages = [];
    this.hasUserSaidBye = false;
    this.uInput.nativeElement.select();
  }
}
