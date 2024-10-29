import { Icons } from "@/components/icons"
import HyperText from "@/components/ui/hyper-text"
import { useTranslations } from "next-intl"

export const Identity = () => {
  const t = useTranslations("Identity")

  return (
    <div>
      <HyperText 
        className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
        text="Clément Chardine"
      />
      <h2 className="mt-3 text-lg font-medium tracking-tight text-foreground sm:text-xl">
        {t("title")}
      </h2>
      <span>
        <Icons.location className="inline-block w-4 h-4 mr-2 stroke-current" />
        {t("location")}
      </span>
      <p className="mt-4 max-w-xs leading-normal">
        {t("subtitle")}
      </p>
    </div>
  )
}