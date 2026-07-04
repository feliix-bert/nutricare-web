"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes, ReactNode, SVGProps } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/utils/cn";

export type AnimatedIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type CreateAnimatedIconOptions = {
  displayName: string;
  variants: Variants;
  renderPaths: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

export function createAnimatedIcon({ displayName, variants, renderPaths }: CreateAnimatedIconOptions) {
  const Component = forwardRef<
    AnimatedIconHandle,
    HTMLAttributes<HTMLDivElement> & { size?: number }
  >(({ onMouseEnter, onMouseLeave, className, size = 22, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseEnter?.(e);
        else controls.start("animate");
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) onMouseLeave?.(e);
        else controls.start("normal");
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          initial="normal"
          variants={variants}
        >
          {renderPaths({})}
        </motion.svg>
      </div>
    );
  });

  Component.displayName = displayName;
  return Component;
}
