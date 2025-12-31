'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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
  const supabase = createClient()

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

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            const profileData = await fetchProfile(session.user.id)
            if (mounted) setProfile(profileData)
          }
          setLoading(false)
        }
      } catch (error) {
        console.error('Session error:', error)
        if (mounted) {
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
        }
      }
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
        } else if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) setProfile(profileData)
          setLoading(false)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    // If error, clear loading state immediately
    // If success, onAuthStateChange will handle setting loading to false
    if (error) {
      setLoading(false)
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
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
    
    if (!error) {
      setProfile(prev => prev ? { ...prev, ...data } : null)
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