import React from 'react'
import './App.css'
import Scroll from './components/Scroll'

let STEP = 0

function renderData(step = 0) {
  const arr = Array.apply(null, { length: 100 + step }).map(
    (...args) => args[1]
  )
  return arr.sort(() => Math.random() - 0.5)
}

let data = renderData()

function App() {

  const handlePullingDown = () => {
    console.log('ref')
    STEP += 10
    setTimeout(() => {
      data = [...renderData(STEP), ...data]
    }, 1000)
  }

  return (
    <div className="App">
      {/* Scroll父节点 一定要指定一个高度，否则无法滚动 */}
      <div className="box">
        <Scroll onPullingDown={() => handlePullingDown()} >
          <div>
            {data.map(item => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </Scroll>
      </div>
    </div>
  )
}

export default App
