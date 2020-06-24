import Match from 'preact-router/match'
import withStyles from './jss'
import LogoutButton from './logout-button'

function Header ({ classes, paths }) {
  const loggedIn = localStorage.getItem('token') !== null

  return (
    <div class='tab-container tabs-center'>
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
    '&:focus': {
      boxShadow: 'none',
      // color copied from Cirrus styles - there is no variable for it
      borderBottomColor: 'rgba(240,61,77,.6)'
    },
    background: '#0000 !important',
    color: '#fff !important',
    padding: '.5rem .7rem !important'
  },
  list: {
    borderBottomColor: '#333 !important',
    '& li.selected a': {
      color: 'rgb(240,61,77) !important'
    }
  }
}, Header)
