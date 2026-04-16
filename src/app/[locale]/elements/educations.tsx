import { Icons } from "@/components/icons";
import { Link } from "@/i18n/routing";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";

export const Educations = () => {
  const t = useTranslations("Educations");
  const format = useFormatter();
  
  const dateFormatter = (key: string) => {
    const begin = new Date(t(`${key}.begin`));
    const end = new Date(t(`${key}.end`));
    return {
      begin: format.dateTime(begin, { month: "short", year: "numeric" }),
      end: format.dateTime(end, { month: "short", year: "numeric" }),
    };
  }

  const educations = [
    {
      icon: (
        <Image
          src="https://upload.wikimedia.org/wikipedia/fr/8/86/Logo_CentraleSup%C3%A9lec.svg"
          alt="CentraleSupélec"
          className="mx-auto"
          width={64}
          height={64}
        />
      ),
      emoji: "🎓",
      name: t("centralesupelec.name"),
      school: "CentraleSupélec",
      link: "https://www.centralesupelec.fr/",
      time: dateFormatter("centralesupelec.time"),
      children: t.rich("centralesupelec.children", {
        h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
        s: () => <br/>
      }),
      span: true, // full-width
    },
    {
      icon: (
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/KAIST_logo.svg/1920px-KAIST_logo.svg.png"
          alt="KAIST"
          className="mx-auto"
          width={42}
          height={42}
        />
      ),
      emoji: "🇰🇷",
      name: t("kaist.name"),
      school: "KAIST",
      link: "https://www.kaist.ac.kr/en/",
      time: dateFormatter("kaist.time"),
      children: t.rich("kaist.children", {
        h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
    },
    {
      icon: (
        <Image
          src="https://upload.wikimedia.org/wikipedia/fr/0/09/Logo_officiel_de_l%27Universit%C3%A9_Paris-Sorbonne.png"
          alt="Sorbonne"
          className="mx-auto"
          width={42}
          height={42}
        />
      ),
      emoji: "📚",
      name: t("sorbonne.name"),
      school: "Sorbonne",
      link: "https://www.paris-sorbonne.fr/",
      time: dateFormatter("sorbonne.time"),
      children: t.rich("sorbonne.children", {
        h: (chunks) => <span className="block mt-2 font-semibold text-foreground">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
    },
    {
      icon: null,
      emoji: "🏫",
      name: t("prepa.name"),
      school: "Lycée Pierre Corneille",
      link: "https://corneille-rouen.lycee.ac-normandie.fr/",
      time: dateFormatter("prepa.time"),
      children: t("prepa.children"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {educations.map((edu, i) => (
        <div
          key={i}
          className={`group relative rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 ${
            edu.span ? "md:col-span-2" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            {edu.icon ? (
              <div className="shrink-0 w-12 h-12 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                {edu.icon}
              </div>
            ) : (
              <div className="shrink-0 w-12 h-12 flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110">
                {edu.emoji}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground">
                <Link
                  href={edu.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors group/link"
                >
                  {edu.name}{" "}
                  <span className="text-muted-foreground">@{edu.school}</span>
                  <Icons.arrow className="fill-current inline-block h-3.5 w-3.5 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 motion-reduce:transition-none ml-1 mb-0.5" />
                </Link>
              </h3>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mt-1">
                {edu.time.begin} — {edu.time.end}
              </p>
              <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {edu.children}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
