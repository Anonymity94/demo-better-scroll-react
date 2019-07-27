import React, { PureComponent } from 'react'
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

class App extends PureComponent {
  handlePullingDown = () => {
    STEP += 10
    setTimeout(() => {
      data = [...renderData(STEP), ...data]
      this.scrollRef.forceUpdate()
    }, 1000)
  }
  render() {
    return (
      <div className="App">
        {/* Scroll父节点 一定要指定一个高度，否则无法滚动 */}
        <div className="box">
          <Scroll
            onRef={scroll => (this.scrollRef = scroll)}
            onPullingDown={() => this.handlePullingDown()}
          >
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
}

export default App
