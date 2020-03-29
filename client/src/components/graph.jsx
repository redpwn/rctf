import { Component, Fragment } from 'preact'
import { getGraph } from '../api/scoreboard'
import withStyles from './jss'
import GraphLine from './graph-line'

const height = 400
const stroke = 5
const axis = 20
const axisGap = 10
const day = 24 * 60 * 60 * 1000

const timeToX = ({ minX, maxX, time, width }) => {
  return (time - minX) / (maxX - minX) * width
}

const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#ff5722']

const uuidToColor = (uuid) => {
  const uuidInt = parseInt(uuid.slice(-12), 16)
  return colors[uuidInt % colors.length]
}

const pointsToPolyline = ({ id, name, currentScore, points, maxX, minX, maxY, width }) => {
  const commands = points.map((point) => {
    return `${timeToX({ minX, maxX, time: point.time, width })} ${(1 - point.score / maxY) * height}`
  })
  return {
    color: uuidToColor(id),
    name,
    currentScore,
    points: commands.join(',')
  }
}

const getXLabels = ({ minX, maxX, width }) => {
  const labels = []
  let labelStart = new Date(minX).setHours(0, 0, 0, 0)
  if (labelStart % day !== 0) {
    labelStart += day
  }

  for (let label = labelStart; label <= maxX; label += day) {
    labels.push({
      label: new Date(label).toLocaleDateString(),
      x: timeToX({ minX, maxX, time: label, width })
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
  },
  '@global body': {
    overflowX: 'hidden'
  }
}, class extends Component {
  state = {
    division: null,
    polylines: [],
    labels: [],
    tooltipX: 0,
    tooltipY: 0,
    tooltipContent: '',
    width: window.innerWidth
  }

  graphPromise = null

  componentDidMount() {
    this.handleFetchData()
    window.addEventListener('resize', this.handleFetchData)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleFetchData)
  }

  componentDidUpdate(prevProps) {
    if (this.props.division !== prevProps.division) {
      this.graphPromise = null
      this.handleFetchData()
    }
  }

  handleFetchData = async () => {
    if (this.graphPromise === null) {
      this.graphPromise = getGraph({
        division: this.props.division === 'all' ? undefined : this.props.division
      })
    }
    const data = await this.graphPromise
    if (data.length === 0) {
      return
    }
    const width = window.innerWidth
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
    const labels = getXLabels({ minX, maxX, width })
    const polylines = data.graph.map((user) => pointsToPolyline({
      points: user.points,
      id: user.id,
      name: user.name,
      currentScore: user.points[0].score,
      maxX,
      minX,
      maxY,
      width
    }))
    this.setState({
      polylines,
      labels,
      width
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

  render({ classes }, { polylines, labels, tooltipContent, tooltipX, tooltipY, width }) {
    return (
      <div class={`frame ${classes.root}`}>
        <div class='frame__body'>
          <svg viewBox={`${-stroke - axis} ${-stroke} ${width + stroke * 2 + axis} ${height + stroke * 2 + axis + axisGap}`}>
            <Fragment>
              {polylines.map(({ points, color, name, currentScore }, i) => (
                <GraphLine
                  key={i}
                  stroke={color}
                  stroke-width={stroke}
                  points={points}
                  name={name}
                  currentScore={currentScore}
                  onMouseMove={this.handleTooltipMove}
                  onMouseOut={this.handleTooltipOut}
                  onTooltipIn={this.handleTooltipIn}
                />
              ))}
            </Fragment>
            <Fragment>
              {labels.map((label, i) => (
                <text x={label.x} y={height + axis + axisGap} key={i}>{label.label}</text>
              ))}
            </Fragment>
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
