import Match from 'preact-router/match'
import withStyles from './jss'
import LogoutButton from './logout-button'

function Header ({ classes, paths }) {
  const loggedIn = localStorage.getItem('token') !== null

  return (
    <div style='display: flex;' class='tab-container tabs-center'>
      <ul class={classes.list}>
        {
          paths.map(({ props: { path, name } }) =>
            <Match key={name} path={path}>
              {({ matches }) => (
                <li class={matches ? 'selected' : ''}>
                  <a href={path} class={classes.link}>{name}</a>
                </li>
              )}
            </Match>
          )
        }
        { loggedIn &&
          <li>
            <LogoutButton class={classes.link} />
          </li>
        }
      </ul>
    </div>
  )
}

export default withStyles({
  link: {
    boxSizing: 'border-box !important',
    border: 'solid 5px #959595 !important',
    borderTopColor: '#fff !important',
    borderLeftColor: '#fff !important',
    width: '140px !important',
    height: '60px !important',
    backgroundColor: '#c3c3c3 !important',
    boxShadow: '0 0 0 1px rgba(0,0,0,.75) !important',
    fontSize: '13px !important',
    color: '#000 !important',
    textAlign: 'center !important'
  },
  list: {
    borderBottomColor: '#333 !important',
    '& li.selected a': {
      color: 'rgb(240,61,77) !important'
    }
  }
}, Header)
