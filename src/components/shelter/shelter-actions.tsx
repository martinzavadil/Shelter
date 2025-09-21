'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Heart, MapPin, Check } from 'lucide-react'
import { toast } from 'sonner'

interface ShelterActionsProps {
  shelterId: string
  className?: string
}

interface ShelterListState {
  inWishlist: boolean
  inVisited: boolean
}

export function ShelterActions({ shelterId, className = '' }: ShelterActionsProps) {
  const { data: session } = useSession()
  const [state, setState] = useState<ShelterListState>({
    inWishlist: false,
    inVisited: false,
  })
  const [loading, setLoading] = useState<{
    wishlist: boolean
    visited: boolean
  }>({
    wishlist: false,
    visited: false,
  })

  // Check current state when component mounts or session changes
  useEffect(() => {
    if (session?.user?.id) {
      checkCurrentState()
    }
  }, [session?.user?.id, shelterId])

  const checkCurrentState = async () => {
    try {
      const response = await fetch('/api/shelter-lists')
      if (response.ok) {
        const data = await response.json()
        const inWishlist = data.wishlist.some((item: any) => item.shelterId === shelterId)
        const inVisited = data.visited.some((item: any) => item.shelterId === shelterId)
        setState({ inWishlist, inVisited })
      }
    } catch (error) {
      console.error('Error checking shelter list state:', error)
    }
  }

  const toggleList = async (listType: 'wishlist' | 'visited') => {
    if (!session?.user?.id) {
      toast.error('Please log in to use this feature')
      return
    }

    const isCurrentlyInList = state[listType === 'wishlist' ? 'inWishlist' : 'inVisited']
    setLoading(prev => ({ ...prev, [listType]: true }))

    try {
      if (isCurrentlyInList) {
        // Remove from list
        const response = await fetch(
          `/api/shelter-lists?shelterId=${shelterId}&listType=${listType}`,
          { method: 'DELETE' }
        )

        if (response.ok) {
          setState(prev => ({
            ...prev,
            [listType === 'wishlist' ? 'inWishlist' : 'inVisited']: false,
          }))
          toast.success(`Removed from ${listType}`)
        } else {
          const error = await response.json()
          toast.error(error.error || `Failed to remove from ${listType}`)
        }
      } else {
        // Add to list
        const response = await fetch('/api/shelter-lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shelterId, listType }),
        })

        if (response.ok) {
          setState(prev => ({
            ...prev,
            [listType === 'wishlist' ? 'inWishlist' : 'inVisited']: true,
          }))
          toast.success(`Added to ${listType}`)
        } else {
          const error = await response.json()
          toast.error(error.error || `Failed to add to ${listType}`)
        }
      }
    } catch (error) {
      console.error(`Error toggling ${listType}:`, error)
      toast.error(`Failed to update ${listType}`)
    } finally {
      setLoading(prev => ({ ...prev, [listType]: false }))
    }
  }

  if (!session?.user?.id) {
    return null
  }

  return (
    <div className={`flex gap-2 ${className.includes('w-full') ? 'flex-col' : ''} ${className}`}>
      <Button
        variant={state.inWishlist ? "default" : "outline"}
        size="sm"
        onClick={() => toggleList('wishlist')}
        disabled={loading.wishlist || loading.visited}
        className={`flex items-center gap-2 ${className.includes('w-full') ? 'w-full' : ''}`}
      >
        <Heart
          className={`h-4 w-4 ${state.inWishlist ? 'fill-current' : ''}`}
        />
        {state.inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
      </Button>

      <Button
        variant={state.inVisited ? "default" : "outline"}
        size="sm"
        onClick={() => toggleList('visited')}
        disabled={loading.wishlist || loading.visited}
        className={`flex items-center gap-2 ${className.includes('w-full') ? 'w-full' : ''}`}
      >
        <Check className={`h-4 w-4 ${state.inVisited ? 'fill-current' : ''}`} />
        {state.inVisited ? 'Visited' : 'Mark as Visited'}
      </Button>
    </div>
  )
}