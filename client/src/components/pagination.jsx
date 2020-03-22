import { useMemo, useCallback } from 'preact/hooks'
import { Fragment } from 'preact'
import withStyles from './jss'

function PaginationItem({ onClick, disabled, selected, children, tabindex, ...props }) {
  const className = props.class || ''
  delete props.class
  const wrappedOnClick = useCallback((e) => {
    e.preventDefault()
    onClick()
  }, [onClick])
  return (
    <div class={`pagination-item short ${className}${selected ? ' selected' : ''}`} {...props}>
      <a disabled={disabled} href={onClick && '#'} onClick={wrappedOnClick} tabindex={tabindex}>
        {children}
      </a>
    </div>
  )
}

const PaginationEllipses = withStyles({
  noHover: {
    backgroundColor: 'transparent !important'
  },
  ellipses: {
    paddingLeft: '0.1em !important',
    paddingRight: '0.1em !important'
  }
}, ({ classes }) => {
  const noFocus = useCallback(e => e.target.blur(), [])
  // TODO: pass props through
  return (
    <div class={`pagination-item short ${classes.noHover}`}>
      <a class={`ellipses ${classes.ellipses}`} tabindex='-1' onFocus={noFocus}>&hellip;</a>
    </div>
  )
})

function Pagination ({ classes, totalItems, pageSize, page, setPage, numVisiblePages }) {
  numVisiblePages = numVisiblePages || 9
  const totalPages = Math.ceil(totalItems / pageSize)
  const { pages, startPage, endPage } = useMemo(() => {
    // Follow the google pagination principle of always showing 10 items
    let startPage, endPage
    if (totalPages <= numVisiblePages) {
      // Display all
      startPage = 1
      endPage = totalPages
    } else {
      // We need to hide some pages
      startPage = page - Math.ceil((numVisiblePages - 1) / 2)
      endPage = page + Math.floor((numVisiblePages - 1) / 2)
      if (startPage < 1) {
        startPage = 1
        endPage = numVisiblePages
      } else if (endPage > totalPages) {
        endPage = totalPages
        startPage = totalPages - numVisiblePages + 1
      }
      if (startPage > 1) {
        startPage += 2
      }
      if (endPage < totalPages) {
        endPage -= 2
      }
    }

    const pages = [] // ...Array((endPage + 1) - startPage).keys()].map(i => startPage + i)
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return { pages, startPage, endPage }
  }, [totalPages, page, numVisiblePages])

  const boundSetPages = useMemo(() => {
    const bsp = []
    for (let i = 1; i <= totalPages; i++) {
      bsp.push(() => setPage(i))
    }
    return bsp
  }, [setPage, totalPages])

  return (
    <div class={`pagination ${classes.paginationCentered}`}>
      <PaginationItem disabled={page === 1} key='<' onClick={boundSetPages[page - 1 - 1]}>&lt;</PaginationItem>
      { startPage > 1 &&
        <Fragment>
          <PaginationItem key={1} onClick={boundSetPages[0]}>1</PaginationItem>
          <PaginationEllipses key='.<' />
        </Fragment>
      }
      {pages.map((p) => <PaginationItem selected={p === page} key={p} onClick={boundSetPages[p - 1]}>{p}</PaginationItem>)}
      { endPage < totalPages &&
        <Fragment>
          <PaginationEllipses key='.>' />
          <PaginationItem key={totalPages} onClick={boundSetPages[totalPages - 1]}>{totalPages}</PaginationItem>
        </Fragment>
      }
      <PaginationItem disabled={page === totalPages} key='>' onClick={boundSetPages[page + 1 - 1]}>&gt;</PaginationItem>
    </div>
  )
}

export default withStyles({
  paginationCentered: {
    justifyContent: 'center'
  }
}, Pagination)
