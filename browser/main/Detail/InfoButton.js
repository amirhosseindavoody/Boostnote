import React, { PropTypes } from 'react'
import CSSModules from 'browser/lib/CSSModules'
import styles from './InfoButton.styl'

const InfoButton = ({
  onClick
}) => (
  <button styleName='control-infoButton'
    onClick={(e) => onClick(e)}
  >
    <img className='infoButton' src='../resources/icon/icon-info.svg' />
  </button>
)

InfoButton.propTypes = {
  onClick: PropTypes.func.isRequired
}

export default CSSModules(InfoButton, styles)
