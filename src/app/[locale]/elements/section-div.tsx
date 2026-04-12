import { SectionTitle } from "@/components/ui/section-title";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Section } from "@/lib/sections";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id: Section;
  name: string;
}

export function SectionDiv({ children, id, name, className, ...props }: SectionProps) {
  return (
    <ScrollReveal>
      <section 
        id={id}
        className={cn("mb-16 scroll-mt-20 sm:mb-24 md:mb-32", className)}
        {...props}
      >
        <SectionTitle id={id} name={name} />
        {children}
      </section>
    </ScrollReveal>
  )
}
