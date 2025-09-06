// src/components/Logo.jsx
import { motion } from "framer-motion";
import React from 'react';

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      whileHover={{ scale: 1.1, rotate: 1 }}
      className="ml-4 select-none cursor-pointer"
    >
      <h2
        className="text-5xl font-extrabold tracking-wide 
                   bg-gradient-to-r from-orange-600 via-red-600 to-yellow-400 
                   bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,90,0,0.8)] 
                   animate-fire font-[Flame]"
      >
        EduTrack
      </h2>
    </motion.div>
  );
}
