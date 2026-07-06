"use client";

import { motion } from "framer-motion";

export default function Loading() {
  const containerVariants = {
    start: {
      transition: {
        staggerChildren: 0.2,
      },
    },
    end: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const dotVariants = {
    start: {
      y: "0%",
    },
    end: {
      y: "100%",
    },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut",
  };

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg-color)",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <motion.div
        variants={containerVariants}
        initial="start"
        animate="end"
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            variants={dotVariants}
            transition={dotTransition}
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "var(--c-gold)",
              borderRadius: "50%",
              display: "block"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
