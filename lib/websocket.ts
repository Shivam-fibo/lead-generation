import { useEffect, useRef, useCallback, useState } from 'react';

let token;
if (typeof window !== 'undefined') {
  token = localStorage.getItem("authToken")
}

// Convert HTTP URL to WebSocket URL  
// const WS_BASE_URL = `wss://satyasankalpdevelopers-ai-voice-agent-1.onrender.com/ws?token=${token}`;

// const WS_BASE_URL = `ws://localhost:8001/`; // local

// const WS_BASE_URL = `wss://cd42-2409-4080-9db4-4b8a-889b-f78b-62a-2b0c.ngrok-free.app/test-websocket`; 

// const WS_BASE_URL = `wss://b961-2409-4080-901d-15c8-edc1-7086-5a20-7dff.ngrok-free.app/ws?token=${token}`; 

console.log('process.env.WS_BASE_URL_VAR', process.env.WS_BASE_URL_VAR)

const WS_BASE_URL = `${process.env.WS_BASE_URL_VAR}/ws?token=${token}`;

console.log('WS_BASE_URL', WS_BASE_URL)

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 3000;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private connectionStatusListeners: Set<(isConnected: boolean) => void> = new Set();
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  private notifyConnectionStatusListeners() {
    this.connectionStatusListeners.forEach(listener => listener(this.isConnected));
  }

  private connect() {
    try {
      this.ws = new WebSocket(WS_BASE_URL);

      this.ws.onopen = () => {
        // console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.notifyConnectionStatusListeners();
      };

      this.ws.onmessage = (event) => {
        try {
          const jsonData = JSON.parse(event.data);
          const { type, payload, data } = jsonData;

          console.log('jsonData', jsonData)
          
          this.listeners.forEach(callbacks => {
            callbacks.forEach(callback => callback(jsonData));
          });

          // if (type && this.listeners.has(type)) {
          //   // this.listeners.get(type)?.forEach(callback => callback(data)); // local
          //   this.listeners.get(type)?.forEach(callback => callback(jsonData)); // stage
          // }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        // console.log('WebSocket disconnected');
        this.isConnected = false;
        this.notifyConnectionStatusListeners();
        // this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.notifyConnectionStatusListeners();
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnected = false;
      this.notifyConnectionStatusListeners();
      // this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectTimeout);
    }
  }

  public subscribe(event: string, callback: (data: any) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  public unsubscribe(event: string, callback: (data: any) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  public send(type: string, payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.notifyConnectionStatusListeners();
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public addConnectionStatusListener(listener: (isConnected: boolean) => void) {
    this.connectionStatusListeners.add(listener);
    // Immediately notify the new listener of current status
    listener(this.isConnected);
  }

  public removeConnectionStatusListener(listener: (isConnected: boolean) => void) {
    this.connectionStatusListeners.delete(listener);
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

// Custom hook for using WebSocket
export function useWebSocket(event: string, callback: (data: any) => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleMessage = (data: any) => {
      // Console log the message received
      console.log(`WebSocket message received for event "${event}":`, data);

      callbackRef.current(data);
    };

    console.log(`Subscribing to WebSocket event: "${event}"`);
    websocketService.subscribe(event, handleMessage);

    return () => {
      console.log(`Unsubscribing from WebSocket event: "${event}"`);
      websocketService.unsubscribe(event, handleMessage);
    };
  }, [event]);

  const send = useCallback((payload: any) => {
    websocketService.send(event, payload);
  }, [event]);

  return { send };
}

// Custom hook for monitoring WebSocket connection status
export function useWebSocketConnection() {
  const [isConnected, setIsConnected] = useState(websocketService.getConnectionStatus());

  setTimeout(() => {
    const check = websocketService.getConnectionStatus();
    console.log('check', check)
  }, 1000);

  useEffect(() => {
    const handleConnectionStatus = (status: boolean) => {
      setIsConnected(status);
    };

    websocketService.addConnectionStatusListener(handleConnectionStatus);

    return () => {
      websocketService.removeConnectionStatusListener(handleConnectionStatus);
    };
  }, []);

  return { isConnected };
}

export default websocketService; 