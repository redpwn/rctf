import { memo } from 'preact/compat'

export default memo(({ onTooltipIn, name, currentScore,...rest }) => (
  <polyline
    {...rest}
    stroke-linecap='round'
    fill='transparent'
    pointer-events='stroke'
    onMouseOver={onTooltipIn(`${name} - ${currentScore} points`)}
  />
))
