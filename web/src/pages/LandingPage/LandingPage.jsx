"use client"

import { useEffect } from "react"
import { ThemeProvider } from "./ThemeProvider"
import Hero from "./Hero"
import Features from "./Features"
import Footer from "./Footer"

function LandingPage() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <ThemeProvider defaultTheme="dark">
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Hero />
        <Features />
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default LandingPage
