import { Injectable } from '@angular/core';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatMemoryService {
  private readonly STORAGE_KEY = 'chronicle_chat_history';
  private readonly MAX_MESSAGES = 20; // Limit to prevent token overflow

  constructor() {}

  /**
   * Get conversation history from local storage
   */
  getHistory(): ChatMessage[] {
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to load chat history:', error);
      return [];
    }
  }

  /**
   * Add a message to the conversation history
   */
  addMessage(role: 'user' | 'assistant', content: string): void {
    try {
      const history = this.getHistory();
      
      history.push({
        role,
        content,
        timestamp: new Date().toISOString()
      });

      // Keep only recent messages to avoid token limits
      if (history.length > this.MAX_MESSAGES) {
        history.splice(0, history.length - this.MAX_MESSAGES);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save message to history:', error);
    }
  }

  /**
   * Get formatted context for AI (last N messages)
   */
  getContext(messageCount: number = 10): ChatMessage[] {
    const history = this.getHistory();
    // Return last N messages
    return history.slice(-messageCount);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
    }
  }

  /**
   * Get conversation summary for display
   */
  getConversationSummary(): string {
    const history = this.getHistory();
    if (history.length === 0) {
      return 'No conversation history';
    }
    return `${history.length} messages in this conversation`;
  }

  /**
   * Check if there's an active conversation
   */
  hasActiveConversation(): boolean {
    return this.getHistory().length > 0;
  }
}
