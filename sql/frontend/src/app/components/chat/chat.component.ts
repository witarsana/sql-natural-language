import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from "@angular/core";
import { QueryService } from "../../services/query.service";
import { AuthService } from "../../services/auth.service";
import { Message } from "../../models/message.model";
import { UserRole } from "../../models/role.model";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild("messagesContainer") private messagesContainer!: ElementRef;

  messages: Message[] = [];
  currentQuestion = "";
  isLoading = false;
  currentRole: UserRole = UserRole.SALES;
  examples: any[] = [];
  showExamples = true;

  private shouldScroll = false;

  constructor(
    private queryService: QueryService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentRole$.subscribe((role) => {
      this.currentRole = role;
    });

    this.loadExamples();
    this.addWelcomeMessage();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  addWelcomeMessage(): void {
    const welcomeMessage: Message = {
      id: this.generateId(),
      type: "system",
      content:
        "Welcome to Chronicle Natural Language Query System! Ask me anything about plots, graves, sections, or statistics.",
      timestamp: new Date(),
    };
    this.messages.push(welcomeMessage);
    this.shouldScroll = true;
  }

  loadExamples(): void {
    this.queryService.getExamples().subscribe({
      next: (examples) => {
        this.examples = examples;
      },
      error: (error) => {
        console.error("Failed to load examples:", error);
      },
    });
  }

  sendMessage(): void {
    if (!this.currentQuestion.trim() || this.isLoading) {
      return;
    }

    const question = this.currentQuestion.trim();
    this.currentQuestion = "";
    this.showExamples = false;

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    this.messages.push(userMessage);
    this.shouldScroll = true;

    // Execute query
    this.isLoading = true;
    this.queryService.executeQuery(question, this.currentRole).subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.success && response.data) {
          const systemMessage: Message = {
            id: this.generateId(),
            type: "system",
            content: `Found ${response.data.rowCount} ${
              response.data.rowCount === 1 ? "result" : "results"
            }`,
            timestamp: new Date(),
            data: response.data,
            metadata: response.metadata,
          };
          this.messages.push(systemMessage);
        } else {
          const errorMessage: Message = {
            id: this.generateId(),
            type: "error",
            content: response.error || "Query failed",
            timestamp: new Date(),
          };
          this.messages.push(errorMessage);
        }
        this.shouldScroll = true;
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage: Message = {
          id: this.generateId(),
          type: "error",
          content:
            error.message || "Failed to execute query. Please try again.",
          timestamp: new Date(),
        };
        this.messages.push(errorMessage);
        this.shouldScroll = true;
      },
    });
  }

  useExample(query: string): void {
    this.currentQuestion = query;
    this.showExamples = false;
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleExamples(): void {
    this.showExamples = !this.showExamples;
  }

  clearChat(): void {
    this.messages = [];
    this.addWelcomeMessage();
    this.showExamples = true;
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error("Scroll error:", err);
    }
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
