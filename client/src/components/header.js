import withStyles from './jss'

export default withStyles({
  normalize: {
    '&:focus': {
      boxShadow: 'none'
    },
    '& a:focus': {
      boxShadow: 'none'
    }
  }
}, ({ classes, paths, currentPath }) => {
  return (
    <div class='tab-container tabs-center'>
      <ul>
        {
          paths.map(route => {
            const { path, name } = route.props
            const selectedClass = path === currentPath ? 'selected' : ''

            return (
              <li key={name} class={`${selectedClass} ${classes.normalize}`}><a href={path}>{name}</a></li>
            )
          })
        }
      </ul>
    </div>
  )
})
