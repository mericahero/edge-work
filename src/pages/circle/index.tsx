import React, { useState, useEffect } from "react";
import { Button, Space } from 'antd-mobile'
var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否为 iOS

function CircleView() {
  const [positions, setPositions] = useState([]);

    const beginMove = () => {
        if(isiOS){
    window.DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
              // 添加监听事件
    window.addEventListener("devicemotion", handleMobileMove);
        } else {
          console.log(response);
        }

      })
    }else{
            window.addEventListener("devicemotion", handleMobileMove);

    }
  }

  // 监听手机移动事件，将坐标添加到轨迹数组中
  function handleMobileMove(event) {
    const { beta, gamma } = event.rotationRate;
    // console.log(beta,gamma)
    if (beta !== null && gamma !== null) {
      const x = gamma; // gamma轴的旋转角度代表左右晃动
      const y = beta; // beta轴的旋转角度代表前后晃动
      const r = 100; // 半径
      const centerX = window.innerWidth / 2; // 圆心横坐标
      const centerY = window.innerHeight / 2; // 圆心纵坐标
      const radians = (x / 180) * Math.PI; // 角度转弧度
      const x0 = centerX + r * Math.cos(radians); // 圆周上的点的横坐标
      const y0 = centerY + r * Math.sin(radians); // 圆周上的点的纵坐标
      setPositions([...positions, [x0, y0]]);
      console.log(x0,y0)
    }
  }

  useEffect(() => {
    // 添加监听事件
    // window.addEventListener("devicemotion", handleMobileMove);

    // 卸载组件时移除监听事件
    // return () => {
    //   window.removeEventListener("devicemotion", handleMobileMove);
    // };
  }, [positions]);

  return (
    <>
          <Button
        color="primary"
        size='small'
        onClick={beginMove}
      >开始</Button>
    <svg width={window.innerWidth} height={window.innerHeight}>
      <circle cx={positions[0]?.[0]} cy={positions[0]?.[1]} r="5" fill="red" />
      <path
        d={`M ${positions[0]} ${positions.map((pos) => `L ${pos}`)}`}
        stroke="red"
        fill="transparent"
      />
    </svg>
    </>
  );
}

export default CircleView;