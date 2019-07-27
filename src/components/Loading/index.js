import React from 'react'
import loadingImg from './loading.gif'
import './index.less'

function Loading(props) {
  return (
    <div className="mf-loading-container">
      <img src={loadingImg} alt="加载中..." />
    </div>
  )
}

export default Loading
