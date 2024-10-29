import { Education, EducationProps } from "@/components/ui/education";
import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { Fragment } from "react";

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
  
  const educations: EducationProps[] = [
    {
      icon: (
        <Image
          src="https://upload.wikimedia.org/wikipedia/fr/8/86/Logo_CentraleSup%C3%A9lec.svg"
          alt="CentraleSupélec"
          className="mx-auto"
          width={96}
          height={96}
          priority
        />
      ),
      title: {
        name: t("centralesupelec.name"),
        school: "CentraleSupélec",
        link: "https://www.centralesupelec.fr/",
      },
      time: dateFormatter("centralesupelec.time"),
      children: t.rich("centralesupelec.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
        s: () => <br/>
      }),
    },
    {
      icon: (
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/KAIST_logo.svg/1920px-KAIST_logo.svg.png"
          alt="KAIST"
          className="mx-auto"
          width={42}
          height={42}
          priority
        />
      ),
      title: {
        name: t("kaist.name"),
        school: "KAIST",
        link: "https://www.kaist.ac.kr/en/",
      },
      time: dateFormatter("kaist.time"),
      children: t.rich("kaist.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
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
          priority
        />
      ),
      title: {
        name: t("sorbonne.name"),
        school: "Sorbonne",
        link: "https://www.paris-sorbonne.fr/",
      },
      time: dateFormatter("sorbonne.time"),
      children: t.rich("sorbonne.children", {
        h: (chunks) => <span className="block mt-2 font-semibold">{chunks}</span>,
        u: (chunks) => <ul className="ml-4 list-disc">{chunks}</ul>,
        l: (chunks) => <li>{chunks}</li>,
      }),
    },
    {
      icon: (
        <></>
      ),
      title: {
        name: t("prepa.name"),
        school: "Lycée Pierre Corneille",
        link: "https://corneille-rouen.lycee.ac-normandie.fr/",
      },
      time: dateFormatter("prepa.time"),
      children: t("prepa.children"),
    }
  ];

  return (
    <ol className="group/list">
      {educations.map((education, i) => (
        <li key={i} className="mb-12">
          <Education {...education} />
        </li>
      ))}
    </ol>
  );
};
