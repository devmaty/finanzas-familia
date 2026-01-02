'use client'

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './useAuth'
import { MovimientoAhorro, Meta, Tarjeta, Gasto, Impuesto, Categoria, Tag } from '@/types'

type DataContextType = {
  movimientos: MovimientoAhorro[]
  metas: Meta[]
  tarjetas: Tarjeta[]
  gastos: Gasto[]
  impuestos: Impuesto[]
  categorias: Categoria[]
  tags: Tag[]
  loading: boolean
  currentMonth: Date
  monthKey: string
  fetchAll: () => Promise<void>
  changeMonth: (delta: number) => void
  addMovimiento: (tipo: 'pesos' | 'usd', monto: number) => Promise<{ error: any }>
  addMeta: (data: any) => Promise<{ error: any }>
  updateMeta: (id: string, data: any) => Promise<{ error: any }>
  deleteMeta: (id: string) => Promise<{ error: any }>
  addTag: (nombre: string) => Promise<{ error: any }>
  deleteTag: (id: string) => Promise<{ error: any }>
  addGasto: (data: any) => Promise<{ error: any, data?: Gasto }>
  updateGasto: (id: string, data: any) => Promise<{ error: any }>
  deleteGasto: (id: string) => Promise<{ error: any }>
  addTarjeta: (data: any) => Promise<{ error: any }>
  updateTarjeta: (id: string, data: any) => Promise<{ error: any }>
  deleteTarjeta: (id: string) => Promise<{ error: any }>
  addImpuesto: (data: any) => Promise<{ error: any }>
  updateImpuesto: (id: string, data: any) => Promise<{ error: any }>
  deleteImpuesto: (id: string) => Promise<{ error: any }>
  getGastosMes: (mes: string) => Gasto[]
  getImpuestosMes: (mes: string) => Impuesto[]
  getGastosNoProximoMes: (mesActual: string) => any
  getDiferenciaMeses: (mesActual: string, dolar: number) => any
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()

  console.log('📊 [Firebase DataProvider] RENDER - authLoading:', authLoading, 'user:', user?.uid || 'NULL')

  const [movimientos, setMovimientos] = useState<MovimientoAhorro[]>([])
  const [metas, setMetas] = useState<Meta[]>([])
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([])
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [impuestos, setImpuestos] = useState<Impuesto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthKey = currentMonth.toISOString().slice(0, 7)

  const fetchAll = useCallback(async () => {
    console.log('📊 [Firebase useData] fetchAll called')
    console.log('📊 [Firebase useData] Current user.uid:', user?.uid)

    setLoading(true)
    try {
      if (!user) {
        console.log('📊 [Firebase useData] No user - Clearing data')
        setMovimientos([])
        setLoading(false)
        return
      }

      console.log('📊 [Firebase useData] Fetching movimientos for user:', user.uid)
      const startTime = Date.now()

      // Fetch movimientos
      const movimientosRef = collection(db, 'movimientos_ahorro')
      const movimientosQuery = query(
        movimientosRef,
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      )
      const movimientosSnap = await getDocs(movimientosQuery)
      const movimientosData = movimientosSnap.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          tipo: data.tipo,
          monto: data.monto,
          user_id: data.user_id,
          created_at: data.created_at instanceof Timestamp
            ? data.created_at.toDate().toISOString()
            : data.created_at
        }
      }) as MovimientoAhorro[]

      console.log('📊 [Firebase useData] Movimientos result:', movimientosData.length, 'rows')

      const endTime = Date.now()
      console.log('📊 [Firebase useData] Data fetched successfully in', endTime - startTime, 'ms')

      setMovimientos(movimientosData)
      setLoading(false)
    } catch (error) {
      console.error('📊 [Firebase useData] Error fetching data:', error)
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    console.log('📊 [Firebase useData] useEffect triggered - authLoading:', authLoading, 'user:', user?.uid || 'NULL')

    if (!authLoading && user) {
      console.log('📊 [Firebase useData] User exists - Calling fetchAll')
      fetchAll()
    } else if (!authLoading && !user) {
      console.log('📊 [Firebase useData] No user and auth done loading - Setting loading to FALSE')
      setLoading(false)
    } else {
      console.log('📊 [Firebase useData] Auth still loading - waiting...')
    }
  }, [user, authLoading, fetchAll])

  const addMovimiento = useCallback(async (tipo: 'pesos' | 'usd', monto: number) => {
    if (!user) {
      console.error('💵 [Firebase addMovimiento] No user!')
      return { error: new Error('No user') }
    }

    console.log('💵 [Firebase addMovimiento] called - tipo:', tipo, 'monto:', monto)
    console.log('💵 [Firebase addMovimiento] user.uid:', user.uid)

    const insertData = {
      tipo,
      monto,
      user_id: user.uid,
      created_at: serverTimestamp()
    }

    console.log('💵 [Firebase addMovimiento] Inserting:', insertData)

    try {
      const movimientosRef = collection(db, 'movimientos_ahorro')
      await addDoc(movimientosRef, insertData)

      console.log('💵 [Firebase addMovimiento] SUCCESS - Calling fetchAll')
      await fetchAll()

      return { error: null }
    } catch (error) {
      console.error('💵 [Firebase addMovimiento] ERROR:', error)
      return { error }
    }
  }, [user, fetchAll])

  // Stub functions for features not migrated yet
  const changeMonth = useCallback((delta: number) => {
    console.log('⚠️ [Firebase] changeMonth not implemented yet')
  }, [])

  const addMeta = useCallback(async (data: any) => {
    console.log('⚠️ [Firebase] addMeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const updateMeta = useCallback(async (id: string, data: any) => {
    console.log('⚠️ [Firebase] updateMeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const deleteMeta = useCallback(async (id: string) => {
    console.log('⚠️ [Firebase] deleteMeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const addTag = useCallback(async (nombre: string) => {
    console.log('⚠️ [Firebase] addTag not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const deleteTag = useCallback(async (id: string) => {
    console.log('⚠️ [Firebase] deleteTag not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const addGasto = useCallback(async (data: any) => {
    console.log('⚠️ [Firebase] addGasto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const updateGasto = useCallback(async (id: string, data: any) => {
    console.log('⚠️ [Firebase] updateGasto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const deleteGasto = useCallback(async (id: string) => {
    console.log('⚠️ [Firebase] deleteGasto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const addTarjeta = useCallback(async (data: any) => {
    console.log('⚠️ [Firebase] addTarjeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const updateTarjeta = useCallback(async (id: string, data: any) => {
    console.log('⚠️ [Firebase] updateTarjeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const deleteTarjeta = useCallback(async (id: string) => {
    console.log('⚠️ [Firebase] deleteTarjeta not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const addImpuesto = useCallback(async (data: any) => {
    console.log('⚠️ [Firebase] addImpuesto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const updateImpuesto = useCallback(async (id: string, data: any) => {
    console.log('⚠️ [Firebase] updateImpuesto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const deleteImpuesto = useCallback(async (id: string) => {
    console.log('⚠️ [Firebase] deleteImpuesto not implemented yet')
    return { error: new Error('Not implemented') }
  }, [])

  const getGastosMes = useCallback((mes: string) => {
    return []
  }, [])

  const getImpuestosMes = useCallback((mes: string) => {
    return []
  }, [])

  const getGastosNoProximoMes = useCallback((mesActual: string) => {
    return { gastos: [], cantidad: 0, totalARS: 0, totalUSD: 0 }
  }, [])

  const getDiferenciaMeses = useCallback((mesActual: string, dolar: number) => {
    return {
      actual: { ars: 0, usd: 0, imp: 0, total: 0 },
      proximo: { ars: 0, usd: 0, imp: 0, total: 0 },
      diferencia: 0,
      diferenciaARS: 0,
      diferenciaUSD: 0
    }
  }, [])

  const value: DataContextType = {
    movimientos,
    metas,
    tarjetas,
    gastos,
    impuestos,
    categorias,
    tags,
    loading,
    currentMonth,
    monthKey,
    fetchAll,
    changeMonth,
    addMovimiento,
    addMeta,
    updateMeta,
    deleteMeta,
    addTag,
    deleteTag,
    addGasto,
    updateGasto,
    deleteGasto,
    addTarjeta,
    updateTarjeta,
    deleteTarjeta,
    addImpuesto,
    updateImpuesto,
    deleteImpuesto,
    getGastosMes,
    getImpuestosMes,
    getGastosNoProximoMes,
    getDiferenciaMeses
  }

  console.log('📊 [Firebase useData] Creating context value - loading:', loading, 'movimientos:', movimientos.length)

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
