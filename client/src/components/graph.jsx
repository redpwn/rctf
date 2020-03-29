import { Component, Fragment } from 'preact'
import { getGraph } from '../api/scoreboard'
import withStyles from './jss'

const width = window.innerWidth
const height = 400
const stroke = 5
const axis = 20
const axisGap = 10
const day = 24 * 60 * 60 * 1000
const viewBox = `${-stroke - axis} ${-stroke} ${width + stroke * 2 + axis} ${height + stroke * 2 + axis + axisGap}`

const timeToX = ({ minX, maxX, time }) => {
  return (time - minX) / (maxX - minX) * width
}

const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#ff5722']

const uuidToColor = (uuid) => {
  const uuidInt = parseInt(uuid.slice(-12), 16)
  return colors[uuidInt % colors.length]
}

const pointsToPolyline = ({ id, name, currentScore, points, maxX, minX, maxY }) => {
  const commands = points.map((point) => {
    return `${timeToX({ minX, maxX, time: point.time })} ${(1 - point.score / maxY) * height}`
  })
  return {
    color: uuidToColor(id),
    name,
    currentScore,
    points: commands.join(',')
  }
}

const getXLabels = ({ minX, maxX }) => {
  const labels = []
  let labelStart = new Date(minX).setHours(0, 0, 0, 0)
  if (labelStart % day !== 0) {
    labelStart += day
  }
  const labelEnd = Math.floor(maxX / day) * day

  for (let label = labelStart; label <= labelEnd; label += day) {
    labels.push({
      label: new Date(label).toLocaleDateString(),
      x: timeToX({ minX, maxX, time: label })
    })
  }
  return labels
}

export default withStyles({
  root: {
    marginBottom: '20px',
    '& .frame__body': {
      padding: '20px'
    }
  },
  tooltip: {
    position: 'absolute',
    pointerEvents: 'none',
    background: 'var(--cirrus-fg)',
    color: 'var(--cirrus-bg)',
    padding: '5px 10px',
    borderRadius: '5px',
    margin: '5px'
  }
}, class extends Component {
  state = {
    polylines: [],
    labels: [],
    tooltipX: 0,
    tooltipY: 0,
    tooltipContent: ''
  }

  componentDidMount = async () => {
    const data = await getGraph({
      division: this.props.division === '' ? undefined : this.props.division
    })
    if (data.length === 0) {
      return
    }
    let maxX = 0
    let minX = Infinity
    let maxY = 0
    data.graph.forEach((user) => {
      user.points.forEach((point) => {
        if (point.time > maxX) {
          maxX = point.time
        }
        if (point.time < minX) {
          minX = point.time
        }
        if (point.score > maxY) {
          maxY = point.score
        }
      })
    })
    const labels = getXLabels({ minX, maxX })
    const polylines = data.graph.map((user) => pointsToPolyline({
      points: user.points,
      id: user.id,
      name: user.name,
      currentScore: user.points[0].score,
      maxX,
      minX,
      maxY
    }))
    this.setState({
      polylines,
      labels
    })
  }

  handleTooltipIn = (content) => () => {
    this.setState({
      tooltipContent: content,
    })
  }

  handleTooltipMove = (evt) => {
    this.setState({
      tooltipX: evt.clientX,
      tooltipY: evt.clientY
    })
  }

  handleTooltipOut = () => {
    this.setState({
      tooltipContent: ''
    })
  }

  render({ classes }, { polylines, labels, tooltipContent, tooltipX, tooltipY, tooltipFlipX }) {
    return (
      <div class={`frame ${classes.root}`}>
        <div class='frame__body'>
          <svg viewBox={viewBox}>
            {polylines.map(({ points, color, name, currentScore }, i) => (
              <polyline
                key={i}
                stroke-linecap='round'
                stroke={color}
                stroke-width={stroke}
                fill='transparent'
                points={points}
                pointer-events='stroke'
                onMouseOver={this.handleTooltipIn(`${name} - ${currentScore} points`)}
                onMouseMove={this.handleTooltipMove}
                onMouseOut={this.handleTooltipOut}
              />
            ))}
            {labels.map((label, i) => (
              <text x={label.x} y={height + axis + axisGap} key={i}>{label.label}</text>
            ))}
            <line
              x1={-axisGap}
              y1={height + axisGap}
              x2={width}
              y2={height + axisGap}
              stroke='var(--cirrus-fg)'
              stroke-linecap='round'
              stroke-width={stroke}
            />
            <line
              x1={-axisGap}
              y1='0'
              x2={-axisGap}
              y2={height + axisGap}
              stroke='var(--cirrus-fg)'
              stroke-linecap='round'
              stroke-width={stroke}
            />
          </svg>
        </div>
        {tooltipContent && (
          <div
            class={classes.tooltip}
            style={{
              left: tooltipX,
              top: tooltipY
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>
    )
  }
})
