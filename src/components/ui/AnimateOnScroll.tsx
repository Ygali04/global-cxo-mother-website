"use client"
import { motion } from "framer-motion"
import React, { ReactNode } from "react"

interface AnimateOnScrollProps {
    children: ReactNode;
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
    style?: React.CSSProperties;
}

const AnimateOnScroll = ({ children, delay = 0, direction = "up", className = "", style }: AnimateOnScrollProps) => {
    const directionOffset = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 },
    }

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffset[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
                delay,
                duration: 0.6,
                ease: "easeOut",
            }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    )
}

export default AnimateOnScroll
