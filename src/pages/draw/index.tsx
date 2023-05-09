import { useEffect, useRef, Component, MouseEvent } from 'react';
import { Button, Space } from 'antd-mobile'

var isiOS = !!navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); // 判断是否为 iOS

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);
let canvas: HTMLCanvasElement
let ctx:CanvasRenderingContext2D

  useEffect(() => {
    canvas = canvasRef.current as unknown as HTMLCanvasElement;
    ctx = canvas.getContext('2d');
    // 预设
let isDrawing = false;
let mouseDown = (event) => {
    isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

let touchStart = event =>{
  event.preventDefault();
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
};

let mouseMove = event =>{
  event.preventDefault();
  if (isDrawing) {
    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
  }
}

let touchMove = event =>{
    event.preventDefault();
  if (isDrawing) {
    ctx.lineTo(event.touches[0].clientX - canvas.offsetLeft, event.touches[0].clientY - canvas.offsetTop);
    ctx.stroke();
  }
};

let mouseUp = event =>{
  isDrawing = false;
}
canvas.addEventListener("mousedown", mouseDown);
canvas.addEventListener("mousemove", mouseMove);
canvas.addEventListener("mouseup",mouseUp);

canvas.addEventListener("touchstart", touchStart);
canvas.addEventListener("touchmove", touchMove);
canvas.addEventListener("touchend",mouseUp);
return () => {
  canvas.removeEventListener("mousedown", mouseDown);
  canvas.removeEventListener("mousemove", mouseMove);
  canvas.removeEventListener("mouseup", mouseUp);

  canvas.removeEventListener("touchstart", touchStart);
  canvas.removeEventListener("touchmove", touchMove);
  canvas.removeEventListener("touchend", mouseUp);


}
}, [])


function saveImage() {

  // var dataUrl = ctx.toDataURL("image/png");
  // var img = new Image();
  // img.src = dataUrl;
  // document.body.appendChild(img);
}


  return (
    <>
      <Button
        color="primary"
        size='small'
        onClick={saveImage}
      >保存路径</Button>
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        style={{ backgroundColor: '#bbb' }}
      />
    </>
  );
}