import React, { Component } from "react";
import { AutoCenter, Button, List, Space, Toast } from 'antd-mobile';
import { WebSocketConnection } from '@/utils/wsocket';
import styles from './index.less'
const isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
class CircleView extends Component {
  private socket: WebSocketConnection;
  private svg_height: number = 300;
  private svg_width: number = 300;
  private jumpTimer: any = null;
   private needToastr: boolean;

  constructor(props) {
    super(props);

    let wss_server = "wss://service-2znrr803-1318170969.sh.apigw.tencentcs.com/release/"
    this.socket = new WebSocketConnection(wss_server, 3, this.onConnecting, this.onConnected)
    this.needToastr = false;
        this.state = {
      positions: [[0, 0]],
      direction: "", // 保存转动方向的状态
      threshold: 5, // 转动角度阈值
      circleHistory: []
    };
  }

  componentDidMount() {
    if (isiOS && window.DeviceMotionEvent.requestPermission) {
      this.beginMove()
    }
  }

  componentWillUnmount() {
    window.removeEventListener("devicemotion", this.handleMobileMove.bind(this));
  }


  beginMove = () => {
    if (isiOS && window.DeviceMotionEvent.requestPermission) {
      window.DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
          // 添加监听事件
          window.addEventListener("devicemotion", this.handleMobileMove.bind(this));
        } else {
          console.log(response);
        }
      })
    } else {
      window.addEventListener("devicemotion", this.handleMobileMove.bind(this));
    }
  }

  handleMobileMove = (event) => {
    const { x: acc_x, y: acc_y, z: acc_z } = event.acceleration

    const thres_acc = 5
    if (Math.abs(acc_x) <= thres_acc && Math.abs(acc_y) <= thres_acc && Math.abs(acc_z) <= thres_acc) {
      return
    }
    // console.log(acc_x, acc_y, acc_z)

    const { beta, gamma } = event.rotationRate;

    const { positions } = this.state;

    if (beta !== null && gamma !== null) {
      const x = gamma;
      const y = beta;
      const r = this.svg_height / 2;
      const centerX = window.innerWidth / 2;
      const centerY = this.svg_height / 2;
      const radians = (x / 180) * Math.PI;
      const x0 = centerX + r * Math.cos(radians);
      const y0 = centerY + r * Math.sin(radians);


      let direction = "";
      if (positions.length >= 2) {
        const [prevX, prevY] = positions[positions.length - 1];
        const deltaX = x0 - prevX;
        const deltaY = y0 - prevY;
        const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
        // const rotation = (angle + 360) % 360;

        const crossProduct = deltaX * y - x * deltaY;
        const clockwise = crossProduct < 0;
        direction = clockwise ? "顺时针" : "逆时针";
        // if (rotation > threshold && rotation < (360 - threshold)) {
        //   direction = "顺时针";
        // } else if (rotation < (360 - threshold) && rotation > threshold) {
        //   direction = "逆时针";
        // }
        if (this.jumpTimer) {
          clearTimeout(this.jumpTimer)
        }
        this.jumpTimer = setTimeout(() => {
          this.jumpTimer = null
          this.socket.sendJumpAction(clockwise? 'short': 'long')
          this.setState(prevState => ({
            circleHistory: [direction, ...prevState.circleHistory],
          }));
        }, 500)
      }

      this.setState(prevState => ({
        positions: [...prevState.positions, [x0, y0]],
        direction
      }));
      console.log(direction);
    }
  }


  private onConnecting() {
    if (!this.needToastr) return
    Toast.show({
      icon: 'fail',
      content: '已断线，连接中...',
    })
    this.needToastr = false
  }

  private onConnected() {
    if (!this.needToastr) return
    Toast.show({
      icon: 'success',
      content: '已连接',
    })
    this.needToastr = false
  }

  render() {
    const { positions } = this.state;
    const posLen = positions.length;

    return (
      <AutoCenter className={styles.container}>
        <div>
          <svg width={this.svg_width} height={this.svg_height} style={{ background: '#000' }}>
            <circle cx={positions[posLen - 1]?.[0]} cy={positions[posLen - 1]?.[1]} r="8" fill="white" />
            {/* <path
            d={`M ${positions[0]} ${positions.map((pos) => `L ${pos}`)}`}
            stroke="white"
            fill="transparent"
          /> */}
          </svg>
        </div>
        <div>
          <Button
            color="primary"
            size='small'
            onClick={this.beginMove}
          >开始</Button>
        </div>

        <div className={styles.prehis}>
          <List header='预测历史'>
            {this.state.circleHistory.map((item, index) => {
              return (
                <List.Item
                  key={index}
                  title={item}

                // description={'abc'} 
                // extra='none' 
                />
              )
            })}
          </List>
        </div>
      </AutoCenter>
    );
  }
}

export default CircleView;
