import { useEffect, useRef, Component } from 'react';


export default function HomePage() {
  const canvasRef = useRef(null);

  useEffect(() => {

    if (window.DeviceOrientationEvent) {
      console.log("DeviceOrientation is supported");
    }else{
      console.log("DeviceOrientation is not supported");
    }
    if (window.DeviceMotionEvent) {
      console.log("DeviceMotion is supported");
    }else{
      console.log("DeviceMotion is not supported");
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let posX = canvas.width / 2;
    let posY = canvas.height / 2;
    console.log("ccc")
    ctx.lineTo(100,100)
    ctx.stroke();
    const handleMotion = e => {
      console.log("abc")
      posX += e.accelerationIncludingGravity.x;
      posY += e.accelerationIncludingGravity.y;

      ctx.lineTo(posX, posY);
      ctx.stroke();
    };
    console.log("bbb")
    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('DeviceOrientation', handleMotion);

    return () => {
      // window.removeEventListener('devicemotion', handleMotion);
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