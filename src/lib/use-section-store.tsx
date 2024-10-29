"use client";

import { Section } from "./sections"
import { create } from 'zustand'

type SectionStore = {
  sections: Record<Section, boolean>,
  setSection: (section: Section, value: boolean) => void
}


export const useSectionStore = create<SectionStore>((set) => ({
  sections: {
    [Section.About]: false,
    [Section.Experience]: false,
    [Section.Education]: false,
  },
  setSection: (section, value) => set((state) => ({ sections: { ...state.sections, [section]: value } }))
}))