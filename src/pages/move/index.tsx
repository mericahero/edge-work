import { useEffect, useRef, Component } from 'react';
import debounce from 'lodash/debounce';

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);



  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let [posX,posY] = [canvas.width / 2,canvas.height / 2];
    let [minX,minY,maxX,maxY] = [0,0,canvas.width,canvas.height];
    let [lastX,lastY,lastZ] = [0,0,0]
    let [threshold1,threshold5,threshold10,threshold15,threshold20,threshold25,threshold50,threshold100]=[1,5,10,15,20,25,50,100]
    let [threshold1Count,threshold5Count,threshold10Count,threshold15Count,threshold20Count,threshold25Count,threshold50Count,threshold100Count]=[0,0,0,0,0,0,0,0]
    const handleMotion = (e:DeviceMotionEvent) => {
      // 计算 x、y 轴上的位移量
      const { x, y, z } = e.accelerationIncludingGravity;
      let thresholdX = Math.abs(x-lastX)
      if(thresholdX>threshold1){threshold1Count++}
      if(thresholdX>threshold5){threshold5Count++}
      if(thresholdX>threshold10){threshold10Count++}
      if(thresholdX>threshold15){threshold15Count++}
      if(thresholdX>threshold20){threshold20Count++}
      if(thresholdX>threshold25){threshold25Count++}
      if(thresholdX>threshold50){threshold50Count++}
      if(thresholdX>threshold100){threshold100Count++}

      let thresholdY = Math.abs(z-lastZ)
      if(thresholdY>threshold1){threshold1Count++}
      if(thresholdY>threshold5){threshold5Count++}
      if(thresholdY>threshold10){threshold10Count++}
      if(thresholdY>threshold15){threshold15Count++}
      if(thresholdY>threshold20){threshold20Count++}
      if(thresholdY>threshold25){threshold25Count++}
      if(thresholdY>threshold50){threshold50Count++}
      if(thresholdY>threshold100){threshold100Count++}

      let needMove = false
      if(thresholdX>threshold10){
        posX+=0.5
        needMove = true
      }
      if(thresholdY>threshold10){
        posY+=0
        needMove = true
      }

      if(needMove){
        ctx.lineTo(posX, posY);
        ctx.stroke();
      }

      
      // const deltaX = x * 2;
      // const deltaY = y * 2;

      // // 更新位置
      // posX +=  deltaX / 180 -10;
      // posY +=  deltaY / 180 -10;

      // // 绘制到 canvas 上
      // ctx.lineTo(posX, posY);
      // ctx.stroke();

      [lastX,lastY,lastZ] = [x,y,z]
    };

    setInterval(()=>{
      console.log("threshold1Count",threshold1Count)
      console.log("threshold5Count",threshold5Count)
      console.log("threshold10Count",threshold10Count)
      console.log("threshold15Count",threshold15Count)
      console.log("threshold20Count",threshold20Count)
      console.log("threshold25Count",threshold25Count)
      console.log("threshold50Count",threshold50Count)
      console.log("threshold100Count",threshold100Count)
      console.log("=====",threshold100Count)
    },1000)

    const wraped = debounce(handleMotion, 12);
    console.log("bbb")
    window.addEventListener('devicemotion', wraped);


    return () => {
      window.removeEventListener('devicemotion', wraped);
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