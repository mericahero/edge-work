import { useEffect, useRef, Component } from 'react';
import debounce from 'lodash/debounce';

import * as THREE from 'three';

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);
  let rotation = new THREE.Matrix4();
  let deviceRotation = new THREE.Matrix4();

  function convertToWorldCoord(x:number, y:number, z:number) {
    let vector = new THREE.Vector3(x, y, z);
    vector.applyMatrix4(rotation);
    vector.applyMatrix4(deviceRotation);
    return vector;
  }


  
  useEffect(() => {

    // createScene();
    // animate();

    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    let [posX,posY,lastPosX,lastPosY] = [canvas.width / 2,canvas.height / 2,0,0];

    let [vX,vY,vZ] = [0,0,0]

    
  setInterval(() => {
      if(Math.abs(posX-lastPosX)<0.01 && Math.abs(posY-lastPosY)<0.01) return
      ctx.lineTo(posX, posY);
      ctx.stroke();
      [lastPosX,lastPosY] = [posX, posY]
  },100)
    const handleMotion = (e:DeviceMotionEvent) => {
      if (e.rotationRate?.alpha && e.rotationRate?.beta && e.rotationRate?.gamma) {
        let alpha = THREE.MathUtils.degToRad(e.rotationRate.alpha);
        let beta = THREE.MathUtils.degToRad(e.rotationRate.beta);
        let gamma = THREE.MathUtils.degToRad(e.rotationRate.gamma);
        rotation = new THREE.Matrix4();
        rotation.makeRotationFromEuler(new THREE.Euler(beta, alpha, -gamma));
      }

      // 计算 x、y 轴上的位移量
      let { x, y, z } = e.acceleration;
      
      let s_interval = e.interval / 1000;
      s_interval = 0.5
      // let vector = convertToWorldCoord(x, y, z);
      // [x, y, z] = [vector.x, vector.y, vector.z];
    

      let [thresholdAccelarate, thresholdDistance] =[ 0,0]
      let s2 =s_interval* s_interval;
      // s2 = 0.0005
      const deltaDistance = {
        x: x<=thresholdAccelarate?0:(vX*s_interval+0.5 *x * s2 )* (x/Math.abs(x)),
        y: y<=thresholdAccelarate?0:(vY*s_interval+0.5 *y * s2 )* (y/Math.abs(y)),
        z: z<=thresholdAccelarate?0:(vZ*s_interval+0.5 *z * s2 )* (z/Math.abs(z)),
      }
      // if(deltaDistance.x >= 0.1 || deltaDistance.y >= 0.1 || deltaDistance.z >= 0.1){
      //   console.log(deltaDistance)
      // }

      const realWorldMoveRange = {x: 2,y: 2,z: 2,}

      const canvasMoveDistance = {
        x: deltaDistance.x<=thresholdDistance?0: canvas.width * deltaDistance.x / realWorldMoveRange.x,
        y: deltaDistance.y<=thresholdDistance?0:canvas.height * deltaDistance.y / realWorldMoveRange.y,
        z: deltaDistance.z<=thresholdDistance?0:canvas.height * deltaDistance.z / realWorldMoveRange.z,
      }

      posX += canvasMoveDistance.x/100;
      posY += canvasMoveDistance.y/100;


      vX += x*s_interval;
      vY += y*s_interval;
      vZ += z*s_interval;

    };

    
    const handleOrientation = e => {
      if (e.alpha && e.beta && e.gamma) {
        let alpha = THREE.MathUtils.degToRad(e.alpha);
        let beta = THREE.MathUtils.degToRad(e.beta);
        let gamma = THREE.MathUtils.degToRad(e.gamma);
        deviceRotation = new THREE.Matrix4();
        deviceRotation.makeRotationFromEuler(new THREE.Euler(beta, alpha, -gamma));
      }
    }


    const wraped = debounce(handleMotion, 12);

    window.addEventListener('devicemotion', wraped);
    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', wraped);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      style={{ backgroundColor: '#bbb' }}
    />
  );
}