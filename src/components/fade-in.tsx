'use client';
import { motion } from 'framer-motion';
export const FadeIn = ({ children }: { children: React.ReactNode }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{children}</motion.div>
);
