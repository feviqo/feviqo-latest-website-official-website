import React from 'react';
import { motion } from 'motion/react';

interface WordFadeUpProps {
  words: Array<{
    text: string;
    className?: string;
  }>;
  className?: string;
}

export const WordFadeUpHeadline: React.FC<WordFadeUpProps> = ({ words, className = '' }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.h1
      className={`flex flex-wrap items-baseline gap-x-[0.28em] gap-y-1 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((item, index) => (
        <motion.span
          key={`${item.text}-${index}`}
          variants={wordVariants}
          className={`inline-block ${item.className || ''}`}
        >
          {item.text}
        </motion.span>
      ))}
    </motion.h1>
  );
};
