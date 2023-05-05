import { useEffect, useRef, Component } from 'react';
import debounce from 'lodash/debounce';


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

    const handleMotion = e => {
      console.log("abc")
      posX += e.accelerationIncludingGravity.x;
      posY += e.accelerationIncludingGravity.y;

      ctx.lineTo(posX, posY);
      ctx.stroke();
    };

    const wraped = debounce(handleMotion, 15);
    console.log("bbb")
    window.addEventListener('devicemotion', debounce(wraped));
    // window.addEventListener('DeviceOrientation', wraped);

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