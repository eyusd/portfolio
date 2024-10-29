import { SectionTitle } from "@/components/ui/section-title";
import { Section } from "@/lib/sections";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  id: Section;
  name: string;
}

export function SectionDiv({ children, id, name, className, ...props }: SectionProps) {
  return (
    <section 
      id={id}
      className={cn("mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24", className)}
      {...props}
    >
      <SectionTitle id={id} name={name} />
      {children}
    </section>
  )
}