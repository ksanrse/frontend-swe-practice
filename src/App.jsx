import { useEffect, useMemo, useState } from 'react'
import { Search, CheckCircle2, Circle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'

const levelClass = { '🟢': 'border-emerald-800 bg-emerald-950 text-emerald-300', '🟡': 'border-amber-800 bg-amber-950 text-amber-300', '🔴': 'border-rose-800 bg-rose-950 text-rose-300' }

export default function App() {
  const [tasks, setTasks] = useState([])
  const [query, setQuery] = useState('')
  const [source, setSource] = useState('all')
  const [status, setStatus] = useState('all')

  useEffect(() => {
    Promise.all([fetch('/tasks.json', { cache: 'no-store' }).then(r => r.json()), fetch('/progress.json', { cache: 'no-store' }).then(r => r.json()).catch(() => ({ completed: {} }))])
      .then(([catalog, progress]) => setTasks(catalog.tasks.map(task => ({ ...task, ...(progress.completed[`${task.source}|${task.title}`] || {}) }))))
  }, [])

  const shown = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('ru')
    return tasks.filter(task => {
      const text = [task.title, task.goal, task.why, task.section, task.source].join(' ').toLocaleLowerCase('ru')
      return (!needle || text.includes(needle)) && (source === 'all' || task.source === source) && (status === 'all' || (status === 'done' ? task.completed : !task.completed))
    })
  }, [tasks, query, source, status])
  const done = tasks.filter(t => t.completed).length
  const grouped = shown.reduce((acc, task) => { (acc[task.phase] ||= []).push(task); return acc }, {})

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 text-slate-100 sm:px-6">
    <header className="mb-7 space-y-2"><div className="flex items-center gap-2 text-sm text-slate-400"><CheckCircle2 className="h-4 w-4"/> ARK синхронизирует принятые решения раз в день</div><h1 className="text-3xl font-semibold tracking-tight">Frontend SWE — 300 задач</h1><p className="max-w-2xl text-sm text-slate-400">Задачи в порядке механик: от коротких подводящих до задач, проверяющих ограничения и состояние.</p></header>
    <Card className="mb-6 border-slate-800 bg-slate-950"><CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_190px_190px]"><label className="relative"><Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500"/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Название, механизм, цель" className="border-slate-700 bg-slate-900 pl-9" /></label><select aria-label="Источник" value={source} onChange={e => setSource(e.target.value)} className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"><option value="all">Все источники</option>{['BigFrontEnd','GreatFrontEnd','CodeRun','Codewars'].map(x => <option key={x}>{x}</option>)}</select><select aria-label="Статус" value={status} onChange={e => setStatus(e.target.value)} className="h-9 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-400"><option value="all">Все статусы</option><option value="open">Новые</option><option value="done">Решённые</option></select></CardContent></Card>
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Всего',tasks.length],['Решено',done],['Осталось',tasks.length-done],['Показано',shown.length]].map(([label,value]) => <Card key={label} className="border-slate-800 bg-slate-950"><CardHeader className="p-4"><CardDescription>{label}</CardDescription><CardTitle className="text-2xl">{value}</CardTitle></CardHeader></Card>)}</div>
    {Object.entries(grouped).map(([phase, items]) => <section key={phase} className="mb-9"><h2 className="mb-3 text-lg font-medium text-slate-200">{phase}</h2><div className="space-y-2">{items.map(task => <Card key={task.id} role="link" tabIndex={0} aria-label={`Открыть задачу: ${task.title}`} onClick={() => window.open(task.url, '_blank', 'noopener,noreferrer')} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(task.url, '_blank', 'noopener,noreferrer') } }} className={`cursor-pointer border-slate-800 bg-slate-950 transition-colors hover:border-slate-600 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${task.completed ? 'opacity-55' : ''}`}><CardContent className="flex gap-3 p-4">{task.completed ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" aria-label={`${task.title}: решена`} /> : <Circle className="mt-1 h-5 w-5 shrink-0 text-slate-600" aria-label={`${task.title}: не решена`} />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-medium text-slate-100">{task.id}. {task.title}</span><Badge variant="outline" className={levelClass[task.level]}>{task.level}</Badge></div><p className="mt-1 text-xs text-slate-400">{task.source}{task.completedAt ? ` · ARK: ${new Date(task.completedAt).toLocaleDateString('ru-RU')}` : ''}</p><p className="mt-3 text-sm text-slate-200"><span className="text-slate-400">Цель:</span> {task.goal}</p><p className="mt-1 text-xs text-slate-400"><span>Почему:</span> {task.why}</p></div></CardContent></Card>)}</div></section>)}
    {!shown.length && <Card className="border-dashed border-slate-700 bg-slate-950"><CardContent className="flex items-center gap-2 p-8 text-sm text-slate-400"><Circle className="h-4 w-4"/> Ничего не найдено по текущим фильтрам.</CardContent></Card>}
  </main>
}
