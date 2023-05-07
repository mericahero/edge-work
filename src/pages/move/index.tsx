import { useEffect, useRef, Component } from 'react';
import debounce from 'lodash/debounce';

import * as THREE from 'three';

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);


  let renderer, scene, camera;
  let mesh, line;
  let positions = [];

  const createScene = () => {
    const canvas = canvasRef.current;
    renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(0), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  };

  const updateScene = () => {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    const [x, y, z] = positions;
    if (x && y && z) {
      const worldPosition = new THREE.Vector3(x, y, z).multiplyScalar(0.01);
      line.geometry.attributes.position.array.push(worldPosition.x, worldPosition.y, worldPosition.z);
      line.geometry.attributes.position.needsUpdate = true;
    }
  };

  const onDeviceMotion = (event) => {
    positions = [event.accelerationIncludingGravity.x, event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z];
  };

  const animate = () => {
    updateScene();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };


  useEffect(() => {

    createScene();
    animate();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let [posX,posY] = [canvas.width / 2,canvas.height / 2];
    let [minX,minY,maxX,maxY] = [0,0,canvas.width,canvas.height];
    let [lastX,lastY,lastZ] = [0,0,0]
    
    
    const handleMotion = (e:DeviceMotionEvent) => {
      // 计算 x、y 轴上的位移量
      const { x, y, z } = e.accelerationIncludingGravity;
      
      positions = [x, y, z];

      let thresholdX = Math.abs(x-lastX)

      let thresholdY = Math.abs(z-lastZ)

      let needMove = false
      if(thresholdX>10){
        posX+=0.5
        needMove = true
      }
      if(thresholdY>10){
        posY+=0
        needMove = true
      }

      if(needMove){
        ctx.lineTo(posX, posY);
        ctx.stroke();
      }


      [lastX,lastY,lastZ] = [x,y,z]
    };



    const wraped = debounce(handleMotion, 12);

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