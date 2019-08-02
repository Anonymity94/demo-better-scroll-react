import React, { PureComponent } from 'react'
import Scroll from './components/Scroll'
import './App.less'

class App extends PureComponent {
  state = {
    data: new Array(5).fill(0).map((item, index) => `I am the No.${index}`)
  }

  handlePullingDown = () => {
    setTimeout(() => {
      this.setState(({ data }) => ({
        data: [`I am new data:${+new Date()}`, ...data]
      }))
      this.scrollRef.forceUpdate()
    }, 1000)
  }
  render() {
    return (
      <div className="App">
        <div className="demo">
          {/* Scroll父节点 一定要指定一个高度，否则无法滚动 */}
          <div className="box">
            <Scroll
              onRef={scroll => (this.scrollRef = scroll)}
              onPullingDown={() => this.handlePullingDown()}
            >
              <div>
                {this.state.data.map(item => (
                  <div style={{ height: 60, lineHeight: '60px' }} key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </Scroll>
          </div>
          <div className="iphone-frame" />
        </div>
      </div>
    )
  }
}

export default App
