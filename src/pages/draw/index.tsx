import React, { useEffect, useRef, useState, Component, MouseEvent, PureComponent, RefObject } from 'react';
import { Button, Space, AutoCenter, List, SafeArea, Image, Toast } from 'antd-mobile'
import { WebSocketConnection } from '@/utils/wsocket';
import axios from 'axios'
import styles from './index.less'
import { render } from 'react-dom';

type Props = {};
// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default class Draw extends Component<Props> {
  private socket: WebSocketConnection;
  private canvasRef: RefObject<HTMLCanvasElement>;
  // private predictHistoryRef = useRef([])
  private needToastr: boolean;
  // 预设
  private isDrawing = false;

  constructor(props: Props) {
    super(props);
    this.canvasRef = React.createRef<HTMLCanvasElement>();
    let wss_server = "wss://service-2znrr803-1318170969.sh.apigw.tencentcs.com/release/"
    this.socket = new WebSocketConnection(wss_server, 3, this.onConnecting, this.onConnected)
    this.state = {
      predictHistory: [],
      useless: 0
    }
    this.needToastr = false;

  }


  componentDidMount() {
    console.log('run2')

    const canvas = this.cvs()
    canvas.addEventListener("mousedown", this.mouseDown.bind(this));
    canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    canvas.addEventListener("mouseup", this.mouseUp.bind(this));

    canvas.addEventListener("touchstart", this.touchStart.bind(this));
    canvas.addEventListener("touchmove", this.touchMove.bind(this));
    canvas.addEventListener("touchend", this.mouseUp.bind(this));
  }


  componentWillUnmount() {
    const canvas = this.cvs()
    canvas.removeEventListener("mousedown", this.mouseDown);
    canvas.removeEventListener("mousemove", this.mouseMove);
    canvas.removeEventListener("mouseup", this.mouseUp);

    canvas.removeEventListener("touchstart", this.touchStart);
    canvas.removeEventListener("touchmove", this.touchMove);
    canvas.removeEventListener("touchend", this.mouseUp);
    this.socket.close()
  }


  private cvs() {
    return this.canvasRef.current as unknown as HTMLCanvasElement;
  }

  private cvtx() {
    return this.cvs().getContext('2d');
  }







  private mouseDown(event) {
    const canvas = this.cvs()
    const ctx = this.cvtx()
    this.isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
  }

  private touchStart(event) {
    event.preventDefault();
    const canvas = this.cvs()
    const ctx = this.cvtx()
    this.isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
  };


  private mouseMove(event) {
    event.preventDefault();
    if (this.isDrawing) {
      const canvas = this.cvs()
      const ctx = this.cvtx()
      ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }
  }

  private touchMove(event) {
    event.preventDefault();
    const canvas = this.cvs()
    const ctx = this.cvtx()
    if (this.isDrawing) {

      ctx.lineTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
      ctx.stroke();
    }
  };

  private mouseUp(event) {

    this.isDrawing = false;
    this.predict()
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

  private predict() {
    const canvas = this.cvs();
    let dataUrl = canvas.toDataURL("image/png");
    let rawBase64 = dataUrl.replace(/data:image\/png;base64,/, '');

    axios({
      method: 'post',
      // url: 'http://139.196.157.136:5800/api/predict',
      url: 'https://47.102.133.7/api/predict',
      data: {
        "data": rawBase64
      },
      transformRequest: [
        function (data) {
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          ret = ret.substring(0, ret.lastIndexOf('&'));
          return ret
        }
      ],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then((response) => {
      console.log(JSON.stringify(response.data));
      let cur = {
        "img": dataUrl,
        "result": this.arrangePredicts(response.data.prediction)
      }
      this.setState({
        predictHistory: [cur, ...this.state.predictHistory]
      })
      this.clearCanvas()

      let longNames = [
        'pillow','octagon','necklace','hexagon','bracelet',
        'stitches','grass','beach','ant','animal','migration',
'sandwich','pillow','hedgehog','foot','bracelet',
'telephone','screwdriver','map','hexagon','drill',]
      // judge if cur.result array each item is in longNames
      let isLong = false
      for (let i = 0; i < cur.result.length; i++) {
        if (longNames.includes(cur.result[i].name)) {
          isLong = true
          break
        }
      }
      if (isLong) {
        this.sendJumpAction('long')
      }else{
        this.sendJumpAction('short')
      }

    }).catch((error) => {
      console.log(error);
    });
  }


  private arrangePredicts(prediction: {
    names: string[],
    numbers: number[]
  } = { names: [], numbers: [] }) {
    if (!prediction || !prediction.names || !prediction.numbers || prediction.names.length != prediction.numbers.length) {
      return []
    }

    let names = prediction.names;
    let numbers = prediction.numbers;
    let result = []
    for (let i = 0; i < names.length; i++) {
      result.push({
        name: names[i],
        number: numbers[i]
      })
    }
    // sort result by number
    result.sort((a, b) => {
      return b.number - a.number
    })
    return result

  }

  private sendJumpAction(actionType: string = 'short') {
    this.needToastr = true
    this.socket.sendJumpAction(actionType)
  }

  private clearCanvas() {
    // clear canvas content
    const canvas = this.cvs()
    const ctx = this.cvtx()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  render() {
    return (
      <AutoCenter className={styles.container}>
        <div>
          <canvas
            ref={this.canvasRef}
            width={300}
            height={300}
            style={{ backgroundColor: '#000' }}
          />
        </div>


        <div>
          <Space>
            <Button color="primary" size='small' onClick={() => this.predict()}>预测</Button>
            <Button color="primary" size='small' onClick={() => this.clearCanvas()}>清空</Button>
            <Button color="primary" size='small' onClick={() => this.sendJumpAction('short')}>小跳</Button>
            <Button color="primary" size='small' onClick={() => this.sendJumpAction('long')}>大跳</Button>
          </Space>
        </div>

        <div className={styles.prehis}>
          <List header='预测历史'>
            {this.state.predictHistory.map((item, index) => {
              return (
                <List.Item
                  key={index}
                  prefix={
                    <Image
                      src={item.img}
                      style={{ borderRadius: 20, background: '#333' }}
                      fit='cover'
                      width={40}
                      height={40}
                    />
                  }
                  title={
                    <ul>
                      {item.result.map((predict, index) => {
                        return (
                          <li key={index}>
                            <span>{predict.name}</span>
                          </li>
                        )
                      })}
                    </ul>
                  }
                // description={'abc'} 
                // extra='none' 
                />
              )
            })}
          </List>
        </div>
        <SafeArea position='bottom' />
      </AutoCenter>

    );
  }
}