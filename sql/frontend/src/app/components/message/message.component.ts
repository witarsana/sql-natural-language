import { Component, Input } from "@angular/core";
import { Message } from "../../models/message.model";

@Component({
  selector: "app-message",
  templateUrl: "./message.component.html",
  styleUrls: ["./message.component.css"],
})
export class MessageComponent {
  @Input() message!: Message;

  showSQL = false;

  toggleSQL(): void {
    this.showSQL = !this.showSQL;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatExecutionTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }
}
