'use server'

import { createClient } from '@/lib/supabase/server'
import { cancelOrder } from '@/lib/services/admin.service'
import { revalidatePath } from 'next/cache'

export async function cancelOrderAction(orderId: string, reason: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    // Admin check (middleware does it, but double check is good or trust middleware)
    // Assuming middleware ensures admin access to this route.

    try {
        await cancelOrder(orderId, reason, user.id)
        revalidatePath(`/admin/orders/${orderId}`)
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
