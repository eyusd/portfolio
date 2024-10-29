import { Identity } from "./elements/identity";
import { Links } from "./elements/links";
import { Navbar } from "./elements/navbar";
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
    <div className="mx-auto min-h-screen max-w-screen-xl overflow-x-clip px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0 font-[family-name:var(--font-geist-sans)]">
      <div className="lg:flex lg:justify-between lg:gap-4">
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
          <div>
            <Identity />
            <Navbar />
          </div>
          <Links />
        </header>
        <main className="pt-24 lg:w-1/2 lg:py-24">
          <SectionDiv id={Section.About} name="About">
            <About />
          </SectionDiv>
          <SectionDiv id={Section.Experience} name="Experience">
            <Experiences />
          </SectionDiv>
          <SectionDiv id={Section.Education} name="Education">
            <Educations />
          </SectionDiv>
        </main>
      </div>
    </div>
  );
}
