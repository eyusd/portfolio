import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const InlineLink = ({
  className,
  children,
  ...props
}: Parameters<typeof Link>[number]) => {
  return (
    <Link
      className={cn("font-medium text-foreground hover:text-primary focus-visible:text-primary inline-block", className)}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </Link>
  )
}
InlineLink.displayName = "InlineLink"
export { InlineLink }