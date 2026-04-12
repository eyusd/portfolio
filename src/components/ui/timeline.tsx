"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full"
      ref={containerRef}
    >
      <div ref={ref} className="relative pb-10">
        {data.map((item, index) => (
          <div
            key={index}
            className="relative pl-7 pt-8 first:pt-0 sm:pl-8"
          >
            <div
              className="absolute left-0 z-10 flex h-5 w-5 items-center justify-center sm:h-4 sm:w-4"
              style={{ top: index === 0 ? 0 : '2rem' }}
            >
              <div className="h-3 w-3 rounded-full border-2 border-primary bg-background shadow-[0_0_0_3px_hsl(var(--background))]" />
            </div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
              {item.title}
            </span>
            {item.content}
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute left-[9px] sm:left-[7px] top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-border to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-primary via-primary/60 to-transparent from-[0%] via-[10%] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
