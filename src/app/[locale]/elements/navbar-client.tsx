"use client";

import { NavLink } from "@/components/ui/nav-link"
import { Section } from "@/lib/sections";
import { useSectionStore } from "@/lib/use-section-store";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export const NavbarClient = () => {
  const t = useTranslations("Navbar")

  const { sections } = useSectionStore()
  const [activeSection, setActiveSection] = useState<Section>(Section.About)

  useEffect(() => {
    const active = [Section.About, Section.Experience, Section.Education].find(section => sections[section])
    if (active) setActiveSection(active)
  }, [sections])

  return (
    <nav className="nav hidden lg:block">
    <ul className="mt-16 w-max">
      <li>
        <NavLink href="#about" active={activeSection === Section.About}>
          {t("about")}
        </NavLink>
      </li>
      <li>
        <NavLink href="#experience" active={activeSection === Section.Experience}>
          {t("experience")}
        </NavLink>
      </li>
      <li>
        <NavLink href="#education" active={activeSection === Section.Education}>
          {t("education")}
        </NavLink>
      </li>
    </ul>
  </nav>
  )
}