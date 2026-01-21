"use client";

import { motion } from "framer-motion";

interface TypewriterTextProps {
  text: string;
  className?: string;
  delay?: number; // Thời gian chờ trước khi bắt đầu gõ (giây)
  speed?: number; // Tốc độ gõ giữa các ký tự (giây)
}

export function TypewriterText({
  text,
  className,
  delay = 0,
  speed = 0.03, // Tốc độ mặc định: 0.03s mỗi ký tự
}: TypewriterTextProps) {
  // Tách chuỗi thành mảng các ký tự
  const characters = text.split("");

  // Variants cho container (để quản lý việc xuất hiện tuần tự)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: speed, 
        delayChildren: delay, 
      },
    },
  };

  // Variants cho từng ký tự
  const charVariants = {
    hidden: { opacity: 0, y: 5 }, 
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.1 }, 
    },
  };

  return (
    <motion.p
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {characters.map((char, index) => (
        <motion.span key={index} variants={charVariants}>
          {char}
        </motion.span>
      ))}
    </motion.p>
  );
}
