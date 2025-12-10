import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from "@angular/core";
import { QueryService } from "../../services/query.service";
import { Message } from "../../models/message.model";

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
  examples: any[] = [];
  showExamples = true;
  pendingQuestion: string | null = null; // Track original question when waiting for clarification

  private shouldScroll = false;

  constructor(private queryService: QueryService) {}

  ngOnInit(): void {
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

    let question = this.currentQuestion.trim();
    this.currentQuestion = "";
    this.showExamples = false;

    // If we have a pending question (from clarification), combine them
    if (this.pendingQuestion) {
      question = `${this.pendingQuestion} at ${question}`;
      this.pendingQuestion = null; // Clear pending question
    }

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
    this.queryService.executeQuery(question).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Handle clarification requests
        if (response.needsClarification && response.clarificationPrompt) {
          // Store the original question for later
          this.pendingQuestion = question;

          const clarificationMessage: Message = {
            id: this.generateId(),
            type: "clarification",
            content: response.clarificationPrompt,
            timestamp: new Date(),
            missingContext: response.missingContext,
          };
          this.messages.push(clarificationMessage);
          this.shouldScroll = true;
          return;
        }

        if (response.success && response.data) {
          // Use AI explanation if available, otherwise use default message
          const content =
            response.metadata.explanation ||
            `Found ${response.data.rowCount} ${
              response.data.rowCount === 1 ? "result" : "results"
            }`;

          const systemMessage: Message = {
            id: this.generateId(),
            type: "system",
            content: content,
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

  onSuggestionClick(suggestion: string): void {
    this.currentQuestion = suggestion;
    // Auto-send if it's not "All cemeteries" which needs the original question
    if (this.pendingQuestion && suggestion !== "All cemeteries") {
      this.sendMessage();
    }
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
    this.pendingQuestion = null; // Clear pending question on chat clear
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
