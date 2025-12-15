import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { ChatComponent } from "../components/chat/chat.component";

@Component({
  selector: "cl-chloe-assist",
  templateUrl: "./chloe-assist.component.html",
  styleUrl: "./chloe-assist.component.css",
})
export class ChloeAssistComponent implements OnInit, OnChanges {
  @Input("api-url") apiUrl: string = "";
  @Input("current-question") currentQuestion: string = "";
  @Input("click-send") clickSend: boolean = false;
  @ViewChild(ChatComponent) chatComponent!: ChatComponent;

  get isLoading(): boolean {
    return this.chatComponent ? this.chatComponent.isLoading : false;
  }

  ngOnInit() {
    if (this.apiUrl) {
      console.log("Chloe Assist initialized with API URL:", this.apiUrl);
      console.log(
        "Chloe Assist initialized with Current Question:",
        this.currentQuestion
      );
      console.log("Chloe Assist initialized with Click Send:", this.clickSend);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["clickSend"] && this.clickSend) {
      this.sendMessage();
    }
  }

  sendMessage(): void {
    if (!this.currentQuestion.trim() || this.isLoading) {
      return;
    }

    if (this.chatComponent) {
      this.chatComponent.currentQuestion = this.currentQuestion;
      this.chatComponent.sendMessage();
    }
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
