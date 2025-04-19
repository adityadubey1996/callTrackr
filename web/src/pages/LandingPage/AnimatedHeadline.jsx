"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const headlines = [
  "Turn Every Call into Closed Deals",
  "Unlock Hidden Insights in Your Conversations",
  "Your Calls, Fully Indexed & Searchable",
]

export default function AnimatedHeadline() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-20 sm:h-24 md:h-28 overflow-hidden" aria-label={headlines.join(", ")}>
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 text-3xl sm:text-4xl md:text-5xl font-bold text-center"
        >
          {headlines[currentIndex]}
        </motion.h1>
      </AnimatePresence>
    </div>
  )
}
