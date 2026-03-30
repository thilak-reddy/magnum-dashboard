import { useState, useEffect, useMemo } from 'react'

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]
const DEFAULT_PAGE_SIZE = 50

export function usePagination(items, resetDeps = []) {
  const [pageSize, setPageSizeRaw] = useState(DEFAULT_PAGE_SIZE)
  const [currentPage, setCurrentPageRaw] = useState(1)

  // Reset to page 1 whenever the item list or any reset dep changes
  useEffect(() => { setCurrentPageRaw(1) }, [items.length, ...resetDeps])

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * pageSize
  const end = Math.min(start + pageSize, items.length)
  const page = useMemo(() => items.slice(start, end), [items, start, end])

  function setPageSize(n) {
    setPageSizeRaw(n)
    setCurrentPageRaw(1)
  }

  function setCurrentPage(n) {
    setCurrentPageRaw(Math.max(1, Math.min(n, totalPages)))
  }

  return { page, pageSize, setPageSize, currentPage: safePage, setCurrentPage, totalPages, start, end, total: items.length }
}

export function Pagination({ pagination }) {
  const { pageSize, setPageSize, currentPage, setCurrentPage, totalPages, start, end, total } = pagination
  if (total === 0) return null

  const pages = buildPageNumbers(currentPage, totalPages)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderTop: '1px solid var(--border-light)', background: '#FAFAF8', fontSize: 12.5 }}>
      {/* Row count selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)' }}>
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={e => setPageSize(Number(e.target.value))}
          style={{ fontSize: 12, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4, background: '#fff', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {/* Showing X–Y of Z */}
      <span style={{ color: 'var(--text-tertiary)', marginLeft: 4 }}>
        {start + 1}–{end} of {total}
      </span>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        {/* Prev */}
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          style={navBtn(currentPage === 1)}
        >‹</button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '2px 6px', color: 'var(--text-tertiary)' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              style={pageBtn(p === currentPage)}
            >{p}</button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={navBtn(currentPage === totalPages)}
        >›</button>
      </div>
    </div>
  )
}

function navBtn(disabled) {
  return {
    fontSize: 16, lineHeight: 1, padding: '2px 8px', border: '1px solid var(--border)',
    borderRadius: 4, background: disabled ? '#f5f5f3' : '#fff',
    color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
    cursor: disabled ? 'default' : 'pointer',
  }
}

function pageBtn(active) {
  return {
    fontSize: 12, padding: '2px 8px', border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
    borderRadius: 4,
    background: active ? 'var(--accent)' : '#fff',
    color: active ? '#fff' : 'var(--text-primary)',
    cursor: active ? 'default' : 'pointer',
    fontWeight: active ? 600 : 400,
  }
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  pages.push(1)
  if (current > 3) pages.push('...')
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
