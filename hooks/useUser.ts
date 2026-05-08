import { useEffect, useState } from 'react'
import { supabase, isSupabaseEnabled } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

let cachedUser: User | null | undefined = undefined

export function useUser(): User | null {
  const [user, setUser] = useState<User | null>(() => {
    if (cachedUser !== undefined) return cachedUser
    return null
  })

  useEffect(() => {
    if (!isSupabaseEnabled) return

    supabase.auth.getUser().then(({ data }) => {
      cachedUser = data.user
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      cachedUser = session?.user ?? null
      setUser(cachedUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  return user
}
