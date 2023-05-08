import { useEffect, useRef, Component } from 'react';
import debounce from 'lodash/debounce';

import * as THREE from 'three';

// DeviceMotionEvent 事件解释 https://developer.aliyun.com/article/898270
export default function HomePage() {
  const canvasRef = useRef(null);


  let renderer, scene, camera;
  let mesh, line;
  let positions = [];

  let rotation = new THREE.Matrix4();
  let deviceRotation = new THREE.Matrix4();
  let cameraQuaternion = new THREE.Quaternion();

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

  const animate = () => {
    updateScene();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  function convertToWorldCoord(x, y, z) {
  let vector = new THREE.Vector3(x, y, z);
  vector.applyMatrix4(rotation);
  // vector.applyMatrix4(deviceRotation);
  return vector;
}



  useEffect(() => {

    // createScene();
    // animate();

    const canvas = canvasRef.current as unknown as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    let [posX,posY] = [canvas.width / 2,canvas.height / 2];
    let [lastX,lastY,lastZ] = [0,0,0]


    
    const handleMotion = (e:DeviceMotionEvent) => {
      if (e.rotationRate.alpha && e.rotationRate.beta && e.rotationRate.gamma) {
        let alpha = THREE.MathUtils.degToRad(e.rotationRate.alpha);
        let beta = THREE.MathUtils.degToRad(e.rotationRate.beta);
        let gamma = THREE.MathUtils.degToRad(e.rotationRate.gamma);
        rotation = new THREE.Matrix4();
        rotation.makeRotationFromEuler(new THREE.Euler(beta, alpha, -gamma));
      }

      // 计算 x、y 轴上的位移量
      let { x, y, z } = e.accelerationIncludingGravity;
      let vector = convertToWorldCoord(x, y, z);

      [x, y, z] = [vector.x, vector.y, vector.z];

      positions = [x, y, z];

      const deltaAcceleration  = {
        x: x,
        y: y,
        z: z,
      };

      [lastX,lastY,lastZ] = [x,y,z]

      let s2 = e.interval / 1000 * e.interval / 1000;
      s2 = 0.0002
      const deltaDistance = {
        x: deltaAcceleration.x * s2,
        y: deltaAcceleration.y * s2,
        z: deltaAcceleration.z * s2,
      }
      

      const realWorldMoveRange = {
        x: 1,
        y: 1,
        z: 1,
      }

      const canvasMoveDistance = {
        x: canvas.width * deltaDistance.x / realWorldMoveRange.x,
        y: canvas.height * deltaDistance.y / realWorldMoveRange.y,
      }
      if(deltaDistance.x >0.1){
      console.log(deltaDistance)
      console.log(canvasMoveDistance)
    }

      posX += canvasMoveDistance.x;
      posY += canvasMoveDistance.y;


      ctx.lineTo(posX, posY);
      ctx.stroke();
      



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
    // window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('devicemotion', wraped);
      // window.removeEventListener('deviceorientation', handleOrientation);
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