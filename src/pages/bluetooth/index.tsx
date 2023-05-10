import React, { useState, useEffect } from 'react';
import { Button, Space } from 'antd-mobile'

const BluetoothDeviceList = () => {
  const [devices, setDevices] = useState([]);

let beginMove= ()=>{
    // 在组件挂载时获取可用的蓝牙设备
    navigator.bluetooth.requestDevice({ acceptAllDevices: true })
      .then(device => {
        setDevices([device]);
      })
      .catch(error => console.log(error));
}

  return (
    <div>
              <Button
        color="primary"
        size='small'
        onClick={beginMove}
      >开始</Button>
      <h1>蓝牙设备列表</h1>
      <ul>
        {devices.map(device => (
          <li key={device.id}>{JSON.stringify(device,null,2)}</li>
        ))}
      </ul>
    </div>
  );
}

export default BluetoothDeviceList;