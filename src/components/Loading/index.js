import React from 'react'
import loadingImg from './loading.gif'
import styles from './index.css'

function Loading(props) {
  return (
    <div class={styles.loadingContainer}>
      <img src={loadingImg} alt="加载中..." />
    </div>
  )
}

export default Loading
