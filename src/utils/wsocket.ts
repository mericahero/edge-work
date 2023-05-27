export class WebSocketConnection {
    private socket!: WebSocket;
    private retry_times: number;
    private try_times : number=0;
    private onconnecting: ()=>void;
    private onconnected: () => void;
    private server_url: string;
    private connected: boolean = false;

    constructor(
        server_url: string, 
        retry_times: number = 3,
        onconnecting: ()=>void = ()=>{},
        onconnected: ()=>void = ()=>{},){
        this.server_url = server_url;
        this.retry_times = retry_times;
        this.onconnecting = onconnecting;
        this.onconnected = onconnected;
        this.socket= this.connect();
    }

    private connect = () => {
        this.onconnecting();
        let socket = new WebSocket(this.server_url);
        socket.onopen = this.onOpen;
        socket.onmessage = this.onMessage;
        socket.onclose = this.onClose;
        socket.onerror = this.onError;
        return socket
    }

    private isOpen = () => {
        return this.socket.readyState === this.socket.OPEN;
    }

    private onOpen = () => {
        console.log('已连接到WebSocket服务器');
        this.onconnected();
        this.connected = true;
        // 向服务器注册为控制端
        this.sendMsg(JSON.stringify({
            type: 'register',
            role: 'controller'
        }));
        // this.heartBeat()
    }

    private onMessage = (event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data);
            console.log('收到消息+++:', message);
        } catch (e) {
            try {
                const message = JSON.parse(event[Symbol.for('kData')]);
                console.log(message.type); // "command"
                console.log(message.command); // "short"
            } catch (e) {
                console.log('收到消息+++ raw:', event);
            }
        }
    }

    private onClose = () => {
        if(!this.close){
            if(this.try_times<this.retry_times){
                this.try_times++;
                this.socket = this.connect();
            }else{
                console.error('连接失败');
                this.try_times=0;
            }
        }
        console.log('连接已关闭');
    }

    private onError = (error: Event) => {
        console.error('发生错误：', error);
    }

    public close() {
        this.connected = false;
        // 关闭方法的实现
        this.socket.close()
    }

    public sendJumpAction(actionType: string) {
        const message = JSON.stringify({
            type: 'command',
            command: actionType
        });
        // 发送方法的实现，接受一个任意类型的参数 data
        this.sendMsg(message);
    }

    public sendMsg(msg: string) {
        console.log('发送消息：', msg)
        if (!this.isOpen()) {
            console.warn('WebSocket未连接，无法发送消息');
            this.connect();
            return;
        }
        this.socket.send(msg);
    }


    private heartBeatTimeout: NodeJS.Timeout | null = null;
    private heartBeat = () => {
        if (!this.connected) {
            return;
        }
        this.socket.send("ping");
        if (this.heartBeatTimeout) {
            clearTimeout(this.heartBeatTimeout);
        }else{
            this.heartBeatTimeout = setTimeout(() => {
                this.heartBeat();
            }, 1000)
        }
    }

}
