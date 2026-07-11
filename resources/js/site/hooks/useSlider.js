import { useEffect, useState } from 'react'

export function useSlider(length, { autoplay = true, interval = 6000 } = {}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!autoplay || length < 2) {
return
}

    const id = setInterval(() => setIndex((i) => (i + 1) % length), interval)

    return () => clearInterval(id)
  }, [length, autoplay, interval])

  const goPrev = () => setIndex((i) => (i - 1 + length) % length)
  const goNext = () => setIndex((i) => (i + 1) % length)

  return { index, setIndex, goPrev, goNext }
}
