'use client'

import { useState, useEffect } from 'react'
import { useData } from '@/hooks/useData'
import { useAuth } from '@/hooks/useAuth'
import { formatMoney, fetchDolar } from '@/lib/utils'
import { Plus, Minus, Target, X, Edit2, Trash2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Meta } from '@/types'

export default function AhorrosPage() {
  console.log('🟢🟢🟢 [AhorrosPage] COMPONENT RENDER')

  const { profile, updateProfile } = useAuth()
  const { metas, movimientos, addMeta, updateMeta, deleteMeta, addMovimiento } = useData()

  console.log('🟢🟢🟢 [AhorrosPage] addMovimiento function reference:', addMovimiento)

  const [dolar, setDolar] = useState(1050)
  const [showMetaModal, setShowMetaModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [metaForm, setMetaForm] = useState({
    nombre: '', icono: '🎯', objetivo: '', moneda: 'ARS', progreso: '0'
  })
  const [inputPesos, setInputPesos] = useState('')
  const [inputUsd, setInputUsd] = useState('')

  useEffect(() => {
    fetchDolar()
      .then(setDolar)
      .catch(err => console.error('Error al obtener cotización del dólar:', err))
  }, [])

  const ahorroPesos = profile?.ahorro_pesos || 0
  const ahorroUsd = profile?.ahorro_usd || 0
  const patrimonioEnPesos = ahorroPesos + (ahorroUsd * dolar)
  const patrimonioEnUsd = (ahorroPesos / dolar) + ahorroUsd

  const handleAddSavings = async (tipo: 'pesos' | 'usd', isAdd: boolean) => {
    console.log('🟢 [AhorrosPage] handleAddSavings CALLED - tipo:', tipo, 'isAdd:', isAdd)
    console.log('🟢 [AhorrosPage] handleAddSavings - addMovimiento function:', typeof addMovimiento, addMovimiento)

    const input = tipo === 'pesos' ? inputPesos : inputUsd
    const amount = parseFloat(input)
    console.log('🟢 [AhorrosPage] handleAddSavings - input:', input, 'amount:', amount)

    if (!amount || amount <= 0) {
      console.log('🟢 [AhorrosPage] handleAddSavings - Invalid amount, returning')
      return
    }

    console.log('🟢 [AhorrosPage] Validation passed, calculating values...')
    const finalAmount = isAdd ? amount : -amount
    const field = tipo === 'pesos' ? 'ahorro_pesos' : 'ahorro_usd'
    const currentValue = tipo === 'pesos' ? ahorroPesos : ahorroUsd
    const newValue = Math.max(0, currentValue + finalAmount)
    console.log('🟢 [AhorrosPage] Calculated - field:', field, 'currentValue:', currentValue, 'newValue:', newValue)

    console.log('🟢 [AhorrosPage] Calling updateProfile...')
    await updateProfile({ [field]: newValue })
    console.log('🟢 [AhorrosPage] updateProfile completed')

    console.log('🟢 [AhorrosPage] Calling addMovimiento...')
    await addMovimiento(tipo, finalAmount)
    console.log('🟢 [AhorrosPage] addMovimiento completed')

    if (tipo === 'pesos') setInputPesos('')
    else setInputUsd('')
  }

  const handleSaveMeta = async () => {
    if (!metaForm.nombre || !metaForm.objetivo) return

    const data = {
      nombre: metaForm.nombre,
      icono: metaForm.icono,
      objetivo: parseFloat(metaForm.objetivo),
      progreso: parseFloat(metaForm.progreso) || 0,
      moneda: metaForm.moneda as 'ARS' | 'USD'
    }

    if (editingMeta) {
      await updateMeta(editingMeta.id, data)
    } else {
      await addMeta(data)
    }

    setShowMetaModal(false)
    setEditingMeta(null)
    resetMetaForm()
  }

  const resetMetaForm = () => {
    setMetaForm({ nombre: '', icono: '🎯', objetivo: '', moneda: 'ARS', progreso: '0' })
  }

  const openEditMeta = (m: Meta) => {
    setEditingMeta(m)
    setMetaForm({
      nombre: m.nombre,
      icono: m.icono,
      objetivo: String(m.objetivo),
      moneda: m.moneda,
      progreso: String(m.progreso)
    })
    setShowMetaModal(true)
  }

  const addToMeta = async (meta: Meta, amount: number) => {
    const newProgreso = meta.progreso + amount
    await updateMeta(meta.id, { progreso: newProgreso })
    
    if (newProgreso >= meta.objetivo && !meta.completada) {
      await updateMeta(meta.id, { completada: true })
      confetti({ particleCount: 100, spread: 70 })
    }
  }

  const iconOptions = ['🏖️', '🚗', '🏠', '💻', '📱', '✈️', '🎓', '💍', '🎯']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ahorros y Metas</h1>
        <p className="text-slate-500">Construí tu futuro 🚀</p>
      </div>

      {/* Patrimonio Hero - SEPARADO */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="text-sm opacity-80 mb-4">💰 Patrimonio Total</div>
        
        {/* Valores separados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm opacity-80">Pesos</div>
            <div className="text-xl font-bold">{formatMoney(ahorroPesos)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-sm opacity-80">Dólares</div>
            <div className="text-xl font-bold">{formatMoney(ahorroUsd, 'USD')}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <div className="text-sm opacity-80">Total en $</div>
            <div className="text-xl font-bold">{formatMoney(patrimonioEnPesos)}</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4">
            <div className="text-sm opacity-80">Total en USD</div>
            <div className="text-xl font-bold">{formatMoney(patrimonioEnUsd, 'USD')}</div>
          </div>
        </div>
        
        <div className="text-xs opacity-60 text-center">
          Cotización: {formatMoney(dolar)} por dólar
        </div>
      </div>

      {/* Savings Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pesos */}
        <div className="card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold">Pesos</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{formatMoney(ahorroPesos)}</div>
            </div>
            <span className="text-3xl">💵</span>
          </div>
          <input
            type="number"
            className="input mb-3"
            placeholder="Monto"
            value={inputPesos}
            onChange={e => setInputPesos(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => {
              console.log('🟢 [AhorrosPage] "Agregar Pesos" button CLICKED')
              handleAddSavings('pesos', true)
            }} className="btn btn-success flex-1 justify-center">
              <Plus className="w-4 h-4" /> Agregar
            </button>
            <button onClick={() => {
              console.log('🟢 [AhorrosPage] "Quitar Pesos" button CLICKED')
              handleAddSavings('pesos', false)
            }} className="btn btn-danger flex-1 justify-center">
              <Minus className="w-4 h-4" /> Quitar
            </button>
          </div>
          {/* Historial */}
          <div className="mt-4 pt-4 border-t border-slate-200 max-h-24 overflow-y-auto">
            {movimientos.filter(m => m.tipo === 'pesos').length > 0 ? (
              movimientos.filter(m => m.tipo === 'pesos').slice(0, 5).map(m => (
                <div key={m.id} className="flex justify-between text-sm py-1">
                  <span className="text-slate-500">{new Date(m.fecha).toLocaleDateString('es-AR')}</span>
                  <span className={m.monto > 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {m.monto > 0 ? '+' : ''}{formatMoney(m.monto)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center">Sin movimientos</p>
            )}
          </div>
        </div>

        {/* USD */}
        <div className="card p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="font-bold">Dólares</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(ahorroUsd, 'USD')}</div>
            </div>
            <span className="text-3xl">💲</span>
          </div>
          <input
            type="number"
            className="input mb-3"
            placeholder="Monto"
            value={inputUsd}
            onChange={e => setInputUsd(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={() => {
              console.log('🟢 [AhorrosPage] "Agregar USD" button CLICKED')
              handleAddSavings('usd', true)
            }} className="btn btn-success flex-1 justify-center">
              <Plus className="w-4 h-4" /> Agregar
            </button>
            <button onClick={() => {
              console.log('🟢 [AhorrosPage] "Quitar USD" button CLICKED')
              handleAddSavings('usd', false)
            }} className="btn btn-danger flex-1 justify-center">
              <Minus className="w-4 h-4" /> Quitar
            </button>
          </div>
          {/* Historial */}
          <div className="mt-4 pt-4 border-t border-slate-200 max-h-24 overflow-y-auto">
            {movimientos.filter(m => m.tipo === 'usd').length > 0 ? (
              movimientos.filter(m => m.tipo === 'usd').slice(0, 5).map(m => (
                <div key={m.id} className="flex justify-between text-sm py-1">
                  <span className="text-slate-500">{new Date(m.fecha).toLocaleDateString('es-AR')}</span>
                  <span className={m.monto > 0 ? 'text-emerald-600' : 'text-red-600'}>
                    {m.monto > 0 ? '+' : ''}{formatMoney(m.monto, 'USD')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm text-center">Sin movimientos</p>
            )}
          </div>
        </div>
      </div>

      {/* Metas */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">🎯 Metas</h3>
          <button onClick={() => { resetMetaForm(); setEditingMeta(null); setShowMetaModal(true) }} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>

        {metas.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Creá tu primera meta</p>
          </div>
        ) : (
          <div className="space-y-4">
            {metas.map(m => {
              const pct = Math.min((m.progreso / m.objetivo) * 100, 100)
              const isDone = pct >= 100

              return (
                <div key={m.id} className={`border-2 rounded-xl p-4 ${isDone ? 'bg-emerald-50 border-emerald-300' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-2xl mb-1">{m.icono}</div>
                      <div className="font-bold">{m.nombre}</div>
                      <div className="text-sm text-slate-500">Meta: {formatMoney(m.objetivo, m.moneda)}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditMeta(m)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                      <button onClick={() => deleteMeta(m.id)} className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full transition-all ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-indigo-600 font-bold">{formatMoney(m.progreso, m.moneda)}</span>
                    <span className="font-bold">{pct.toFixed(0)}%</span>
                  </div>

                  {isDone ? (
                    <div className="bg-emerald-100 text-emerald-700 p-3 rounded-lg text-center font-bold">
                      🎉 ¡FELICITACIONES!
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        className="input flex-1"
                        placeholder="Agregar"
                        id={`meta-input-${m.id}`}
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`meta-input-${m.id}`) as HTMLInputElement | null
                          if (!input) return
                          const val = parseFloat(input.value)
                          if (val > 0) {
                            addToMeta(m, val)
                            input.value = ''
                          }
                        }}
                        className="btn btn-success"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Meta Modal */}
      {showMetaModal && (
        <div className="modal-overlay" onClick={() => setShowMetaModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-lg">{editingMeta ? 'Editar' : 'Nueva'} Meta</h3>
              <button onClick={() => setShowMetaModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Vacaciones 2025"
                  value={metaForm.nombre}
                  onChange={e => setMetaForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Ícono</label>
                <div className="flex gap-2 flex-wrap">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setMetaForm(f => ({ ...f, icono: icon }))}
                      className={`w-10 h-10 rounded-lg text-xl ${metaForm.icono === icon ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-slate-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Objetivo</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="100000"
                    value={metaForm.objetivo}
                    onChange={e => setMetaForm(f => ({ ...f, objetivo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="label">Moneda</label>
                  <select
                    className="input"
                    value={metaForm.moneda}
                    onChange={e => setMetaForm(f => ({ ...f, moneda: e.target.value }))}
                  >
                    <option value="ARS">Pesos</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Progreso actual</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={metaForm.progreso}
                  onChange={e => setMetaForm(f => ({ ...f, progreso: e.target.value }))}
                />
              </div>
              <button onClick={handleSaveMeta} className="btn btn-primary w-full justify-center">
                {editingMeta ? 'Guardar' : 'Crear Meta 🎯'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
