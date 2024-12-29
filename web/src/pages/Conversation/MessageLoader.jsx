import React from "react";
import { motion } from "framer-motion";

const MessageLoader = () => {
  return (
    <div
      className="flex space-x-2 p-4 bg-secondary rounded-lg"
      style={{ width: "fit-content" }}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default MessageLoader;
