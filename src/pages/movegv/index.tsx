import React, { useRef, useEffect, useState } from 'react';

function App() {
  const [positions, setPositions] = useState([]);
  const lastPositionRef = useRef({ x: 0, y: 0, z: 0 });
  const [isTracking, setIsTracking] = useState(false);
    let [alpha, beta, gamma] = [0, 0, 0]

  window.addEventListener('deviceorientation', handleOrientation);


  const handleOrientation = (event:DeviceOrientationEvent) => {
    alpha = event.alpha
    beta = event.beta
    gamma = event.gamma
    
}

  useEffect(() => {
    if (isTracking) {
      window.addEventListener('devicemotion', handleMotion);
    } else {
      window.removeEventListener('devicemotion', handleMotion);
    }
    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [isTracking]);

  const handleMotion = (event) => {
    const { x, y, z } = event.accelerationIncludingGravity;
    const gravity = 9.81;
    const actualAcceleration = {
      x: x - gravity * Math.sin((gamma * Math.PI) / 180),
      y: y - gravity * Math.sin((beta * Math.PI) / 180),
      z: z - gravity * Math.cos((gamma * Math.PI) / 180) * Math.cos((beta * Math.PI) / 180),
    };

    if( actualAcceleration.x>1 || actualAcceleration.y>1){
        console.log(actualAcceleration)
    }

    const timeInterval = event.interval /1000;
    const velocity = {
      x: lastPositionRef.current.x + actualAcceleration.x * timeInterval,
      y: lastPositionRef.current.y + actualAcceleration.y * timeInterval,
      z: lastPositionRef.current.z + actualAcceleration.z * timeInterval,
    };

    const newPositions = [...positions, { x: velocity.x, y: velocity.y, z: velocity.z }];
    setPositions(newPositions);
    lastPositionRef.current = velocity;
  };

  const handleStartTracking = () => {
    setPositions([]);
    setIsTracking(true);
  };

  const handleStopTracking = () => {
    setIsTracking(false);
  };

  return (
    <div>
      <button onClick={handleStartTracking}>开始跟踪</button>
      <button onClick={handleStopTracking}>停止跟踪</button>
      <div>位置坐标：{JSON.stringify(lastPositionRef.current)}</div>
      <div>移动轨迹：{JSON.stringify(positions)}</div>
    </div>
  );
}

export default App;
