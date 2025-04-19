"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => null,
  toggleTheme: () => null,
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children, defaultTheme = "dark" }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || defaultTheme)

  useEffect(() => {
    const root = window.document.documentElement

    // Remove the previous theme class
    root.classList.remove("light", "dark")

    // Add the current theme class
    root.classList.add(theme)

    // Store the current theme in localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const value = {
    theme,
    setTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
