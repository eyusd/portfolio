import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/routing";

export interface ExperienceProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title" | "time"> {
  time: {
    begin: string;
    end: string;
  };
  title: {
    name: string;
    company: string;
    link: string;
  };
  references?: {
    name: string;
    link: string;
  }[];
  techs?: {
    icon: React.ReactNode;
    name: string;
  }[];
}

export function Experience({
  className,
  time,
  title,
  references,
  techs,
  children,
  ...props
}: ExperienceProps) {
  return (
    <div
      className={cn(
        "group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50",
        className
      )}
      {...props}
    >
      <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-card lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg">
        <BorderBeam
          colorFrom="hsl(var(--primary))"
          colorTo="hsl(var(--secondary))"
          className="opacity-0 lg:group-hover:opacity-100 transition motion-reduce:transition-none"
        />
      </div>
      <div className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2">
        <time
          className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:col-span-2"
          dateTime={`${time.begin}/${time.end}`}
        >
          {time.begin} — {time.end}
        </time>
      </div>
      <div className="z-10 sm:col-span-6">
        <h3 className="font-medium leading-snug text-foreground uppercase">
          <div>
            <Link
              className="inline-flex items-baseline font-medium leading-tight text-foreground hover:text-primary focus-visible:text-primary group/link text-base"
              href={title.link}
              target="_blank"
              rel="noopener noreferrer"
              passHref
            >
              <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block" />
              <span>
                {title.name}{" "}
                <span className="inline-block">
                  {"@"}{title.company}
                  <Icons.arrow className="fill-current inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ml-1 mb-1 translate-y-px" />
                </span>
              </span>
            </Link>
          </div>
        </h3>
        <div className="mt-2 text-sm leading-normal">{children}</div>
        {references && (
          <ul className="mt-2 flex flex-wrap">
            {references.map((reference, idx) => (
              <li key={idx} className="mr-4">
                <Link
                  href={reference.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-2 inline-flex items-center text-sm font-medium text-foreground hover:text-primary focus-visible:text-primary"
                >
                  <Icons.link className="mr-1 h-3 w-3 stroke-current fill-none" />
                  <span>{reference.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {techs && (
          <ul className="mt-2 flex flex-wrap">
            {techs.map((tech, idx) => (
              <li key={idx} className="mr-1.5 mt-2">
                <Badge
                  className="flex items-center rounded-full"
                  variant="outline"
                >
                  {tech.icon}
                  <span className="ml-2">{tech.name}</span>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
