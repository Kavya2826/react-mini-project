import { useEffect, useMemo, useState } from 'react'
import './App.css'

const categories = [
  { name: 'Food & Drinks', icon: '🍜', color: '#f4a261' },
  { name: 'Transport', icon: '🚕', color: '#7c9cff' },
  { name: 'Shopping', icon: '🛍️', color: '#c49bff' },
  { name: 'Bills & Fees', icon: '📄', color: '#f08b9b' },
  { name: 'Entertainment', icon: '🎮', color: '#55c7b2' },
  { name: 'Other', icon: '✨', color: '#a5adba' },
]

const starterExpenses = [
  { id: 1, title: 'Lunch with friends', category: 'Food & Drinks', amount: 180, date: '2026-11-15' },
  { id: 2, title: 'Metro recharge', category: 'Transport', amount: 250, date: '2026-11-14' },
  { id: 3, title: 'Coffee', category: 'Food & Drinks', amount: 120, date: '2026-11-13' },
  { id: 4, title: 'New headphones', category: 'Shopping', amount: 899, date: '2026-11-12' },
  { id: 5, title: 'Movie night', category: 'Entertainment', amount: 320, date: '2026-11-10' },
]

const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(value)

const today = () => new Date().toISOString().slice(0, 10)

function App() {
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('broke-expenses')
      return saved ? JSON.parse(saved) : starterExpenses
    } catch {
      return starterExpenses
    }
  })
  const [budget, setBudget] = useState(() => Number(localStorage.getItem('broke-budget')) || 12000)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [month, setMonth] = useState('2026-11')
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food & Drinks', date: today() })

  useEffect(() => {
    localStorage.setItem('broke-expenses', JSON.stringify(expenses))
  }, [expenses])

  useEffect(() => {
    localStorage.setItem('broke-budget', String(budget))
  }, [budget])

  const monthExpenses = useMemo(
    () => expenses.filter((item) => item.date.startsWith(month)),
    [expenses, month],
  )
  const spent = monthExpenses.reduce((total, item) => total + item.amount, 0)
  const remaining = budget - spent
  const percent = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const visibleExpenses = filter === 'All'
    ? monthExpenses
    : monthExpenses.filter((item) => item.category === filter)

  const categoryTotals = categories.map((category) => ({
    ...category,
    total: monthExpenses
      .filter((item) => item.category === category.name)
      .reduce((sum, item) => sum + item.amount, 0),
  })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total)

  const chartTotal = categoryTotals.reduce((sum, item) => sum + item.total, 0)
  let runningPercent = 0
  const chartGradient = categoryTotals.length
    ? `conic-gradient(${categoryTotals.map((item) => {
      const start = runningPercent
      runningPercent += (item.total / chartTotal) * 100
      return `${item.color} ${start}% ${runningPercent}%`
    }).join(', ')})`
    : 'conic-gradient(#292d36 0% 100%)'

  function addExpense(event) {
    event.preventDefault()
    const amount = Number(form.amount)
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return
    setExpenses((current) => [{ ...form, title: form.title.trim(), amount, id: Date.now() }, ...current])
    setForm({ title: '', amount: '', category: 'Food & Drinks', date: today() })
    setShowForm(false)
  }

  function deleteExpense(id) {
    setExpenses((current) => current.filter((item) => item.id !== id))
  }

  const monthLabel = new Date(`${month}-02T12:00:00`).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  })

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#dashboard" aria-label="Broke home">
          <span className="brand-mark">₹</span>
          <span>BROKE<span className="brand-dot">.</span></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#dashboard"><span>▦</span> Overview</a>
          <a className="nav-link" href="#transactions"><span>↕</span> Transactions</a>
          <a className="nav-link" href="#insights"><span>◒</span> Spending insights</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="side-label">YOUR MONEY, YOUR RULES</div>
          <div className="sidebar-note">
            <span className="note-icon">✦</span>
            <p>Small expenses add up. Keep an eye on the little things.</p>
          </div>
          <div className="profile">
            <div className="avatar">Y</div>
            <div><strong>Your wallet</strong><span>Personal account</span></div>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right">
            <span className="today-label"><span className="status-dot" /> Your finances, in focus</span>
            <button className="avatar small-avatar" aria-label="Profile">Y</button>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">MONDAY MOTIVATION? MAYBE NEXT MONTH.</p>
              <h1>Hey, wallet watcher <span>👋</span></h1>
              <p className="subheading">Here's what's happening with your money.</p>
            </div>
            <button className="primary-button" onClick={() => setShowForm(true)}><span>＋</span> Add expense</button>
          </section>

          <section className="month-row">
            <div className="month-heading"><span className="calendar-icon">▦</span><strong>{monthLabel}</strong></div>
            <label className="month-picker">Viewing month <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} /></label>
          </section>

          <section className="stats-grid" aria-label="Monthly summary">
            <article className="stat-card balance-card">
              <div className="stat-top"><span>Total budget</span><span className="stat-icon">◎</span></div>
              <div className="stat-value">{money(budget)}</div>
              <div className="budget-edit">
                <label htmlFor="budget-input">Monthly limit</label>
                <input id="budget-input" type="number" min="1" value={budget} onChange={(event) => setBudget(Math.max(1, Number(event.target.value) || 1))} />
              </div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Total spent</span><span className="stat-icon coral">↗</span></div>
              <div className="stat-value">{money(spent)}</div>
              <div className="stat-foot"><span className="tiny-dot coral-bg" /> Across {monthExpenses.length} transactions</div>
            </article>
            <article className="stat-card">
              <div className="stat-top"><span>Money left</span><span className="stat-icon green">⌁</span></div>
              <div className={`stat-value ${remaining < 0 ? 'negative' : 'positive'}`}>{money(remaining)}</div>
              <div className="stat-foot"><span className={`tiny-dot ${remaining < 0 ? 'coral-bg' : 'green-bg'}`} /> {remaining < 0 ? 'You are over budget' : 'Still yours to spend'}</div>
            </article>
          </section>

          <section className="budget-panel">
            <div className="budget-copy">
              <div><span className="section-kicker">BUDGET CHECK</span><h2>Don't let your money ghost you.</h2></div>
              <div className="budget-percent">{Math.round(percent)}<small>%</small></div>
            </div>
            <div className="progress-track"><div className={`progress-fill ${percent >= 90 ? 'warning' : ''}`} style={{ width: `${percent}%` }} /></div>
            <div className="progress-meta"><span>{money(spent)} spent</span><span>{money(Math.max(remaining, 0))} remaining of {money(budget)}</span></div>
          </section>

          <div className="content-grid">
            <section className="panel transactions-panel" id="transactions">
              <div className="panel-heading">
                <div><span className="section-kicker">THE PAPER TRAIL</span><h2>Recent transactions</h2></div>
                <button className="text-button" onClick={() => setFilter('All')}>View all <span>↗</span></button>
              </div>
              <div className="filter-row">
                {['All', ...categories.map((item) => item.name)].map((item) => (
                  <button key={item} className={`filter-chip ${filter === item ? 'selected' : ''}`} onClick={() => setFilter(item)}>{item === 'All' ? 'All activity' : item}</button>
                ))}
              </div>
              <div className="transaction-list">
                {visibleExpenses.length ? visibleExpenses.map((item) => {
                  const category = categories.find((entry) => entry.name === item.category) || categories[5]
                  return (
                    <div className="transaction-row" key={item.id}>
                      <div className="transaction-icon" style={{ backgroundColor: `${category.color}20` }}>{category.icon}</div>
                      <div className="transaction-info"><strong>{item.title}</strong><span>{item.category} · {new Date(`${item.date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></div>
                      <strong className="transaction-amount">−{money(item.amount)}</strong>
                      <button className="delete-button" onClick={() => deleteExpense(item.id)} aria-label={`Delete ${item.title}`} title="Delete transaction">×</button>
                    </div>
                  )
                }) : <div className="empty-state"><span>🧾</span><strong>No expenses here. Yet.</strong><p>Add a transaction or choose another category.</p></div>}
              </div>
            </section>

            <section className="panel insights-panel" id="insights">
              <div className="panel-heading">
                <div><span className="section-kicker">FOLLOW THE MONEY</span><h2>Where it went</h2></div>
                <span className="mini-menu">•••</span>
              </div>
              <div className="chart-wrap">
                <div className="donut-chart" style={{ background: chartGradient }}>
                  <div className="donut-hole"><strong>{money(chartTotal)}</strong><span>Total spent</span></div>
                </div>
              </div>
              <div className="category-list">
                {categoryTotals.length ? categoryTotals.map((item) => (
                  <div className="category-row" key={item.name}>
                    <span className="category-name"><i style={{ background: item.color }} />{item.name}</span>
                    <strong>{money(item.total)}</strong>
                    <span className="category-percent">{chartTotal ? Math.round(item.total / chartTotal * 100) : 0}%</span>
                  </div>
                )) : <p className="muted-empty">Your spending breakdown will show up here.</p>}
              </div>
            </section>
          </div>
          <footer className="footer"><span>Made for the money-conscious (and the money-confused).</span><span> BROKE. <b>·</b> Keep your balance.</span></footer>
        </div>
      </main>

      {showForm && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
          <section className="expense-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading"><div><span className="section-kicker">NEW TRANSACTION</span><h2 id="modal-title">Where did it go?</h2></div><button className="close-button" onClick={() => setShowForm(false)} aria-label="Close">×</button></div>
            <form onSubmit={addExpense}>
              <label>What did you spend on?<input autoFocus required maxLength="50" placeholder="e.g. Late night pizza" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
              <label>How much? <span className="field-hint">INR ₹</span><input required type="number" min="1" step="1" placeholder="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
              <div className="form-two">
                <label>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
                <label>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label>
              </div>
              <button className="primary-button submit-button" type="submit">Save expense <span>↗</span></button>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
