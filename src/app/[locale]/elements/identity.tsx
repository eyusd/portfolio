import { Icons } from "@/components/icons"
import HyperText from "@/components/ui/hyper-text"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { useTranslations } from "next-intl"

export const Identity = () => {
  const t = useTranslations("Identity")

  return (
    <div>
      <HyperText 
        className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
        text="Clément Chardine"
      />
      <h2 className="mt-4 text-lg font-medium tracking-tight text-foreground sm:text-xl md:text-2xl">
        {t("title")}
      </h2>
      <div className="mt-2 flex items-center text-sm text-muted-foreground">
        <Icons.location className="inline-block w-4 h-4 mr-2 stroke-current" />
        {t("location")}
      </div>
      <div className="mt-6">
        <TextGenerateEffect
          words={t("subtitle")}
          className="text-sm sm:text-base font-normal"
          duration={0.3}
        />
      </div>
    </div>
  )
}