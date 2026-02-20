import * as signalR from '@microsoft/signalr';
import { API_CONFIG } from '../constants/api';

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

class ChatService {
  private connection: signalR.HubConnection | null = null;
  private onMessageCallback: ((reply: string, timestamp: string) => void) | null = null;
  private onTypingCallback: ((isTyping: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_CONFIG.BASE_URL}/chathub`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    // Event listeners
    this.connection.on('ReceiveMessage', (reply: string, timestamp: string) => {
      this.onMessageCallback?.(reply, timestamp);
    });

    this.connection.on('ReceiveTyping', (isTyping: boolean) => {
      this.onTypingCallback?.(isTyping);
    });

    this.connection.on('ReceiveError', (error: string) => {
      this.onErrorCallback?.(error);
    });

    await this.connection.start();
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  async sendMessage(deviceId: string, message: string, history?: ChatMessage[]): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error('SignalR bağlantısı yok');
    }

    const formattedHistory = history?.map(h => ({
      role: h.role,
      content: h.content,
    })) ?? null;

    await this.connection.invoke('SendMessage', deviceId, message, formattedHistory);
  }

  onMessage(callback: (reply: string, timestamp: string) => void): void {
    this.onMessageCallback = callback;
  }

  onTyping(callback: (isTyping: boolean) => void): void {
    this.onTypingCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  get isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

export const chatService = new ChatService();
