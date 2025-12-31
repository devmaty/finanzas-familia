'use client'

 codex/fix-month-change-display-issue-tozlze
import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
main
import { createClient } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { Tarjeta, Gasto, Impuesto, Categoria, Tag, Meta, MovimientoAhorro } from '@/types'
import { getMonthKey } from '@/lib/utils'

type DataContextType = {
  tarjetas: Tarjeta[]
  gastos: Gasto[]
  impuestos: Impuesto[]
  categorias: Categoria[]
  tags: Tag[]
  metas: Meta[]
  movimientos: MovimientoAhorro[]
  loading: boolean
  currentMonth: Date
  monthKey: string
  fetchAll: () => Promise<void>
  changeMonth: (delta: number) => void
  addTarjeta: (data: Omit<Tarjeta, 'id' | 'user_id' | 'created_at'>) => Promise<{ error: any }>
  updateTarjeta: (id: string, data: Partial<Tarjeta>) => Promise<{ error: any }>
  deleteTarjeta: (id: string) => Promise<{ error: any }>
  addGasto: (data: Omit<Gasto, 'id' | 'user_id' | 'created_at' | 'tarjeta' | 'categoria' | 'tags'>) => Promise<{ error: any, data?: Gasto }>
  updateGasto: (id: string, data: Partial<Gasto>) => Promise<{ error: any }>
  deleteGasto: (id: string) => Promise<{ error: any }>
  addImpuesto: (data: Omit<Impuesto, 'id' | 'user_id' | 'created_at' | 'tarjeta'>) => Promise<{ error: any }>
  updateImpuesto: (id: string, data: Partial<Impuesto>) => Promise<{ error: any }>
  deleteImpuesto: (id: string) => Promise<{ error: any }>
  addTag: (nombre: string) => Promise<{ error: any }>
  deleteTag: (id: string) => Promise<{ error: any }>
  addMeta: (data: Omit<Meta, 'id' | 'user_id' | 'created_at' | 'completada'>) => Promise<{ error: any }>
  updateMeta: (id: string, data: Partial<Meta>) => Promise<{ error: any }>
  deleteMeta: (id: string) => Promise<{ error: any }>
  addMovimiento: (tipo: 'pesos' | 'usd', monto: number) => Promise<{ error: any }>
  getGastosMes: (mes: string) => Gasto[]
  getImpuestosMes: (mes: string) => Impuesto[]
  getGastosNoProximoMes: (mesActual: string) => {
    gastos: Gasto[]
    cantidad: number
    totalARS: number
    totalUSD: number
  }
  getDiferenciaMeses: (mesActual: string, dolar: number) => {
    actual: { ars: number; usd: number; imp: number; total: number }
    proximo: { ars: number; usd: number; imp: number; total: number }
    diferencia: number
    diferenciaARS: number
    diferenciaUSD: number
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
 codex/fix-month-change-display-issue-tozlze
  const { user, loading: authLoading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const { user } = useAuth()
  const supabase = createClient()
 main
  
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [impuestos, setImpuestos] = useState<Impuesto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoAhorro[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const fetchAll = useCallback(async () => {
 codex/fix-month-change-display-issue-tozlze

    if (!user) {
      setTarjetas([])
      setGastos([])
      setImpuestos([])
      setCategorias([])
      setTags([])
      setMetas([])
      setMovimientos([])
      setLoading(false)
      return
    }
 main
    setLoading(true)
    try {
      if (!user) {
        setTarjetas([])
        setGastos([])
        setImpuestos([])
        setCategorias([])
        setTags([])
        setMetas([])
        setMovimientos([])
        return
      }

 codex/fix-month-change-display-issue-tozlze
      const [
        { data: tarjetasData },
        { data: gastosData },
        { data: impuestosData },
        { data: categoriasData },
        { data: tagsData },
        { data: metasData },
        { data: movimientosData }
      ] = await Promise.all([
        supabase.from('tarjetas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('gastos').select('*, tarjeta:tarjetas(*), categoria:categorias(*)').eq('user_id', user.id).order('fecha', { ascending: false }),
        supabase.from('impuestos').select('*, tarjeta:tarjetas(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('categorias').select('*').eq('user_id', user.id).order('nombre'),
        supabase.from('tags').select('*').eq('user_id', user.id).order('nombre'),
        supabase.from('metas').select('*').eq('user_id', user.id).order('created_at'),
        supabase.from('movimientos_ahorro').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(20)
      ])

      setTarjetas(tarjetasData || [])
      setGastos(gastosData || [])
      setImpuestos(impuestosData || [])
      setCategorias(categoriasData || [])
      setTags(tagsData || [])
      setMetas(metasData || [])
      setMovimientos(movimientosData || [])
    } catch (error) {
      console.error('Error fetching data', error)
      setTarjetas([])
      setGastos([])
      setImpuestos([])
      setCategorias([])
      setTags([])
      setMetas([])
      setMovimientos([])
    } finally {
      setLoading(false)
    }

    const [
      { data: tarjetasData },
      { data: gastosData },
      { data: impuestosData },
      { data: categoriasData },
      { data: tagsData },
      { data: metasData },
      { data: movimientosData }
    ] = await Promise.all([
      supabase.from('tarjetas').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('gastos').select('*, tarjeta:tarjetas(*), categoria:categorias(*)').eq('user_id', user.id).order('fecha', { ascending: false }),
      supabase.from('impuestos').select('*, tarjeta:tarjetas(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('categorias').select('*').eq('user_id', user.id).order('nombre'),
      supabase.from('tags').select('*').eq('user_id', user.id).order('nombre'),
      supabase.from('metas').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('movimientos_ahorro').select('*').eq('user_id', user.id).order('fecha', { ascending: false }).limit(20)
    ])

    setTarjetas(tarjetasData || [])
    setGastos(gastosData || [])
    setImpuestos(impuestosData || [])
    setCategorias(categoriasData || [])
    setTags(tagsData || [])
    setMetas(metasData || [])
    setMovimientos(movimientosData || [])
    setLoading(false)
 main
  }, [supabase, user])

  useEffect(() => {
    if (authLoading) {
      setLoading(true)
      return
    }
    fetchAll()
  }, [authLoading, fetchAll])

  useEffect(() => {
    if (user) {
      setCurrentMonth(new Date())
    }
  }, [user])

  useEffect(() => {
    if (user) {
      setCurrentMonth(new Date())
    }
  }, [user])

  // Tarjetas CRUD
  const addTarjeta = async (data: Omit<Tarjeta, 'id' | 'user_id' | 'created_at'>) => {
    const { data: newTarjeta, error } = await supabase
      .from('tarjetas')
      .insert({ ...data, user_id: user!.id })
      .select()
      .single()
    if (!error && newTarjeta) setTarjetas(prev => [...prev, newTarjeta])
    return { error }
  }

  const updateTarjeta = async (id: string, data: Partial<Tarjeta>) => {
    const { error } = await supabase.from('tarjetas').update(data).eq('id', id)
    if (!error) setTarjetas(prev => prev.map(t => t.id === id ? { ...t, ...data } : t))
    return { error }
  }

  const deleteTarjeta = async (id: string) => {
    const { error } = await supabase.from('tarjetas').delete().eq('id', id)
    if (!error) setTarjetas(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  // Gastos CRUD
  const addGasto = async (data: Omit<Gasto, 'id' | 'user_id' | 'created_at' | 'tarjeta' | 'categoria' | 'tags'>) => {
    const { data: newGasto, error } = await supabase
      .from('gastos')
      .insert({ ...data, user_id: user!.id })
      .select('*, tarjeta:tarjetas(*), categoria:categorias(*)')
      .single()
    if (!error && newGasto) setGastos(prev => [newGasto, ...prev])
    return { error, data: newGasto }
  }

  const updateGasto = async (id: string, data: Partial<Gasto>) => {
    const { error } = await supabase.from('gastos').update(data).eq('id', id)
    if (!error) {
      const { data: updated } = await supabase
        .from('gastos')
        .select('*, tarjeta:tarjetas(*), categoria:categorias(*)')
        .eq('id', id)
        .single()
      if (updated) setGastos(prev => prev.map(g => g.id === id ? updated : g))
    }
    return { error }
  }

  const deleteGasto = async (id: string) => {
    const { error } = await supabase.from('gastos').delete().eq('id', id)
    if (!error) setGastos(prev => prev.filter(g => g.id !== id))
    return { error }
  }

  // Impuestos CRUD
  const addImpuesto = async (data: Omit<Impuesto, 'id' | 'user_id' | 'created_at' | 'tarjeta'>) => {
    const { data: newImp, error } = await supabase
      .from('impuestos')
      .insert({ ...data, user_id: user!.id })
      .select('*, tarjeta:tarjetas(*)')
      .single()
    if (!error && newImp) setImpuestos(prev => [newImp, ...prev])
    return { error }
  }

  const updateImpuesto = async (id: string, data: Partial<Impuesto>) => {
    const { error } = await supabase.from('impuestos').update(data).eq('id', id)
    if (!error) {
      const { data: updated } = await supabase
        .from('impuestos')
        .select('*, tarjeta:tarjetas(*)')
        .eq('id', id)
        .single()
      if (updated) setImpuestos(prev => prev.map(i => i.id === id ? updated : i))
    }
    return { error }
  }

  const deleteImpuesto = async (id: string) => {
    const { error } = await supabase.from('impuestos').delete().eq('id', id)
    if (!error) setImpuestos(prev => prev.filter(i => i.id !== id))
    return { error }
  }

  // Tags CRUD
  const addTag = async (nombre: string) => {
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({ nombre, user_id: user!.id })
      .select()
      .single()
    if (!error && newTag) setTags(prev => [...prev, newTag])
    return { error }
  }

  const deleteTag = async (id: string) => {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (!error) setTags(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  // Metas CRUD
  const addMeta = async (data: Omit<Meta, 'id' | 'user_id' | 'created_at' | 'completada'>) => {
    const { data: newMeta, error } = await supabase
      .from('metas')
      .insert({ ...data, user_id: user!.id })
      .select()
      .single()
    if (!error && newMeta) setMetas(prev => [...prev, newMeta])
    return { error }
  }

  const updateMeta = async (id: string, data: Partial<Meta>) => {
    const { error } = await supabase.from('metas').update(data).eq('id', id)
    if (!error) setMetas(prev => prev.map(m => m.id === id ? { ...m, ...data } : m))
    return { error }
  }

  const deleteMeta = async (id: string) => {
    const { error } = await supabase.from('metas').delete().eq('id', id)
    if (!error) setMetas(prev => prev.filter(m => m.id !== id))
    return { error }
  }

  // Ahorros
  const addMovimiento = async (tipo: 'pesos' | 'usd', monto: number) => {
    const { error } = await supabase
      .from('movimientos_ahorro')
      .insert({ tipo, monto, user_id: user!.id })
    
    if (!error) {
      fetchAll()
    }
    return { error }
  }

  // CORREGIDO: Filtrar gastos por mes correctamente
  const getGastosMes = (mes: string) => {
    return gastos.filter(g => {
      // Gastos fijos siempre aparecen (pero solo si tienen ese mes_facturacion o anterior)
      if (g.es_fijo) {
        // Solo mostrar fijos si el mes_facturacion es igual o anterior al mes consultado
        const mesFact = new Date(g.mes_facturacion + '-01')
        const mesConsulta = new Date(mes + '-01')
        return mesFact <= mesConsulta
      }
      
      // Gastos en cuotas
      if (g.cuotas > 1) {
        const start = new Date(g.mes_facturacion + '-01')
        const current = new Date(mes + '-01')
        const diff = (current.getFullYear() - start.getFullYear()) * 12 + current.getMonth() - start.getMonth()
        return diff >= 0 && diff < g.cuotas
      }
      
      // Gastos normales: solo en su mes de facturación
      return g.mes_facturacion === mes
    })
  }

  const getImpuestosMes = (mes: string) => {
    return impuestos.filter(i => i.mes === mes)
  }

  // NUEVO: Calcular gastos que NO vienen el próximo mes
  const getGastosNoProximoMes = (mesActual: string) => {
    const gastosActuales = getGastosMes(mesActual)
    const nextMonth = new Date(mesActual + '-01')
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthKey = getMonthKey(nextMonth)
    const gastosProximo = getGastosMes(nextMonthKey)
    
    // Gastos que están en el mes actual pero NO en el próximo (excluyendo fijos)
    const noVienen = gastosActuales.filter(g => {
      if (g.es_fijo) return false // Los fijos siempre vienen
      return !gastosProximo.some(gp => gp.id === g.id)
    })
    
    let totalARS = 0
    let totalUSD = 0
    noVienen.forEach(g => {
      const monto = g.cuotas > 1 ? g.monto / g.cuotas : g.monto
      if (g.moneda === 'USD') totalUSD += monto
      else totalARS += monto
    })
    
    return {
      gastos: noVienen,
      cantidad: noVienen.length,
      totalARS,
      totalUSD
    }
  }

  // NUEVO: Calcular diferencia entre mes actual y próximo
  const getDiferenciaMeses = (mesActual: string, dolar: number) => {
    const gastosActuales = getGastosMes(mesActual)
    const impuestosActuales = getImpuestosMes(mesActual)
    
    const nextMonth = new Date(mesActual + '-01')
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    const nextMonthKey = getMonthKey(nextMonth)
    
    const gastosProximo = getGastosMes(nextMonthKey)
    const impuestosProximo = getImpuestosMes(nextMonthKey)
    
    // Total actual
    let totalActualARS = 0
    let totalActualUSD = 0
    gastosActuales.forEach(g => {
      const monto = g.cuotas > 1 ? g.monto / g.cuotas : g.monto
      if (g.moneda === 'USD') totalActualUSD += monto
      else totalActualARS += monto
    })
    const totalImpActual = impuestosActuales.reduce((s, i) => s + i.monto, 0)
    
    // Total próximo
    let totalProximoARS = 0
    let totalProximoUSD = 0
    gastosProximo.forEach(g => {
      const monto = g.cuotas > 1 ? g.monto / g.cuotas : g.monto
      if (g.moneda === 'USD') totalProximoUSD += monto
      else totalProximoARS += monto
    })
    const totalImpProximo = impuestosProximo.reduce((s, i) => s + i.monto, 0)
    
    const totalActual = totalActualARS + totalImpActual + (totalActualUSD * dolar)
    const totalProximo = totalProximoARS + totalImpProximo + (totalProximoUSD * dolar)
    
    return {
      actual: { ars: totalActualARS, usd: totalActualUSD, imp: totalImpActual, total: totalActual },
      proximo: { ars: totalProximoARS, usd: totalProximoUSD, imp: totalImpProximo, total: totalProximo },
      diferencia: totalActual - totalProximo,
      diferenciaARS: totalActualARS - totalProximoARS,
      diferenciaUSD: totalActualUSD - totalProximoUSD
    }
  }

  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const value: DataContextType = {
    tarjetas, gastos, impuestos, categorias, tags, metas, movimientos,
    loading, currentMonth, monthKey: getMonthKey(currentMonth),
    fetchAll, changeMonth,
    addTarjeta, updateTarjeta, deleteTarjeta,
    addGasto, updateGasto, deleteGasto,
    addImpuesto, updateImpuesto, deleteImpuesto,
    addTag, deleteTag,
    addMeta, updateMeta, deleteMeta,
    addMovimiento,
    getGastosMes, getImpuestosMes,
    getGastosNoProximoMes, getDiferenciaMeses
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
