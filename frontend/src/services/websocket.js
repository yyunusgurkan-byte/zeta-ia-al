// frontend/src/services/websocket.js

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnecting = false;
  }

  /**
   * WebSocket bağlantısı kur
   */
  connect(url = null) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('WebSocket connection in progress');
      return;
    }

    this.isConnecting = true;
    
    const wsUrl = url || process.env.REACT_APP_WS_URL || 'ws://localhost:3001';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  /**
   * Bağlantı açıldığında
   */
  handleOpen(event) {
    console.log('WebSocket connected');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.emit('connected', { timestamp: new Date() });
  }

  /**
   * Mesaj geldiğinde
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      
      // Event type'a göre emit et
      if (data.type) {
        this.emit(data.type, data);
      }
      
      // Genel mesaj listener'ı
      this.emit('message', data);
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Hata oluştuğunda
   */
  handleError(error) {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
    this.emit('error', { error });
  }

  /**
   * Bağlantı kapandığında
   */
  handleClose(event) {
    console.log('WebSocket closed:', event.code, event.reason);
    this.isConnecting = false;
    this.emit('disconnected', { 
      code: event.code, 
      reason: event.reason 
    });
    
    // Otomatik yeniden bağlan
    if (event.code !== 1000) { // 1000 = normal closure
      this.handleReconnect();
    }
  }

  /**
   * Yeniden bağlanma
   */
  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      this.emit('reconnect_failed', { 
        attempts: this.reconnectAttempts 
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.emit('reconnecting', { 
      attempt: this.reconnectAttempts,
      delay 
    });

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Mesaj gönder
   */
  send(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, ...data });
      this.ws.send(message);
      console.log('WebSocket message sent:', type);
    } else {
      console.warn('WebSocket not connected. Message not sent:', type);
    }
  }

  /**
   * Event listener ekle
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Event listener kaldır
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;
    
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  /**
   * Event emit et
   */
  emit(event, data) {
    if (!this.listeners.has(event)) return;
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} listener:`, error);
      }
    });
  }

  /**
   * Bağlantıyı kapat
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }

  /**
   * Bağlantı durumunu kontrol et
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Ping gönder (connection keep-alive)
   */
  ping() {
    this.send('ping', { timestamp: Date.now() });
  }
}

// Singleton instance
const websocketService = new WebSocketService();

export default websocketService;