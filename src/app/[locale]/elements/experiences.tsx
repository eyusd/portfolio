import { Experience, ExperienceProps } from "@/components/ui/experience";
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


  const experiences: ExperienceProps[] = [
    {
      title: {
        name: t("eledone.name"),
        company: "Eledone",
        link: "https://eledone-ai.com",
      },
      time: dateFormatter("eledone.time"),
      children: t.rich("eledone.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
      references: [
        {
          name: "LinkedIn",
          link: "https://www.linkedin.com/company/eledone",
        },
      ],
      techs: [
        {
          name: "Python",
          icon: "🐍",
        },
        {
          name: "Django",
          icon: "🎸",
        },
        {
          name: "TypeScript",
          icon: "🦄",
        },
        {
          name: "Next.js",
          icon: "🚀",
        },
        {
          name: "GCP",
          icon: "☁️",
        },
        {
          name: "Docker",
          icon: "🐳",
        },
        {
          name: "Kubernetes",
          icon: "☸️",
        },
        {
          name: "AI/ML",
          icon: "🤖",
        },
        {
          name: "Hugging Face",
          icon: "🤗",
        }
      ],
    },
    {
      title: {
        name: t("sniive.name"),
        company: "Sniive",
        link: "https://sniive.com",
      },
      time: dateFormatter("sniive.time"),
      children: t.rich("sniive.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
      references: [
        {
          name: "LinkedIn",
          link: "https://www.linkedin.com/company/sniive",
        },
        {
          name: "Github",
          link: "https://github.com/sniive/sniive-desktop",
        },
        {
          name: "STATION F",
          link: "https://stationf.co",
        },
      ],
      techs: [
        {
          name: "Rust",
          icon: "🦀",
        },
        {
          name: "Tauri",
          icon: "🔗",
        },
        {
          name: "React",
          icon: "⚛️",
        },
        {
          name: "TypeScript",
          icon: "🦄",
        },
        {
          name: "Tailwind CSS",
          icon: "🌊",
        },
        {
          name: "Next.js",
          icon: "🚀",
        },
        {
          name: "Vercel",
          icon: "▲",
        },
        {
          name: "Azure",
          icon: "☁️",
        },
        {
          name: "Redis",
          icon: "🔴",
        },
        {
          name: "OpenAI",
          icon: "🤖",
        },
        {
          name: "Hugging Face",
          icon: "🤗",
        },
        {
          name: "Python",
          icon: "🐍",
        },
      ],
    },
    {
      title: {
        name: t("cede.name"),
        company: "cede.hub",
        link: "https://cedehub.io/",
      },
      time: dateFormatter("cede.time"),
      children: t.rich("cede.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
      references: [
        {
          name: "Medium",
          link: "https://medium.com/@clement.chardine",
        },
      ],
      techs: [
        {
          name: "React",
          icon: "⚛️",
        },
        {
          name: "Node.js",
          icon: "⚙️",
        },
        {
          name: "TypeScript",
          icon: "🦄",
        },
        {
          name: "Chrome Extension",
          icon: "🔗",
        },
        {
          name: "React Native",
          icon: "📱",
        },
        {
          name: "Expo",
          icon: "🔮",
        },
      ],
    },
    {
      title: {
        name: t("wandercraft.name"),
        company: "Wandercraft",
        link: "https://en.wandercraft.eu/",
      },
      time: dateFormatter("wandercraft.time"),
      children: t.rich("wandercraft.children", {
        s: () => <><br/><br/></>,
      }),
      references: [
        {
          name: "Open Source",
          link: "https://github.com/leducp/KickCAT",
        },
      ],
      techs: [
        {
          name: "EtherCAT",
          icon: "🔌",
        },
        {
          name: "C",
          icon: "🔧",
        },
        {
          name: "C++",
          icon: "🔢",
        },
        {
          name: "Python",
          icon: "🐍",
        },
        {
          name: "CLI",
          icon: "💻",
        }
      ],
    },
  ];

  return (
    <ol className="group/list">
      {experiences.map((experience, i) => (
        <li key={i} className="mb-12">
          <Experience {...experience} />
        </li>
      ))}
    </ol>
  );
};
