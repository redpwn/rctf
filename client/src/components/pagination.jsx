import { useMemo } from 'preact/hooks'
import withStyles from './jss'

function Pagination ({ totalItems, pageSize, page, setPage }) {
  const totalPages = Math.ceil(totalItems / pageSize)
  const pages = useMemo(() => {
    // Follow the google pagination principle of always showing 10 items
    let startPage, endPage
    if (totalPages <= 10) {
      // There are less than 10 items so display all
      startPage = 1
      endPage = totalPages
    } else {
      // There are more than 10 pages so calculate start and end pages
      // eslint-disable-next-line no-lonely-if
      if (page <= 6) {
        startPage = 1
        endPage = 10
      } else if (page + 4 >= totalPages) {
        startPage = totalPages - 9
        endPage = totalPages
      } else {
        startPage = page - 5
        endPage = page + 4
      }
    }

    const newPages = [] // ...Array((endPage + 1) - startPage).keys()].map(i => startPage + i)
    for (let i = startPage; i <= endPage; i++) {
      newPages.push(i)
    }
    return newPages
  }, [totalPages, page])

  const boundSetPages = useMemo(() => {
    const bsp = []
    for (let i = 1; i <= totalPages; i++) {
      bsp.push(() => setPage(i))
    }
    return bsp
  }, [setPage, totalPages])

  console.log(page === 1)

  return (
    <div class="btn-group">
      <button class={`btn ${page === 1 ? 'disabled' : ''}`} onClick={boundSetPages[0]}>&lt;&lt;</button>
      <button class={`btn ${page === 1 ? 'disabled' : ''}`} onClick={boundSetPages[page - 1 - 1]}>&lt;</button>
      {pages.map((p, i) => <button class={`btn ${p === page ? 'active' : ''}`} key={i} onClick={boundSetPages[p - 1]}>{p}</button>)}
      <button class={`btn ${page === totalPages ? 'disabled' : ''}`} onClick={boundSetPages[page + 1 - 1]}>&gt;</button>
      <button class={`btn ${page === totalPages ? 'disabled' : ''}`} onClick={boundSetPages[totalPages - 1]}>&gt;&gt;</button>
    </div>
  )
}

export default withStyles({

}, Pagination)
