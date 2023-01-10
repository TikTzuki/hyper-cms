import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {AppComponent} from './app.component';
import {IMessage} from './imessage';

export class WebSocketAPI {
  webSocketEndPoint: string = 'http://localhost:8080/ws/connect';
  topic: string = '/topic/demoUser';
  stompClient: Stomp.Client;
  appComponent: AppComponent;

  constructor(appComponent: AppComponent) {
    this.appComponent = appComponent;
  }

  _connect() {
    console.log('Initialize WebSocket Connection');
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect({}, (frame)=>{
      _this.stompClient.subscribe(_this.topic, function(message:Stomp.Message) {
        _this.onMessageReceived(message);
      });
      _this.stompClient.send("/ws/chat.newUser", {}, JSON.stringify({
        sender : "this.appComponent.name",
        type : 'newUser'
      }))
    }, this.errorCallBack);
  };

  _onConnected(frame) {
    // this.stompClient.subscribe(this.topic, function(sdkEvent) {
    //   this.onMessageReceived(sdkEvent);
    // });
    console.log(this.stompClient)
    console.log(this.stompClient.send)
    this.stompClient.send("/ws/chat.newUser", {}, JSON.stringify({
      sender : this.appComponent.name,
      type : 'newUser'
    }))

  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect(null);
    }
    console.log('Disconnected');
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error) {
    console.log('errorCallBack -> ' + error);
    setTimeout(() => {
      this._connect();
    }, 5000);
  }

  /**
   * Send message to sever via web socket
   * @param {*} message
   */
  _send(message) {
    console.log('calling logout api via web socket');
    this.stompClient.send('/ws/chat.sendMessage', {}, JSON.stringify(message));
  }

  onMessageReceived(message:Stomp.Message) {
    console.log('Message Recieved from Server :: ' + message);
    console.log(typeof message)
    this.appComponent.handleMessage(JSON.stringify(message.body));
  }
}
