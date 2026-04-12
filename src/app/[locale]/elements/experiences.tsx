import { Icons } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Timeline } from "@/components/ui/timeline";
import { Link } from "@/i18n/routing";
import { useFormatter, useTranslations } from "next-intl";

export const Experiences = () => {
  const t = useTranslations("Experiences");
  const format = useFormatter();
  
  const dateFormatter = (key: string) => {
    const begin = new Date(t(`${key}.begin`));
    const end = t.has(`${key}.end`) ? new Date(t(`${key}.end`)) : new Date();
    return {
      begin: format.dateTime(begin, { month: "short", year: "numeric" }),
      end: format.dateTime(end, { month: "short", year: "numeric" }),
    };
  }

  const data = [
    {
      title: dateFormatter("eledone.time").begin.split(" ").pop() ?? "",
      content: (
        <TimelineCard
          title={t("eledone.name")}
          company="Eledone"
          link="https://eledone-ai.com"
          time={dateFormatter("eledone.time")}
          references={[
            { name: "LinkedIn", link: "https://www.linkedin.com/company/eledone" },
          ]}
          techs={[
            { icon: "🐍", name: "Python" },
            { icon: "🎸", name: "Django" },
            { icon: "📘", name: "TypeScript" },
            { icon: "▲", name: "Next.js" },
            { icon: "☁️", name: "GCP" },
            { icon: "🐳", name: "Docker" },
            { icon: "☸️", name: "Kubernetes" },
            { icon: "🤖", name: "AI/ML" },
            { icon: "🤗", name: "Hugging Face" },
          ]}
        >
          {t.rich("eledone.children", {
            h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
            u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
            l: (chunks) => <li>{chunks}</li>,
          })}
        </TimelineCard>
      ),
    },
    {
      title: dateFormatter("sniive.time").begin.split(" ").pop() ?? "",
      content: (
        <TimelineCard
          title={t("sniive.name")}
          company="Sniive"
          link="https://sniive.com"
          time={dateFormatter("sniive.time")}
          references={[
            { name: "LinkedIn", link: "https://www.linkedin.com/company/sniive" },
            { name: "Github", link: "https://github.com/sniive/sniive-desktop" },
            { name: "STATION F", link: "https://stationf.co" },
          ]}
          techs={[
            { icon: "🦀", name: "Rust" },
            { icon: "⚛️", name: "Tauri" },
            { icon: "⚛️", name: "React" },
            { icon: "📘", name: "TypeScript" },
            { icon: "🎨", name: "Tailwind CSS" },
            { icon: "▲", name: "Next.js" },
            { icon: "▲", name: "Vercel" },
            { icon: "☁️", name: "Azure" },
            { icon: "🔴", name: "Redis" },
            { icon: "🤖", name: "OpenAI" },
            { icon: "🤗", name: "Hugging Face" },
            { icon: "🐍", name: "Python" },
          ]}
        >
          {t.rich("sniive.children", {
            h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
            u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
            l: (chunks) => <li>{chunks}</li>,
          })}
        </TimelineCard>
      ),
    },
    {
      title: dateFormatter("cede.time").begin.split(" ").pop() ?? "",
      content: (
        <TimelineCard
          title={t("cede.name")}
          company="cede.hub"
          link="https://cedehub.io/"
          time={dateFormatter("cede.time")}
          references={[
            { name: "Medium", link: "https://medium.com/@clement.chardine" },
          ]}
          techs={[
            { icon: "⚛️", name: "React" },
            { icon: "🟢", name: "Node.js" },
            { icon: "📘", name: "TypeScript" },
            { icon: "🧩", name: "Chrome Extension" },
            { icon: "📱", name: "React Native" },
            { icon: "📱", name: "Expo" },
          ]}
        >
          {t.rich("cede.children", {
            h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
            u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
            l: (chunks) => <li>{chunks}</li>,
          })}
        </TimelineCard>
      ),
    },
    {
      title: dateFormatter("wandercraft.time").begin.split(" ").pop() ?? "",
      content: (
        <TimelineCard
          title={t("wandercraft.name")}
          company="Wandercraft"
          link="https://en.wandercraft.eu/"
          time={dateFormatter("wandercraft.time")}
          references={[
            { name: "Open Source", link: "https://github.com/leducp/KickCAT" },
          ]}
          techs={[
            { icon: "🔌", name: "EtherCAT" },
            { icon: "⚙️", name: "C" },
            { icon: "⚙️", name: "C++" },
            { icon: "🐍", name: "Python" },
            { icon: "💻", name: "CLI" },
          ]}
        >
          {t.rich("wandercraft.children", {
            s: () => <><br/><br/></>,
          })}
        </TimelineCard>
      ),
    },
  ];

  return <Timeline data={data} />;
};

function TimelineCard({
  title,
  company,
  link,
  time,
  references,
  techs,
  children,
}: {
  title: string;
  company: string;
  link: string;
  time: { begin: string; end: string };
  references?: { name: string; link: string }[];
  techs?: { icon: string; name: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="group/card pb-8 rounded-lg p-4 -ml-4 transition-all duration-300 hover:bg-muted/50">
      <h3 className="text-lg font-semibold text-foreground">
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors group/link"
        >
          {title}{" "}
          <span className="text-muted-foreground">@{company}</span>
          <Icons.arrow className="fill-current inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none ml-1 mb-0.5" />
        </Link>
      </h3>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-1">
        {time.begin} — {time.end}
      </p>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
      {references && references.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4">
          {references.map((ref, idx) => (
            <li key={idx}>
              <Link
                href={ref.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <Icons.link className="mr-1 h-3 w-3 stroke-current fill-none" />
                <span>{ref.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {techs && techs.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {techs.map((tech, idx) => (
            <li key={idx}>
              <Badge variant="outline" className="rounded-full text-xs transition-colors hover:bg-primary/10 hover:border-primary/40">
                <span className="mr-1">{tech.icon}</span>
                {tech.name}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
