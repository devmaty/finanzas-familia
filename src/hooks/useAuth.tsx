'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Create Supabase client once per AuthProvider mount - tied to React lifecycle
  const supabase = useMemo(() => createClient(), [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('🔐 [useAuth] Initial mount')

    const getSession = async () => {
      console.log('🔐 [useAuth] Getting session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        console.log('🔐 [useAuth] Session result:', session ? 'FOUND' : 'NOT FOUND')

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)

          if (session?.user) {
            console.log('🔐 [useAuth] Fetching profile for user:', session.user.id)
            const profileData = await fetchProfile(session.user.id)
            if (mounted) setProfile(profileData)
          }
          console.log('🔐 [useAuth] Setting loading to FALSE')
          setLoading(false)
        }
      } catch (error) {
        console.error('🔐 [useAuth] Session error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          console.log('🔐 [useAuth] Error - Setting loading to FALSE')
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 [useAuth] Auth state change:', event, session ? 'HAS SESSION' : 'NO SESSION')
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_OUT') {
          console.log('🔐 [useAuth] SIGNED_OUT - Setting loading to FALSE')
          setProfile(null)
          setLoading(false)
        } else if (session?.user) {
          console.log('🔐 [useAuth] User logged in - Fetching profile')
          const profileData = await fetchProfile(session.user.id)
          if (mounted) setProfile(profileData)
          console.log('🔐 [useAuth] Profile fetched - Setting loading to FALSE')
          setLoading(false)
        } else {
          console.log('🔐 [useAuth] No user - Setting loading to FALSE')
          setProfile(null)
          setLoading(false)
        }
      }
    })

    return () => {
      console.log('🔐 [useAuth] Unmounting')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('🔐 [useAuth] signIn called - Setting loading to TRUE')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    // If error, clear loading state immediately
    // If success, onAuthStateChange will handle setting loading to false
    if (error) {
      console.log('🔐 [useAuth] signIn ERROR - Setting loading to FALSE')
      setLoading(false)
    } else {
      console.log('🔐 [useAuth] signIn SUCCESS - waiting for onAuthStateChange')
    }
    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
    setLoading(false)
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return

    console.log('🔧 [updateProfile] Starting update...', data)

    // Create a timeout that will reject after 5 seconds
    let timeoutId: NodeJS.Timeout | undefined
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        console.error('❌ [updateProfile] TIMEOUT - Query hung for 5 seconds, forcing page reload')
        reject(new Error('Query timeout'))
      }, 5000)
    })

    // Race between the actual query and the timeout
    try {
      const queryPromise = supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)

      const { error } = await Promise.race([queryPromise, timeoutPromise]) as any

      // Query completed successfully - clear the timeout!
      if (timeoutId) clearTimeout(timeoutId)
      console.log('✅ [updateProfile] Completed successfully')

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...data } : null)
      }
    } catch (err: any) {
      // Clear timeout in case of error too
      if (timeoutId) clearTimeout(timeoutId)

      if (err.message === 'Query timeout') {
        console.error('💥 [updateProfile] Supabase client is broken - clearing storage and reloading')
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
      } else {
        console.error('❌ [updateProfile] Error:', err)
      }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut, updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}