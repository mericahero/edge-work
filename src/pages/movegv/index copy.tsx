import React, { useEffect, useRef } from 'react';

export default function HomePage() {
  const canvasRef = useRef(null);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const lastVelocityRef = useRef({ x: 0, y: 0, z: 0 });
  const lastTimestampRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    context.strokeStyle = 'blue';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    const handleDeviceMotion = (event) => {
      const { acceleration: acceleration, interval, timeStamp } = event;

      const actualAcceleration = {
        x: acceleration.x - lastPositionRef.current.x,
        y: acceleration.y - lastPositionRef.current.y,
        z: acceleration.z - lastPositionRef.current.z,
      };
      if(actualAcceleration.x>1||actualAcceleration.y>1){
      console.log(JSON.stringify(actualAcceleration,null,2))
      }

      const timeInterval = (timeStamp - lastTimestampRef.current) / 1000;

      const actualVelocity = {
        x: lastVelocityRef.current.x + actualAcceleration.x * timeInterval,
        y: lastVelocityRef.current.y + actualAcceleration.y * timeInterval,
        z: lastVelocityRef.current.z + actualAcceleration.z * timeInterval,
      };

      const actualPosition = {
        x: lastPositionRef.current.x + actualVelocity.x * timeInterval,
        y: lastPositionRef.current.y + actualVelocity.y * timeInterval,
        z: lastPositionRef.current.z + actualVelocity.z * timeInterval,
      };

      lastVelocityRef.current = actualVelocity;
      lastPositionRef.current = actualPosition;
      lastTimestampRef.current = timeStamp;

      context.beginPath();
      context.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
      context.lineTo(actualPosition.x, actualPosition.y);
      context.stroke();
    };

    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  }, []);

  return <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{ backgroundColor: '#bbb' }}/>;
}