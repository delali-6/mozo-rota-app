'use client'

import { ReactNode, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type CarouselProps = {
    children: ReactNode
    showDots?: boolean
    showArrows?: boolean
}

// Horizontal carousel used for compact card previews, such as open shifts on the dashboard.
export default function Carousel({
    children,
    showDots = true,
    showArrows = true,
}: CarouselProps) {

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        dragFree: true,
        loop: false,
    })

    const [selectedIndex, setSelectedIndex] = useState(0)
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

    // Moves to the previous Embla snap when desktop arrows are shown.
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev()
    }, [emblaApi])

    // Moves to the next Embla snap when desktop arrows are shown.
    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext()
    }, [emblaApi])

    // Lets pagination dots jump directly to a carousel item.
    const scrollTo = useCallback(
        (index: number) => {
            if (emblaApi) emblaApi.scrollTo(index)
        },
        [emblaApi]
    )

    // Keeps dot state synchronized with drag, arrow, and programmatic carousel movement.
    const onSelect = useCallback(() => {
        if (!emblaApi) return

        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {

        if (!emblaApi) return

        const initCarouselState = window.setTimeout(() => {
            setScrollSnaps(emblaApi.scrollSnapList())
            onSelect()
        }, 0)

        emblaApi.on('select', onSelect)

        emblaApi.on('reInit', onSelect)

        return () => {
            window.clearTimeout(initCarouselState)
            emblaApi.off('select', onSelect)
            emblaApi.off('reInit', onSelect)
        }

    }, [emblaApi, onSelect])

    return (

        <div className="relative">

            {/* Desktop arrows */}

            {showArrows && (

                <>
                    <button
                        onClick={scrollPrev}
                        className="
                        hidden
                        md:flex
                        absolute
                        left-0
                        top-1/2
                        -translate-y-1/2
                        -translate-x-5
                        z-10
                        w-10
                        h-10
                        rounded-full
                        bg-white
                        shadow-lg
                        border
                        items-center
                        justify-center
                        hover:bg-[#F5F5F5]
                        "
                    >

                        <ChevronLeft size={20} />

                    </button>

                    <button
                        onClick={scrollNext}
                        className="
                        hidden
                        md:flex
                        absolute
                        right-0
                        top-1/2
                        translate-x-5
                        -translate-y-1/2
                        z-10
                        w-10
                        h-10
                        rounded-full
                        bg-white
                        shadow-lg
                        border
                        items-center
                        justify-center
                        hover:bg-[#F5F5F5]
                        "
                    >

                        <ChevronRight size={20} />

                    </button>
                </>

            )}

            {/* Embla */}

            <div
                ref={emblaRef}
                className="overflow-hidden"
            >

                <div className="flex gap-5">

                    {children}

                </div>

            </div>

            {/* Pagination */}

            {showDots && scrollSnaps.length > 1 && (

                <div className="flex justify-center gap-2 mt-6">

                    {scrollSnaps.map((_, index) => (

                        <button
                            key={index}
                            onClick={() => scrollTo(index)}
                            className={`
                                w-3
                                h-3
                                rounded-full
                                transition-all
                                ${
                                    index === selectedIndex
                                        ? 'bg-[#6F4E37] scale-110'
                                        : 'bg-gray-300'
                                }
                            `}
                        />

                    ))}

                </div>

            )}

        </div>

    )

}
