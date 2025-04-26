'use client'

import { useCurrentUserName } from '@/hooks/use-current-user-name'
import { createClient } from '@/lib/client'
import { useEffect, useState } from 'react'

const supabase = createClient()

export type RealtimeUser = {
  id: string
  name: string
}

export const useRealtimePresenceRoom = (roomName: string) => {
  const currentUserName = useCurrentUserName()

  const [users, setUsers] = useState<Record<string, RealtimeUser>>({})

  useEffect(() => {
    const room = supabase.channel(roomName)

    room
      .on('presence', { event: 'sync' }, () => {
        const newState = room.presenceState<{ name: string }>()

        const newUsers = Object.fromEntries(
          Object.entries(newState).map(([key, values]) => [
            key,
            { name: values[0].name },
          ])
        ) as Record<string, RealtimeUser>
        setUsers(newUsers)
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') {
          return
        }

        await room.track({
          name: currentUserName,
        })
      })

    return () => {
      room.unsubscribe()
    }
  }, [roomName, currentUserName])

  return { users }
}
