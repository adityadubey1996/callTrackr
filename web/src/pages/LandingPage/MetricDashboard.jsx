"use client"

import { motion } from "framer-motion"
import { BarChart, PieChart, LineChart, Activity } from "lucide-react"

export default function MetricsDashboard() {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Visualize Your Insights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Call Performance</h3>
              <BarChart size={24} className="text-blue-500" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Performance metrics visualization</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Conversation Topics</h3>
              <PieChart size={24} className="text-blue-500" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Topic distribution chart</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Sentiment Analysis</h3>
              <LineChart size={24} className="text-blue-500" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Sentiment trend visualization</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Key Metrics</h3>
              <Activity size={24} className="text-blue-500" />
            </div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">Key performance indicators</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
