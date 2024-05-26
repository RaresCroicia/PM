import { useState } from 'react';
import './App.css';

function App() {
  let appPort = undefined;
  let dataFromArdu = "";

  const [sensorData, setSensorData] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function parseSensorData(arduinoString) {
    // Extract temperature and state
    const tempMatch = arduinoString.match(/Begin(\d+\.\d{2})(Good|Bad)/);
    // Extract humidity and state
    const humiMatch = arduinoString.match(/(\d+\.\d{2})(Good|Bad)End/);

    if (!tempMatch || !humiMatch) {
      throw new Error("String format is incorrect");
    }

    return {
      temperature: parseFloat(tempMatch[1]),
      tempState: tempMatch[2],
      humidity: parseFloat(humiMatch[1]),
      humiState: humiMatch[2]
    };
  }

  const connect = async () => {
    appPort = await navigator.serial.requestPort();
    await appPort.open({ baudRate: 9600 });
    const textDecoder = new TextDecoder();
    setIsConnected(true);
    while (appPort.readable) {
      const reader = appPort.readable.getReader();
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          dataFromArdu += textDecoder.decode(value);
          if (dataFromArdu.slice(-3) === "End") {
            console.log(dataFromArdu);
            const obj = parseSensorData(dataFromArdu);
            obj.timestamp = Date.now();
            console.log(obj);
            setSensorData(prevData => [...prevData, obj]);
            dataFromArdu = "";
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  }

  const disconnect = async () => {
    await appPort.close();
    setIsConnected(false);
  }

  return (
    <>
      <button onClick={connect} disabled={isConnected}>Connect</button>
      <button onClick={disconnect} disabled={!isConnected}>Disconnect</button>
      <table>
        <thead>
          <tr>
            <th>Temperature</th>
            <th>Temp State</th>
            <th>Humidity</th>
            <th>Humi State</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {sensorData.map((data, index) => (
            <tr key={index}>
              <td>{data.temperature}</td>
              <td className={data.tempState.toLowerCase()}>{data.tempState}</td>
              <td>{data.humidity}</td>
              <td className={data.humiState.toLowerCase()}>{data.humiState}</td>
              <td>{formatTimestamp(data.timestamp)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default App;
