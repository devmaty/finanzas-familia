'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { Download, CheckCircle, AlertCircle, Loader } from 'lucide-react'

interface ImportProgress {
  collection: string
  status: 'pending' | 'loading' | 'success' | 'error'
  count: number
  error?: string
}

export default function ImportPage() {
  const { user, profile } = useAuth()
  const [supabaseUrl, setSupabaseUrl] = useState('https://yzhmctutglxnamzgwyrp.supabase.co')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState<ImportProgress[]>([])
  const [log, setLog] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const updateProgress = (collection: string, status: ImportProgress['status'], count: number = 0, error?: string) => {
    setProgress(prev => {
      const existing = prev.find(p => p.collection === collection)
      if (existing) {
        return prev.map(p => p.collection === collection ? { ...p, status, count, error } : p)
      }
      return [...prev, { collection, status, count, error }]
    })
  }

  const fetchFromSupabase = async (table: string) => {
    addLog(`Fetching ${table} from Supabase...`)
    const response = await fetch(
      `${supabaseUrl}/rest/v1/${table}?select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch ${table}: ${response.statusText}`)
    }

    const data = await response.json()
    addLog(`✅ Found ${data.length} records in ${table}`)
    return data
  }

  const importToFirestore = async (collectionName: string, data: any[]) => {
    if (!user) return 0

    addLog(`Importing ${data.length} records to ${collectionName}...`)
    const collectionRef = collection(db, collectionName)
    let imported = 0

    for (const item of data) {
      try {
        // Remove id from Supabase and add Firebase user_id
        const { id, created_at, updated_at, ...rest } = item
        const firebaseData = {
          ...rest,
          user_id: user.uid,
          created_at: created_at ? new Date(created_at).toISOString() : new Date().toISOString()
        }

        await addDoc(collectionRef, firebaseData)
        imported++
      } catch (error) {
        console.error(`Error importing to ${collectionName}:`, error)
      }
    }

    addLog(`✅ Imported ${imported}/${data.length} records to ${collectionName}`)
    return imported
  }

  const startImport = async () => {
    if (!user || !profile) {
      alert('Debes estar logueado para importar')
      return
    }

    if (!supabaseKey) {
      alert('Por favor ingresá la Supabase Key')
      return
    }

    setImporting(true)
    setProgress([])
    setLog([])
    addLog('🚀 Iniciando importación desde Supabase...')

    try {
      // Definir qué colecciones importar
      const collections = [
        { supabase: 'gastos', firebase: 'gastos' },
        { supabase: 'impuestos', firebase: 'impuestos' },
        { supabase: 'tarjetas', firebase: 'tarjetas' },
        { supabase: 'metas', firebase: 'metas' },
        { supabase: 'categorias', firebase: 'categorias' },
        { supabase: 'movimientos_ahorro', firebase: 'movimientos_ahorro' },
        { supabase: 'tags', firebase: 'tags' }
      ]

      for (const { supabase, firebase } of collections) {
        try {
          updateProgress(firebase, 'loading')

          // Fetch from Supabase
          const data = await fetchFromSupabase(supabase)

          // Import to Firestore
          const count = await importToFirestore(firebase, data)

          updateProgress(firebase, 'success', count)
        } catch (error: any) {
          console.error(`Error importing ${firebase}:`, error)
          updateProgress(firebase, 'error', 0, error.message)
          addLog(`❌ Error en ${firebase}: ${error.message}`)
        }
      }

      addLog('🎉 ¡Importación completada!')
      alert('¡Importación completada! Refrescá la página para ver tus datos.')
    } catch (error: any) {
      console.error('Import error:', error)
      addLog(`❌ Error general: ${error.message}`)
      alert(`Error: ${error.message}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Importar desde Supabase</h1>
        <p className="text-slate-500">Importá todos tus datos históricos de Supabase a Firebase</p>
      </div>

      {/* Credentials */}
      <div className="card p-6">
        <h3 className="font-bold mb-4">Credenciales de Supabase</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Supabase URL</label>
            <input
              type="text"
              className="input"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              placeholder="https://xxxxx.supabase.co"
            />
          </div>
          <div>
            <label className="label">Supabase Anon Key (o Service Role Key)</label>
            <input
              type="password"
              className="input"
              value={supabaseKey}
              onChange={e => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
            <p className="text-xs text-slate-500 mt-1">
              Encontrá esta clave en: Supabase Dashboard → Settings → API
            </p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-slate-500 mb-1">Usuario</div>
          <div className="font-semibold">{profile?.email || 'No logueado'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500 mb-1">Origen</div>
          <div className="font-semibold">Supabase</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-500 mb-1">Destino</div>
          <div className="font-semibold">Firebase</div>
        </div>
      </div>

      {/* Import Button */}
      <div className="card p-6">
        <div className="mb-4">
          <h3 className="font-bold mb-2">¿Qué se va a importar?</h3>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>✅ Todos los gastos (histórico completo)</li>
            <li>✅ Todos los impuestos</li>
            <li>✅ Todas las tarjetas</li>
            <li>✅ Todas las metas</li>
            <li>✅ Todas las categorías</li>
            <li>✅ Todos los movimientos de ahorro</li>
            <li>✅ Todos los tags</li>
          </ul>
        </div>

        <button
          onClick={startImport}
          disabled={importing || !user || !supabaseKey}
          className="btn btn-primary w-full justify-center"
        >
          {importing ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Iniciar Importación
            </>
          )}
        </button>
      </div>

      {/* Progress */}
      {progress.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-4">Progreso</h3>
          <div className="space-y-3">
            {progress.map(p => (
              <div key={p.collection} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {p.status === 'loading' && <Loader className="w-5 h-5 animate-spin text-indigo-600" />}
                  {p.status === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {p.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  {p.status === 'pending' && <div className="w-5 h-5 rounded-full bg-slate-300" />}
                  <div>
                    <div className="font-semibold capitalize">{p.collection}</div>
                    {p.error && <div className="text-xs text-red-600">{p.error}</div>}
                  </div>
                </div>
                <div className="font-bold text-slate-600">
                  {p.count > 0 ? `${p.count} registros` : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="card p-6">
          <h3 className="font-bold mb-4">Log de Importación</h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-xs max-h-96 overflow-y-auto">
            {log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card p-6 bg-amber-50 border border-amber-200">
        <h3 className="font-bold mb-2 text-amber-900">⚠️ Importante</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• Esta página es temporal - podés borrarla después de importar</li>
          <li>• Los datos se importarán asociados a tu usuario actual de Firebase</li>
          <li>• Refrescá la página después de importar para ver los datos</li>
          <li>• Si algo falla, podés volver a ejecutar la importación</li>
          <li>• Usá la clave "anon key" de Supabase (la pública)</li>
        </ul>
      </div>
    </div>
  )
}
