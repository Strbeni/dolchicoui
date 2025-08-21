"use client"

import { useState, useEffect, useCallback } from "react"

export function useInfiniteScroll<T>(initialItems: T[], loadMoreItems: () => T[], itemsPerPage = 10) {
  const [items, setItems] = useState<T[]>(initialItems.slice(0, itemsPerPage))
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialItems.length > itemsPerPage)

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const currentLength = items.length
      const moreItems = loadMoreItems()
      const newItems = moreItems.slice(currentLength, currentLength + itemsPerPage)

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems((prev) => [...prev, ...newItems])
      }

      setLoading(false)
    }, 1000)
  }, [items.length, loading, hasMore, loadMoreItems, itemsPerPage])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMore()
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [loadMore])

  return { items, loading, hasMore, loadMore }
}
