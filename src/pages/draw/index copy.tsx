import { useEffect, useRef, useState, Component, MouseEvent } from 'react';
import { Button, Space, AutoCenter, List, SafeArea, Image, Toast } from 'antd-mobile'
import { WebSocketConnection } from '@/utils/wsocket';
import axios from 'axios'
import styles from './index.less'

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function Draw() {
  const canvasRef = useRef(null);
  let wss_server = "wss://service-2znrr803-1318170969.sh.apigw.tencentcs.com/release/"

  let socket: WebSocketConnection = new WebSocketConnection(wss_server, 3, onConnecting, onConnected);
  let [predictHistory, setPredictHistory] = useState([])
  let [useless, setUseless] = useState(0)
  let predictHistoryRef = useRef([])
  let needToastr = false

  console.log('run1')
  const cvs = () => {
    return canvasRef.current as unknown as HTMLCanvasElement;
  }

  const cvtx = () => {
    return cvs().getContext('2d');
  }

  useEffect(() => {
    console.log('run2')
    const canvas = cvs()
    const ctx = cvtx()
    // 预设
    let isDrawing = false;
    let mouseDown = (event) => {
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    }

    let touchStart = event => {
      event.preventDefault();
      isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
    };

    let mouseMove = event => {
      event.preventDefault();
      if (isDrawing) {
        ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
      }
    }

    let touchMove = event => {
      event.preventDefault();
      if (isDrawing) {
        ctx.lineTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
        ctx.stroke();
      }
    };

    let mouseUp = (event) => {
      // predict()
      isDrawing = false;
    }
    canvas.addEventListener("mousedown", mouseDown);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("mouseup", mouseUp);

    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", mouseUp);
    return () => {
      canvas.removeEventListener("mousedown", mouseDown);
      canvas.removeEventListener("mousemove", mouseMove);
      canvas.removeEventListener("mouseup", mouseUp);

      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchmove", touchMove);
      canvas.removeEventListener("touchend", mouseUp);
      socket.close()
    }
  }, [useless])


  function onConnecting() {
    if (!needToastr) return
    Toast.show({
      icon: 'fail',
      content: '已断线，连接中...',
    })
    needToastr = false
  }

  function onConnected() {
    if (!needToastr) return
    Toast.show({
      icon: 'success',
      content: '已连接',
    })
    needToastr = false
  }

  function predict() {
    let dataUrl = cvs().toDataURL("image/png");
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
        "result": arrangePredicts(response.data.prediction)
      }
      predictHistoryRef.current= [cur, ...predictHistoryRef.current]
      setPredictHistory([cur, ...predictHistory])
      clearCanvas()
    }).catch((error) => {
      console.log(error);
    });
  }


  function arrangePredicts(prediction: {
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

  function sendJumpAction(actionType: string = 'short') {
    needToastr = true
    socket.sendJumpAction(actionType)
  }

  function clearCanvas() {
    // clear canvas content
    const canvas = cvs()
    const ctx = cvtx()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }


  return (
    <AutoCenter className={styles.container}>
      <div>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{ backgroundColor: '#000' }}
        />
      </div>


      <div>
        <Space>
          <Button color="primary" size='small' onClick={predict}>预测</Button>
          <Button color="primary" size='small' onClick={clearCanvas}>清空</Button>
          <Button color="primary" size='small' onClick={() => sendJumpAction('short')}>小跳</Button>
          <Button color="primary" size='small' onClick={() => sendJumpAction('long')}>大跳</Button>
        </Space>
      </div>

      <div className={styles.prehis}>
        <List header='预测历史'>
          {predictHistory.map((item, index) => {
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