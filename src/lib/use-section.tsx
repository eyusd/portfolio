"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { Section } from "./sections";
import { useSectionStore } from "./use-section-store";


export function useSection(section: Section) {
  const ref = useRef(null)
  const isInView = useInView(ref)
  const { setSection } = useSectionStore()

  const memoizedInView = useMemo(() => isInView, [isInView])

  useEffect(() => {
    setSection(section, memoizedInView)
  }, [memoizedInView])

  return ref
}