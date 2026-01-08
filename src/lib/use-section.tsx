"use client";

import { useEffect, useRef } from "react";
import { Section } from "./sections";
import { useSectionStore } from "./use-section-store";


export function useSection(section: Section) {
  const ref = useRef<HTMLDivElement>(null)
  const { setSection } = useSectionStore()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSection(section, entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px 0px -50% 0px", // Trigger when the top of the element is in the top half of the screen
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [section, setSection]);

  return ref
}
