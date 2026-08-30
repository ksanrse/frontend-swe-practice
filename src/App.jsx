import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Circle, Code2, ListChecks, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

const levelClass = {
  '🟢': 'border-emerald-800 bg-emerald-950 text-emerald-300',
  '🟡': 'border-amber-800 bg-amber-950 text-amber-300',
  '🔴': 'border-rose-800 bg-rose-950 text-rose-300',
}

function routeName(pathname) {
  return pathname === '/tasks' ? 'tasks' : 'development'
}

function navigate(to) {
  window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function Nav({ page }) {
  return <nav aria-label="Разделы" className="mb-10 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
    <a href="/" onClick={event => { event.preventDefault(); navigate('/') }} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${page === 'development' ? 'bg-slate-100 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}>Разработка</a>
    <a href="/tasks" onClick={event => { event.preventDefault(); navigate('/tasks') }} className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${page === 'tasks' ? 'bg-slate-100 text-slate-950' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'}`}>Все задачи</a>
  </nav>
}

function ProgressBar({ done, total }) {
  const percent = total ? Math.round((done / total) * 100) : 0
  return <div className="mt-4" aria-label={`${done} из ${total}, ${percent}%`}>
    <div className="mb-2 flex items-baseline justify-between text-sm"><span className="text-slate-300">{done} из {total}</span><strong className="text-slate-100">{percent}%</strong></div>
    <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${percent}%` }} /></div>
  </div>
}

function DevelopmentPage({ tasks }) {
  const done = tasks.filter(task => task.completed).length
  const phases = Object.values(tasks.reduce((groups, task) => {
    const key = task.phase || 'Без этапа'
    if (!groups[key]) groups[key] = { name: key, total: 0, done: 0 }
    groups[key].total += 1
    groups[key].done += Number(Boolean(task.completed))
    return groups
  }, {}))
  const sources = Object.values(tasks.reduce((groups, task) => {
    if (!groups[task.source]) groups[task.source] = { name: task.source, total: 0, done: 0 }
    groups[task.source].total += 1
    groups[task.source].done += Number(Boolean(task.completed))
    return groups
  }, {})).sort((a, b) => b.done - a.done || a.name.localeCompare(b.name))
  const updatedAt = tasks.reduce((latest, task) => !task.completedAt || task.completedAt < latest ? latest : task.completedAt, '')

  return <>
    <header className="mb-8 max-w-3xl space-y-3"><div className="flex items-center gap-2 text-sm text-slate-400"><Code2 className="h-4 w-4" /> Результаты разработки</div><h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">Frontend SWE</h1><p className="text-sm leading-6 text-slate-400 sm:text-base">Прогресс по текущей программе из 300 задач. Принятые решения синхронизируются с production ARK; старые решения вне этой программы не учитываются.</p></header>
    <section aria-label="Главные показатели" className="mb-10 grid gap-3 sm:grid-cols-3">
      <Card className="border-slate-800 bg-slate-950 py-0"><CardHeader className="gap-1 p-5"><CardDescription>Решено</CardDescription><CardTitle className="text-3xl text-emerald-300">{done}<span className="ml-1 text-base font-normal text-slate-500">/ {tasks.length}</span></CardTitle></CardHeader></Card>
      <Card className="border-slate-800 bg-slate-950 py-0"><CardHeader className="gap-1 p-5"><CardDescription>Прогресс</CardDescription><CardTitle className="text-3xl">{tasks.length ? Math.round((done / tasks.length) * 100) : 0}%</CardTitle></CardHeader></Card>
      <Card className="border-slate-800 bg-slate-950 py-0"><CardHeader className="gap-1 p-5"><CardDescription>Последнее принятое</CardDescription><CardTitle className="text-xl">{updatedAt ? new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium' }).format(new Date(updatedAt)) : '—'}</CardTitle></CardHeader></Card>
    </section>
    <section className="mb-10"><div className="mb-4"><h2 className="text-xl font-semibold text-slate-100">По направлениям</h2><p className="mt-1 text-sm text-slate-400">Каждый этап — отдельный набор механик, а не просто порядок задач.</p></div><div className="grid gap-3 lg:grid-cols-2">{phases.map(phase => <Card key={phase.name} className="border-slate-800 bg-slate-950 py-0"><CardContent className="p-5"><h3 className="font-medium text-slate-100">{phase.name}</h3><ProgressBar done={phase.done} total={phase.total} /></CardContent></Card>)}</div></section>
    <section className="mb-10"><div className="mb-4"><h2 className="text-xl font-semibold text-slate-100">По источникам</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{sources.map(source => <Card key={source.name} className="border-slate-800 bg-slate-950 py-0"><CardContent className="p-5"><h3 className="text-sm font-medium text-slate-300">{source.name}</h3><p className="mt-2 text-2xl font-semibold text-slate-100">{source.done}<span className="ml-1 text-sm font-normal text-slate-500">/ {source.total}</span></p><ProgressBar done={source.done} total={source.total} /></CardContent></Card>)}</div></section>
    <button type="button" onClick={() => navigate('/tasks')} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300">Открыть все задачи <ArrowRight className="h-4 w-4" /></button>
  </>
}

function TasksPage({ tasks }) {
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')
  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru')
    return tasks.filter(task => {
      const text = [task.title, task.goal, task.why, task.section, task.source].join(' ').toLocaleLowerCase('ru')
      return (!needle || text.includes(needle)) && (source === 'all' || task.source === source) && (status === 'all' || (status === 'done' ? task.completed : !task.completed))
    })
  }, [tasks, query, source, status])
  const grouped = shown.reduce((groups, task) => { (groups[task.phase] ||= []).push(task); return groups }, {})
  const sources = [...new Set(tasks.map(task => task.source))].sort()

  return <><header className="mb-7 space-y-2"><div className="flex items-center gap-2 text-sm text-slate-400"><ListChecks className="h-4 w-4" /> Каталог практики</div><h1 className="text-3xl font-semibold tracking-tight text-slate-50">Все 300 задач</h1><p className="max-w-2xl text-sm leading-6 text-slate-400">Фильтры не меняют данные: прогресс поступает только из принятых решений в ARK.</p></header>
    <Card className="mb-7 border-slate-800 bg-slate-950 py-0"><CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_190px_190px]"><label className="relative"><span className="sr-only">Поиск задач</span><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" /><Input value={query} onChange={event => setQuery(event.target.value)} placeholder="Название, механизм, цель" className="border-slate-700 bg-slate-900 pl-9" /></label><select aria-label="Источник" value={source} onChange={event => setSource(event.target.value)} className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"><option value="all">Все источники</option>{sources.map(item => <option key={item}>{item}</option>)}</select><select aria-label="Статус" value={status} onChange={event => setStatus(event.target.value)} className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"><option value="all">Все статусы</option><option value="open">Новые</option><option value="done">Решённые</option></select></CardContent></Card>
    <p className="mb-5 text-sm text-slate-400">Показано: <strong className="text-slate-100">{shown.length}</strong></p>
    {Object.entries(grouped).map(([phase, items]) => <section key={phase} className="mb-9"><h2 className="mb-3 text-lg font-medium text-slate-200">{phase}</h2><div className="space-y-2">{items.map(task => <a key={task.id} href={task.url} target="_blank" rel="noopener noreferrer" aria-label={`Открыть задачу: ${task.title}`} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"><Card className={`border-slate-800 bg-slate-950 py-0 transition-colors hover:border-slate-600 hover:bg-slate-900 ${task.completed ? 'opacity-60' : ''}`}><CardContent className="flex gap-3 p-4">{task.completed ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" aria-label={`${task.title}: решена`} /> : <Circle className="mt-1 h-5 w-5 shrink-0 text-slate-600" aria-label={`${task.title}: не решена`} />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-slate-100">{task.id}. {task.title}</span><Badge variant="outline" className={levelClass[task.level]}>{task.level}</Badge></div><p className="mt-1 text-xs text-slate-400">{task.source}{task.completedAt ? ` · ARK: ${new Date(task.completedAt).toLocaleDateString('ru-RU')}` : ''}</p><p className="mt-3 text-sm text-slate-200"><span className="text-slate-400">Цель:</span> {task.goal}</p><p className="mt-1 text-xs text-slate-400"><span>Почему:</span> {task.why}</p></div></CardContent></Card></a>)}</div></section>)}
    {!shown.length && <Card className="border-dashed border-slate-700 bg-slate-950 py-0"><CardContent className="flex items-center gap-2 p-8 text-sm text-slate-400"><Circle className="h-4 w-4" /> Ничего не найдено по текущим фильтрам.</CardContent></Card>}
  </>
}

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(() => routeName(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPage(routeName(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])
  useEffect(() => {
    Promise.all([
      fetch('/tasks.json', { cache: 'no-store' }).then(response => response.json()),
      fetch('/progress.json', { cache: 'no-store' }).then(response => response.json()).catch(() => ({ completed: {} })),
    ]).then(([catalog, progress]) => {
      setTasks(catalog.tasks.map(task => ({
        ...task,
        ...(progress.completed[`${task.source}|${task.title}`] || {}),
      })))
    }).finally(() => setLoading(false))
  }, [])

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 text-slate-100 sm:px-6 sm:py-10"><Nav page={page} />{loading ? <p className="text-sm text-slate-400">Загружаю данные ARK…</p> : page === 'tasks' ? <TasksPage tasks={tasks} /> : <DevelopmentPage tasks={tasks} />}</main>
}
