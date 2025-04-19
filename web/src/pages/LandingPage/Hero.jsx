"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { ChevronDown, Moon, Sun } from "lucide-react"
import AnimatedHeadline from "./AnimatedHeadline"
import { useTheme } from "./ThemeProvider"
import { useNavigate } from "react-router-dom";


export default function Hero() {
    const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme()
  const canvasRef = useRef(null)

  // Particle animation
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = Math.random() * 1 - 0.5
        this.speedY = Math.random() * 1 - 0.5
        this.color =
          theme === "dark"
            ? `rgba(${59 + Math.random() * 30}, ${130 + Math.random() * 30}, ${246 + Math.random() * 10}, ${0.3 + Math.random() * 0.4})`
            : `rgba(${59 + Math.random() * 30}, ${130 + Math.random() * 30}, ${246 + Math.random() * 10}, ${0.2 + Math.random() * 0.3})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Initialize particles
    const init = () => {
      particles = []
      const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 9000), 150)

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    // Connect particles with lines
    const connect = () => {
      const maxDistance = 150

      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.strokeStyle =
              theme === "dark" ? `rgba(59, 130, 246, ${opacity * 0.5})` : `rgba(59, 130, 246, ${opacity * 0.3})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      connect()
      animationFrameId = requestAnimationFrame(animate)
    }

    init()
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        {/* Particle animation canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>

        {/* Gradient overlay - less dark now */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-blue-500/10 dark:from-black/40 dark:to-blue-900/20 z-10"></div>

        {/* Background video with reduced opacity */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-30"
        >
          <source src="/interconnected-nodes.png" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-200/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 transition-colors duration-200 backdrop-blur-sm"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? (
          <Sun size={32} className="w-6 h-6 md:w-8 md:h-8" />
        ) : (
          <Moon size={32} className="w-6 h-6 md:w-8 md:h-8" />
        )}
      </button>

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-gray-900 dark:text-white">
        <AnimatedHeadline />

        <p className="mt-6 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto text-gray-800 dark:text-gray-200">
          Instantly transcribe, search, and analyze your sales calls and video demos.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
          className="mt-10 px-8 py-4 bg-transparent border-2 border-blue-500 rounded-full text-blue-600 dark:text-blue-400 font-bold text-lg transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-700 dark:hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]"
        >
          Get Started
        </motion.button>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
      >
        <ChevronDown size={32} className="text-gray-800 dark:text-white/80" />
      </motion.div>
    </section>
  )
}
