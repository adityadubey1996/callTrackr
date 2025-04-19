import { Mail, Github, Twitter, Linkedin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-10 px-4 bg-gray-100 dark:bg-gray-800 transition-colors duration-200">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">AI Call Analyzer</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Transforming conversations into insights</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 mb-6 md:mb-0">
            <a
              href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              Documentation
            </a>
          </div>

          <div className="flex gap-4">
            <a
              href="mailto:support@aicallanalyzer.com"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label="Email support"
            >
              <Mail size={24} />
            </a>
            <a
              href="https://github.com/aicallanalyzer"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label="GitHub repository"
            >
              <Github size={24} />
            </a>
            <a
              href="https://twitter.com/aicallanalyzer"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label="Twitter profile"
            >
              <Twitter size={24} />
            </a>
            <a
              href="https://linkedin.com/company/aicallanalyzer"
              className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
              aria-label="LinkedIn profile"
            >
              <Linkedin size={24} />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-500 dark:text-gray-400">
            &copy; {new Date().getFullYear()} AI Call Analyzer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
