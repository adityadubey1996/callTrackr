"use client";

import React from "react";
import { motion } from "framer-motion";

const AnimatedLoader = ({ text = "Loading...", classNameProps }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 rounded-lg
      ${classNameProps}`}
    >
      <svg
        width="50"
        height="50"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        className="text-background"
      >
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          initial={{ pathLength: 0, rotate: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M50 15 L50 85"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.path
          d="M15 50 L85 50"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: [0, 1, 0] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
      </svg>
      <motion.p
        className="mt-4 text-sm font-medium text-background text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        {text}
      </motion.p>
    </div>
  );
};

export default AnimatedLoader;
