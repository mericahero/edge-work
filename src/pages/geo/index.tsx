import React, { useRef, useEffect, useState } from 'react';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const { latitude, longitude } = position.coords;
        setPositions((positions) => [...positions, { x: latitude, y: longitude }]);
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    positions.forEach((position, index) => {
        console.log(position)
      if (index === 0) {
        ctx.moveTo(position.x, position.y);
      } else {
        ctx.lineTo(position.x, position.y);
      }
    });
    ctx.stroke();
  }, [positions]);

  return <canvas ref={canvasRef} />;
};

export default Canvas;