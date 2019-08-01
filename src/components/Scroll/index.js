import React, { PureComponent, memo } from 'react'
import PropTypes from 'prop-types'
import BScroll from '@better-scroll/core'
import PullDown from '@better-scroll/pull-down'
import Pullup from '@better-scroll/pull-up'
import ObserveDom from '@better-scroll/observe-dom'
import Loading from '../Loading'
import Bubble from '../Bubble'
import './index.less'

BScroll.use(ObserveDom)
BScroll.use(PullDown)
// BScroll.use(Pullup)

const pullDownInitTop = -50

const PullDownDom = memo(
  ({ pullDownRefresh, beforePullDown, isPullingDown, bubbleY }) => {
    if (!pullDownRefresh) return ''
    if (beforePullDown) {
      return (
        <div className="before-trigger">
          <Bubble y={bubbleY} />
        </div>
      )
    }
    if (isPullingDown) {
      return (
        // <div className="after-trigger">
        <div className="loading">
          <Loading />
        </div>
        // </div>
      )
    }

    return (
      <div>
        <span>刷新成功</span>
      </div>
    )
  }
)

class Scroll extends PureComponent {
  constructor(props) {
    super(props)

    this.scrollViewRef = React.createRef()
    this.contentRef = React.createRef()

    this.state = {
      beforePullDown: true,
      isRebounding: false,
      isPullingDown: false,
      isPullUpLoad: false,
      pullUpDirty: true,
      pullDownStyle: {},
      bubbleY: 0
    }
  }

  // componentDidUpdate() {
  //   if (this.bscroll && this.props.refresh) {
  //     console.log('refresh')
  //     this.bscroll.refresh()
  //   }
  // }

  componentDidMount() {
    this.props.onRef(this)
    this.initScroll()
  }

  componentWillUnmount() {
    this.bscroll.off('scroll')
    this.bscroll = null
  }

  initScroll = () => {
    if (!this.scrollViewRef.current) {
      return
    }

    const { pullDownRefresh, pullUpLoad } = this.props

    if (this.contentRef.current && (pullDownRefresh || pullUpLoad)) {
      this.contentRef.current.style.minHeight = `${this.scrollViewRef.current
        .offsetHeight + 1}px`
    }

    if (!this.bscroll) {
      this.bscroll = new BScroll(this.scrollViewRef.current, {
        probeType: 3,
        click: this.props.click,
        observeDom: this.props.observeDom,
        refresh: this.props.refresh,
        scrollY: this.props.scrollY,

        // 下拉刷新
        pullDownRefresh: pullDownRefresh
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
        this._initPullDownRefresh()
      }
    }
  }

  scrollHandler(pos) {
    // console.log(pos.y)
  }

  forceUpdate(dirty) {
    const { isPullingDown } = this.state
    const { pullDownRefresh } = this.props
    if (pullDownRefresh && isPullingDown) {
      this.setState({
        isPullingDown: false
      })
      this._reboundPullDown().then(() => {
        this._afterPullDown()
      })
    }
    // else if (this.pullUpLoad && this.isPullUpLoad) {
    //   this.isPullUpLoad = false
    //   this.scroll.finishPullUp()
    //   this.pullUpDirty = dirty
    //   this.refresh()
    // }
    else {
      this.refresh()
    }
  }

  _initPullDownRefresh() {
    const { onPullingDown, pullDownRefresh } = this.props

    this.bscroll.on('pullingDown', () => {
      this.setState({
        beforePullDown: false,
        isPullingDown: true
      })
      onPullingDown()
    })

    this.bscroll.on('scroll', pos => {
      const { beforePullDown, isRebounding } = this.state
      if (!pullDownRefresh) {
        return
      }
      let bubbleY = 0
      let pullDownStyle = {}

      if (beforePullDown) {
        bubbleY = Math.max(0, pos.y + pullDownInitTop)
        pullDownStyle = { top: `${Math.min(pos.y + pullDownInitTop, 10)}px` }
      } else {
        bubbleY = 0
      }

      if (isRebounding) {
        pullDownStyle = { top: `${10 - (pullDownRefresh.stop - pos.y)}px` }
      }

      if (Object.keys(pullDownStyle).length > 0) {
        this.setState({
          bubbleY,
          pullDownStyle
        })
      } else {
        this.setState({
          bubbleY
        })
      }
    })
  }

  _reboundPullDown() {
    const { pullDownRefresh } = this.props
    const { stopTime = 600 } = pullDownRefresh
    return new Promise(resolve => {
      setTimeout(() => {
        this.setState({
          isRebounding: true
        })
        this.bscroll.finishPullDown()
        resolve()
      }, stopTime)
    })
  }

  _afterPullDown() {
    setTimeout(() => {
      this.setState({
        pullDownStyle: { top: `${pullDownInitTop}px` },
        beforePullDown: true,
        isRebounding: false
      })
      this.refresh()
    }, this.bscroll.options.bounceTime)
  }

  refresh() {
    if (this.bscroll) {
      this.bscroll.refresh()
    }
  }

  render() {
    const { pullDownRefresh } = this.props
    const { pullDownStyle, bubbleY, beforePullDown, isPullingDown } = this.state

    return (
      <div className="scroll-wrapper" ref={this.scrollViewRef}>
        <div className="scroll-content" ref={this.contentRef}>
          <div className="content-wrapper">
            <div>{this.props.children}</div>
          </div>
        </div>
        <div className="pulldown-wrapper" style={pullDownStyle}>
          <PullDownDom
            pullDownRefresh={pullDownRefresh}
            beforePullDown={beforePullDown}
            isPullingDown={isPullingDown}
            bubbleY={bubbleY}
          />
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

  pullDownRefresh: {
    threshold: 90,
    stop: 40
  }
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
  pullDownRefresh: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.shape({
      threshold: PropTypes.number,
      stop: PropTypes.number
    })
  ]),
  onPullingDown: PropTypes.func
}

export default Scroll
