import { Identity } from "./elements/identity";
import { SectionDiv } from "./elements/section-div";
import { Experiences } from "./elements/experiences";
import { Educations } from "./elements/educations";
import { About } from "./elements/about";
import { Section } from "@/lib/sections";
import { setRequestLocale } from "next-intl/server";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 sm:px-6 pb-32 font-[family-name:var(--font-geist-sans)]">
      {/* Hero */}
      <header className="flex min-h-[50vh] flex-col justify-center">
        <Identity />
      </header>

      {/* About */}
      <SectionDiv id={Section.About} name="About">
        <About />
      </SectionDiv>

      {/* Experience */}
      <SectionDiv id={Section.Experience} name="Experience">
        <Experiences />
      </SectionDiv>

      {/* Education */}
      <SectionDiv id={Section.Education} name="Education">
        <Educations />
      </SectionDiv>
    </div>
  );
}
