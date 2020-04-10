import { Fragment } from 'preact'
import { useState, useEffect, useLayoutEffect, useMemo, useCallback, useRef } from 'preact/hooks'
import { getGraph } from '../api/scoreboard'
import withStyles from './jss'
import { memo } from 'preact/compat'

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

const GraphLine = memo(({ points, onTooltipIn, onMouseMove, onMouseOut, name, currentScore, ...rest }) => (
  <Fragment>
    <polyline
      {...rest}
      points={points}
      stroke-width={stroke}
      stroke-linecap='round'
      fill='transparent'
      pointer-events='none'
    />
    <polyline
      stroke-width={stroke * 2.5}
      points={points}
      fill='transparent'
      pointer-events='stroke'
      onMouseOver={onTooltipIn(`${name} - ${currentScore} points`)}
      onMouseMove={onMouseMove}
      onMouseOut={onMouseOut}
    />
  </Fragment>
))

function Graph ({ division, classes }) {
  const [graphData, setGraphData] = useState(null)

  const svgRef = useRef(null)
  const [width, setWidth] = useState(window.innerWidth)
  const updateWidth = useCallback(() => {
    if (svgRef.current === null) return
    setWidth(svgRef.current.getBoundingClientRect().width)
  }, [])

  const [tooltipData, setTooltipData] = useState({
    x: 0,
    y: 0,
    content: ''
  })

  useLayoutEffect(() => {
    updateWidth()
  }, [updateWidth])
  useEffect(() => {
    function handleResize () {
      updateWidth()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateWidth])

  useEffect(() => {
    (async () => {
      setGraphData(await getGraph({
        division: division === 'all' ? undefined : division
      }))
    })()
  }, [division])

  const { polylines, labels } = useMemo(() => {
    if (!graphData || graphData.length === 0) {
      return {
        polylines: [],
        labels: []
      }
    }
    let maxX = 0
    let minX = Infinity
    let maxY = 0
    graphData.graph.forEach((user) => {
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
    const polylines = graphData.graph.map((user) => pointsToPolyline({
      points: user.points,
      id: user.id,
      name: user.name,
      currentScore: user.points[0].score,
      maxX,
      minX,
      maxY,
      width
    }))
    return { polylines, labels }
  }, [graphData, width])

  const handleTooltipIn = useCallback((content) => () => {
    setTooltipData(d => ({
      ...d,
      content
    }))
  }, [])

  const handleTooltipMove = useCallback((evt) => {
    setTooltipData(d => ({
      ...d,
      x: evt.clientX,
      y: evt.clientY
    }))
  }, [])

  const handleTooltipOut = useCallback(() => {
    setTooltipData(d => ({
      ...d,
      content: ''
    }))
  }, [])

  return (
    <div class={`frame ${classes.root}`}>
      <div class='frame__body'>
        <svg ref={svgRef} viewBox={`${-stroke - axis} ${-stroke} ${width + stroke * 2 + axis} ${height + stroke * 2 + axis + axisGap}`}>
          <Fragment>
            {polylines.map(({ points, color, name, currentScore }, i) => (
              <GraphLine
                key={i}
                stroke={color}
                points={points}
                name={name}
                currentScore={currentScore}
                onMouseMove={handleTooltipMove}
                onMouseOut={handleTooltipOut}
                onTooltipIn={handleTooltipIn}
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
      {tooltipData.content && (
        <div
          class={classes.tooltip}
          style={{
            transform: `translate(${tooltipData.x}px, ${tooltipData.y}px)`
          }}
        >
          {tooltipData.content}
        </div>
      )}
    </div>
  )
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
    margin: '5px',
    top: '0',
    left: '0'
  }
}, Graph)
