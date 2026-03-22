import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

let stompClient = null;
let connected = false;
let reconnectTimer = null;
const subscribers = {};

export function connectWebSocket(onDashboard, onFeedback) {
  if (connected) return;

  try {
    const socket = new SockJS('http://localhost:8081/ws');
    stompClient = Stomp.over(socket);
    if (stompClient) {
      stompClient.debug = null; // silence STOMP debug logs
    } else {
      console.warn('Stomp.over(socket) returned null');
      return;
    }

    stompClient.connect({}, () => {
      connected = true;
      clearInterval(reconnectTimer);

      if (onDashboard) {
        subscribers['/topic/dashboard'] = stompClient.subscribe('/topic/dashboard', (msg) => {
          try { onDashboard(JSON.parse(msg.body)); } catch (e) { /* ignore */ }
        });
      }
      if (onFeedback) {
        subscribers['/topic/feedback'] = stompClient.subscribe('/topic/feedback', (msg) => {
          try { onFeedback(JSON.parse(msg.body)); } catch (e) { /* ignore */ }
        });
      }
    }, () => {
      connected = false;
    });
  } catch (e) {
    connected = false;
  }
}

export function disconnectWebSocket() {
  if (stompClient && connected) {
    try { stompClient.disconnect(); } catch (e) { /* ignore */ }
  }
  connected = false;
  if (reconnectTimer) clearInterval(reconnectTimer);
}

export function isConnected() {
  return connected;
}
