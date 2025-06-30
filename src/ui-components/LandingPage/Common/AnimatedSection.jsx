import React from 'react';
import { motion } from 'framer-motion';

const AnimatedSection = ({ children, id, bg = 'bg-white' }) => {
  return (
    <motion.section
      id={id}
      className={`relative py-20 md:py-24 ${bg}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 relative z-10">
        {children}
      </div>
    </motion.section>
  );
};

export default AnimatedSection;