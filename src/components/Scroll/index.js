import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import BScroll from '@better-scroll/core'
import PullDown from '@better-scroll/pull-down'
import Pullup from '@better-scroll/pull-up'
import ObserveDom from '@better-scroll/observe-dom'
import './index.css'

BScroll.use(ObserveDom)
BScroll.use(PullDown)
// BScroll.use(Pullup)

class Scroll extends PureComponent {
  constructor(props) {
    super(props)

    this.scrollViewRef = React.createRef()

    this.state = {
      beforePullDown: true,
      isRebounding: false,
      isPullingDown: false,
      isPullUpLoad: false,
      pullUpDirty: true,
      pullDownStyle: '',
      bubbleY: 0
    }
  }

  componentDidUpdate() {
    if (this.bscroll && this.props.refresh) {
      console.log('refresh')
      this.bscroll.refresh()
    }
  }

  componentDidMount() {
    if (!this.bscroll) {
      this.bscroll = new BScroll(this.scrollViewRef.current, {
        probeType: 3,
        click: this.props.click,
        observeDom: this.props.observeDom,
        refresh: this.props.refresh,
        scrollY: this.props.scrollY,

        // 下拉刷新
        pullDownRefresh: this.props.pullDownRefresh
      })

      // 返回坐标
      this.bscroll.on('scroll', scroll => {
        if (this.props.onScroll) {
          this.props.onScroll(scroll)
        } else {
          this.scrollHandler(scroll)
        }
      })
      // 下拉刷新
      if (
        this.props.scrollY &&
        this.props.pullDownRefresh &&
        this.props.onPullingDown
      ) {
        this.bscroll.on('pullingDown', this.props.onPullingDown)
      }
    }
  }

  componentWillUnmount() {
    this.bscroll.off('scroll')
    this.bscroll = null
  }

  scrollHandler(pos) {
    // console.log(pos.y)
  }

  refresh() {
    if (this.bscroll) {
      this.bscroll.refresh()
    }
  }

  render() {
    const { pullUpDirty } = this.state
    const pullUpTxt = pullUpDirty ? '加载中...' : '没有更多数据了'

    return (
      <div className="ScrollWrap" ref={this.scrollViewRef}>
        <div className="scroll-content">
          <div>{this.props.children}</div>
        </div>
      </div>
    )
  }
}

Scroll.defaultProps = {
  click: true,
  refresh: true, // 是否刷新
  observeDom: true, // 开启对 scroll 区域 DOM 改变的探测
  scrollY: true,
  wheel: true,

  pullDownRefresh: true
}

Scroll.propTypes = {
  // 是否启用点击
  click: PropTypes.bool,
  // 是否刷新
  refresh: PropTypes.bool,
  observeDom: PropTypes.bool,
  onScroll: PropTypes.func,
  scrollY: PropTypes.bool,

  // 下拉刷新
  pullDownRefresh: PropTypes.bool,
  onPullingDown: PropTypes.func
}

export default Scroll
