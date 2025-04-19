"use client"

import { motion } from "framer-motion"
import { Mic, MessageSquare, BarChart2, Database } from "lucide-react"

const features = [
  {
    icon: <Mic size={32} />,
    title: "Transcription",
    description: "Queue an audio/video file and get Whisper-turbo text.",
  },
  {
    icon: <MessageSquare size={32} />,
    title: "Chat",
    description: "Interact with any transcript—ask questions and get instant answers.",
  },
  {
    icon: <BarChart2 size={32} />,
    title: "Metric Creation",
    description: "Define custom metrics (Yes/No, Numeric, Text) for a single file.",
  },
  {
    icon: <Database size={32} />,
    title: "Batch Metrics",
    description: "Select multiple files to apply your metric and visualize results.",
  },
]

export default function Features() {
  return (
    <section className="py-20 px-4 bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Powerful Features</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white dark:bg-gray-700 rounded-xl p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.1),-5px_-5px_15px_rgba(255,255,255,0.1)] dark:shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(255,255,255,0.05)] transition-all duration-300"
            >
              <div className="flex justify-center mb-4 text-blue-500 dark:text-blue-400">{feature.icon}</div>
              <h3 className="text-xl font-bold text-center mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-center">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
