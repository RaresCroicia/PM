import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  let appPort = undefined;

  const connect = async () => {
    appPort = await navigator.serial.requestPort();
    await appPort.open({ baudRate: 9600 });
    const textDecoder = new TextDecoder();
    while (appPort.readable) {
      const reader = appPort.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (value) {
            break;
          }
          console.log(textDecoder.decode(value));
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  const disconnect = async () => {
    await appPort.close();
  }

  return (
    <>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </>    
  )
}

export default App
