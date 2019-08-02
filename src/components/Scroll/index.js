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
BScroll.use(Pullup)

const pullDownInitTop = -50

const PullDownDom = memo(
  ({
    pullDownRefresh,
    beforePullDown,
    isPullingDown,
    bubbleY,
    pullDownStyle
  }) => {
    if (!pullDownRefresh) return ''

    let dom = ''
    if (beforePullDown) {
      dom = (
        <div className="before-trigger">
          <Bubble y={bubbleY} />
        </div>
      )
    } else if (isPullingDown) {
      dom = (
        <div className="loading">
          <Loading />
        </div>
      )
    } else {
      dom = (
        <div>
          <span>刷新成功</span>
        </div>
      )
    }

    return (
      <div className="pulldown-wrapper" style={pullDownStyle}>
        {dom}
      </div>
    )
  }
)

const PullUpDom = memo(({ pullUpLoad, isPullUpLoad, pullUpTxt }) => {
  if (!pullUpLoad) return ''

  let dom = ''
  if (isPullUpLoad) {
    dom = (
      <div className="after-trigger">
        <Loading />
      </div>
    )
  } else {
    dom = (
      <div className="before-trigger">
        <span>{pullUpTxt}</span>
      </div>
    )
  }
  return <div className="pullup-wrapper">{dom}</div>
})

class Scroll extends PureComponent {
  constructor(props) {
    super(props)

    this.scrollViewRef = React.createRef()
    this.contentRef = React.createRef()

    this.state = {
      beforePullDown: true,
      isRebounding: false,
      isPullingDown: false,
      pullDownStyle: {},
      bubbleY: 0,

      isPullUpLoad: false,
      pullUpDirty: true
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
        pullDownRefresh,
        // 上拉加载
        pullUpLoad
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

      if (
        this.props.scrollY &&
        this.props.pullUpLoad &&
        this.props.onPullingUp
      ) {
        this._initPullUpLoad()
      }
    }
  }

  scrollHandler = pos => {
    // console.log(pos.y)
  }

  forceUpdate = dirty => {
    const { isPullingDown, isPullUpLoad } = this.state
    const { pullDownRefresh, pullUpLoad } = this.props
    if (pullDownRefresh && isPullingDown) {
      this.setState({
        isPullingDown: false
      })
      this._reboundPullDown().then(() => {
        this._afterPullDown()
      })
    } else if (pullUpLoad && isPullUpLoad) {
      this.setState({
        isPullUpLoad: false,
        pullUpDirty: dirty
      })
      this.bscroll.finishPullUp()
      this.refresh()
    } else {
      this.refresh()
    }
  }

  _initPullDownRefresh = () => {
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

  _initPullUpLoad = () => {
    const { onPullingUp } = this.props
    this.bscroll.on('pullingUp', () => {
      this.setState({
        isPullUpLoad: true
      })
      onPullingUp()
    })
  }

  _reboundPullDown = () => {
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

  _afterPullDown = () => {
    setTimeout(() => {
      this.setState({
        pullDownStyle: { top: `${pullDownInitTop}px` },
        beforePullDown: true,
        isRebounding: false
      })
      this.refresh()
    }, this.bscroll.options.bounceTime)
  }

  refresh = () => {
    if (this.bscroll) {
      this.bscroll.refresh()
    }
  }

  render() {
    // 下拉刷新
    const { pullDownRefresh } = this.props
    const { pullDownStyle, bubbleY, beforePullDown, isPullingDown } = this.state

    // 上拉加载
    const { pullUpLoad, pullUpLoadMoreTxt, pullUpLoadNoMoreTxt } = this.props
    const { isPullUpLoad, pullUpDirty } = this.state

    return (
      <div className="scroll-wrapper" ref={this.scrollViewRef}>
        <div className="scroll-content">
          <div className="content-wrapper" ref={this.contentRef}>
            <div>{this.props.children}</div>
          </div>
          <PullUpDom
            pullUpLoad={pullUpLoad}
            isPullUpLoad={isPullUpLoad}
            pullUpTxt={pullUpDirty ? pullUpLoadMoreTxt : pullUpLoadNoMoreTxt}
          />
        </div>
        <PullDownDom
          pullDownStyle={pullDownStyle}
          pullDownRefresh={pullDownRefresh}
          beforePullDown={beforePullDown}
          isPullingDown={isPullingDown}
          bubbleY={bubbleY}
        />
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
  },

  pullUpLoad: true,
  pullUpLoadMoreTxt: '上拉加载',
  pullUpLoadNoMoreTxt: '没有更多数据了'
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
  onPullingDown: PropTypes.func,

  // 上拉加载
  pullUpLoad: PropTypes.bool,
  pullUpLoadMoreTxt: PropTypes.string,
  pullUpLoadNoMoreTxt: PropTypes.string
}

export default Scroll
