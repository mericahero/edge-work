import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
  const canvasRef = useRef(null);
  const [ballX, setBallX] = useState(50);
  const [ballY, setBallY] = useState(50);
  const [ballSpeedX, setBallSpeedX] = useState(5);
  const [ballSpeedY, setBallSpeedY] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const ballRadius = 10;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const handleMotion = e => {
      const { gamma, beta } = e.rotationRate;

      // 根据陀螺仪的旋转角度计算小球移动的速度
      const xSpeed = gamma / 5;
      const ySpeed = beta / 5;

      // 更新小球的位置
      let newX = ballX + xSpeed;
      let newY = ballY - ySpeed;

      // 如果小球碰到边缘，反弹回来
      if (newX + ballRadius > screenWidth || newX - ballRadius < 0) {
        setBallSpeedX(-ballSpeedX);
      }
      if (newY + ballRadius > screenHeight || newY - ballRadius < 0) {
        setBallSpeedY(-ballSpeedY);
      }

      // 更新小球的位置和速度
      setBallX(newX + ballSpeedX);
      setBallY(newY + ballSpeedY);
    };

    const gameLoop = setInterval(() => {
      // 擦除画布
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // 绘制小球
      ctx.beginPath();
      ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
    }, 30);

    // 添加陀螺仪事件监听
    window.addEventListener('devicemotion', handleMotion);

    // 清除定时器和事件监听
    return () => {
      clearInterval(gameLoop);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, [ballX, ballY, ballSpeedX, ballSpeedY]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
    />
  );
};

export default Game;
