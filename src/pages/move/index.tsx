import { useEffect, useRef, Component } from 'react';
import { Button, Space } from 'antd-mobile'
import debounce from 'lodash/debounce';
import * as THREE from 'three';

var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否为 iOS

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);

  var handleMotion,handleOrientation
  const beginMove = () => {
    window.DeviceMotionEvent.requestPermission().then(response => {
        if (response === 'granted') {
          beginCaptureMove()
        } else {
          console.log(response);
        }
      })
  }

  const endMove = () => {
    endCaptureMove()
  }


let [vX, vY, vZ] = [0, 0, 0];

setInterval(() => {
  console.log(vX, vY, vZ)
}, 1000)
  const beginCaptureMove = () => {
    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    // 预设

    const realWorldMoveRange = { x: 2, y: 2, z: 2, }
    const [thresholdAccelarate, thresholdDistance] = [1, 0]

    let [posX, posY] = [canvas.width / 2, canvas.height / 2];
    let [lastPosX, lastPosY] = [posX, posY];
    

    let rotation = new THREE.Matrix4();
    let deviceRotation = new THREE.Matrix4();

    function convertToWorldCoord(x: number, y: number, z: number) {
      let vector = new THREE.Vector3(x, y, z);
      // vector.applyMatrix4(rotation);
      vector.applyMatrix4(deviceRotation);
      return vector;
    }

    const animate = () => {
      if (ctx === null) return
      // if (ctx === null || ( Math.abs(posX - lastPosX) < 0.01 && Math.abs(posY - lastPosY) < 0.01 )) {
      //   requestAnimationFrame(animate);
      //   return
      // }
      // ctx.beginPath();
      console.log(posX,posY)
      ctx.lineTo(posX, posY);
      ctx.stroke();

      [lastPosX, lastPosY] = [posX, posY]
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    const handleMotion = (e: DeviceMotionEvent) => {
        if (e.rotationRate?.alpha && e.rotationRate?.beta && e.rotationRate?.gamma) {
        let alpha = THREE.MathUtils.degToRad(e.rotationRate.alpha);
        let beta = THREE.MathUtils.degToRad(e.rotationRate.beta);
        let gamma = THREE.MathUtils.degToRad(e.rotationRate.gamma);
        rotation = new THREE.Matrix4();
        rotation.makeRotationFromEuler(new THREE.Euler(beta, alpha, -gamma));
      }

      let s_interval = e.interval/(isiOS?1:1000);
      const s2 = s_interval * s_interval;

      // 计算 x、y、z 轴上的加速度
      let { x, y, z } = e.accelerationIncludingGravity;
      // 将加速度向量转换为世界坐标系中的向量
      // const vector = convertToWorldCoord(x, y, z);
      // [x, y, z] = [vector.x, vector.y, vector.z];

      // 计算真实的移动距离
      const deltaDistance = {
        x: x <= thresholdAccelarate ? 0 : (vX * s_interval + 0.5 * x * s2),
        y: y <= thresholdAccelarate ? 0 : (vY * s_interval + 0.5 * y * s2),
        z: z <= thresholdAccelarate ? 0 : (vZ * s_interval + 0.5 * z * s2),
      }

      // 更新速度
      vX += x * s_interval;
      vY += y * s_interval;
      vZ += z * s_interval;

      if(deltaDistance.x === 0 && deltaDistance.y === 0 && deltaDistance.z === 0) return
      

      // 将真实的移动距离转换为画布上的距离
      const canvasMoveDistance = {
        x: deltaDistance.x <= thresholdDistance ? 0 : canvas.width * deltaDistance.x / realWorldMoveRange.x,
        y: deltaDistance.y <= thresholdDistance ? 0 : canvas.height * deltaDistance.y / realWorldMoveRange.y,
        z: deltaDistance.z <= thresholdDistance ? 0 : canvas.height * deltaDistance.z / realWorldMoveRange.z,
      }

      console.log(JSON.stringify({x,y,z,vX,vY,vZ,deltaDistance,canvasMoveDistance},null,2))
      posX += canvasMoveDistance.x;
      posY += canvasMoveDistance.z;
    };


    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha && e.beta && e.gamma) {
        let alpha = THREE.MathUtils.degToRad(e.alpha);
        let beta = THREE.MathUtils.degToRad(e.beta);
        let gamma = THREE.MathUtils.degToRad(e.gamma);
        deviceRotation = new THREE.Matrix4();
        deviceRotation.makeRotationFromEuler(new THREE.Euler(beta, alpha, -gamma));
      }
    }


    // const wraped = debounce(handleMotion, 12);

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);
  }

  const endCaptureMove = () => {
    window.removeEventListener('devicemotion', handleMotion);
    window.removeEventListener('deviceorientation', handleOrientation);
  }


  return (
    <>
      <Button
        color="primary"
        size='small'
        onClick={beginMove}
      >开始</Button>
      <Button
        color="primary"
        size='small'
        onClick={endMove}
      >结束</Button>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{ backgroundColor: '#bbb' }}
      />
    </>
  );
}