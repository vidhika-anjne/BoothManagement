import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let connected = false;
const subscribers = {};

export const websocketService = {
  connect: (onConnected) => {
    if (connected) {
      if (onConnected) onConnected();
      return;
    }

    const socket = new SockJS('http://localhost:8081/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;

    stompClient.connect({}, () => {
      connected = true;
      console.log('WebSocket Connected');
      if (onConnected) onConnected();
    }, (err) => {
      console.error('WebSocket Error:', err);
      connected = false;
      // Reconnect after 5s
      setTimeout(() => websocketService.connect(onConnected), 5000);
    });
  },

  subscribe: (topic, callback) => {
    const internalSubscribe = () => {
      if (!stompClient || !stompClient.connected) {
        // Queue fallback if somehow called directly without check
        setTimeout(internalSubscribe, 500);
        return;
      }
      if (subscribers[topic]) {
        subscribers[topic].unsubscribe();
      }
      subscribers[topic] = stompClient.subscribe(topic, (msg) => {
        try {
          callback(msg.body.startsWith('{') ? JSON.parse(msg.body) : msg.body);
        } catch {
          callback(msg.body);
        }
      });
    };

    if (connected && stompClient && stompClient.connected) {
      internalSubscribe();
    } else {
      websocketService.connect(() => internalSubscribe());
    }

    return () => {
      if (subscribers[topic]) {
        subscribers[topic].unsubscribe();
        delete subscribers[topic];
      }
    };
  },

  disconnect: () => {
    if (stompClient && connected) {
      stompClient.disconnect();
    }
    connected = false;
  }
};
