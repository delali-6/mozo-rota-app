'use client'

import { useEffect, useRef, useState } from 'react'

const BOTTOM_VISIBILITY_THRESHOLD = 96

// Hides the mobile bottom nav when the user reaches the page end, then restores it once they scroll upward.
export function useMobileBottomNavVisibility(resetKey: string) {
    const [isVisible, setIsVisible] = useState(true)
    const lastScrollY = useRef(0)

    useEffect(() => {
        lastScrollY.current = window.scrollY

        const frameId = window.requestAnimationFrame(() => {
            setIsVisible(true)
        })

        return () => window.cancelAnimationFrame(frameId)
    }, [resetKey])

    useEffect(() => {
        const updateVisibility = () => {
            const currentScrollY = window.scrollY
            const scrollBottom = currentScrollY + window.innerHeight
            const bottomGap = document.documentElement.scrollHeight - scrollBottom
            const scrollingUp = currentScrollY < lastScrollY.current

            if (bottomGap <= BOTTOM_VISIBILITY_THRESHOLD) {
                setIsVisible(false)
            } else if (scrollingUp || currentScrollY <= 16) {
                setIsVisible(true)
            }

            lastScrollY.current = currentScrollY
        }

        updateVisibility()

        window.addEventListener('scroll', updateVisibility, { passive: true })
        window.addEventListener('resize', updateVisibility)

        return () => {
            window.removeEventListener('scroll', updateVisibility)
            window.removeEventListener('resize', updateVisibility)
        }
    }, [])

    return isVisible
}