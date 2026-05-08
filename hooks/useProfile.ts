import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { demoUser } from '@/lib/mockData'
import { getInitials } from '@/lib/utils'

export interface UserProfile {
    fullName: string
    email: string
    initials: string
    planType: 'free' | 'premium'
    age: number | null
    goalHeightCm: number | null
}

export function useProfile() {
    return useQuery<UserProfile>({
        queryKey: ['profile'],
        queryFn: async () => {
            const { data: { user }, error: authErr } = await supabase.auth.getUser()
            if (authErr || !user) throw authErr ?? new Error('Not authenticated')

            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, plan_type, age, goal_height_cm')
                .eq('id', user.id)
                .maybeSingle()

            const fullName =
                profile?.display_name ||
                (user.user_metadata?.full_name as string | undefined) ||
                user.email?.split('@')[0] ||
                'User'

            return {
                fullName,
                email: user.email ?? '',
                initials: getInitials(fullName),
                planType: (profile?.plan_type as 'free' | 'premium') ?? 'free',
                age: profile?.age ?? null,
                goalHeightCm: profile?.goal_height_cm ?? null,
            }
        },
        placeholderData: {
            fullName: demoUser.fullName,
            email: demoUser.email,
            initials: demoUser.initials,
            planType: 'free',
            age: 16,
            goalHeightCm: 180,
        },
    })
}
