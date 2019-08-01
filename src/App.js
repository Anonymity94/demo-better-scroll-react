import React, { PureComponent } from 'react'
import './App.css'
import Scroll from './components/Scroll'

let STEP = 0

function renderData(step = 0) {
  const arr = Array.apply(null, { length: 10 + step }).map((...args) => args[1])
  return arr.sort(() => Math.random() - 0.5)
}

class App extends PureComponent {
  state = {
    data: renderData()
  }

  handlePullingDown = () => {
    STEP += 10
    setTimeout(() => {
      this.setState(({ data }) => ({
        data: [...renderData(STEP), ...data]
      }))
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
              {this.state.data.map(item => (
                <div style={{ height: 60, lineHeight: '60px' }} key={item}>
                  I am : {item}
                </div>
              ))}
            </div>
          </Scroll>
        </div>
      </div>
    )
  }
}

export default App
