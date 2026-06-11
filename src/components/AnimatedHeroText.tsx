import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface AnimatedHeroTextProps {
  title: string;
  description: string;
}

export default function AnimatedHeroText({ title, description }: AnimatedHeroTextProps) {
  const [animationKey, setAnimationKey] = useState(0);

  // Restart animation every 10 seconds to loop infinitely
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey((prev) => prev + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const titleWords = title.split(" ");
  const descWords = description.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const wordVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <div key={animationKey} className="flex flex-col gap-1 sm:gap-2 relative z-10">
      {/* Title */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-x-2 sm:gap-x-3 mb-1 sm:mb-2"
      >
        {titleWords.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariant}
            className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-none inline-block cursor-pointer"
            whileHover={{ 
              scale: 1.1, 
              y: -5, 
              color: "#34d399", 
              textShadow: "0px 0px 15px rgba(52,211,153,0.8)" 
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      {/* Description */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-x-1 sm:gap-x-1.5 max-w-2xl"
      >
        {descWords.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariant}
            className="text-xs sm:text-sm md:text-base font-sans text-stone-400 leading-relaxed inline-block cursor-crosshair"
            whileHover={{ 
              scale: 1.15, 
              color: "#f8fafc",
              y: -2,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
           {word}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
