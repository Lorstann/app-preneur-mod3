"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import type { ComponentProps } from "react";

export function MotionDiv({ children, ...props }: ComponentProps<typeof motion.div>) {
  const shouldReduceMotion = useReducedMotion();
  const motionProps: MotionProps = shouldReduceMotion
    ? { initial: false, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 } };

  return (
    <motion.div {...motionProps} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionButton({ children, ...props }: ComponentProps<typeof motion.button>) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.button
      {...props}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}

