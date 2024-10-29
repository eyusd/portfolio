import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"

const NavLink = ({
  className,
  children,
  active,
  ...props
}: Parameters<typeof Link>[number] & { active: boolean }) => {
  return (
    <Link
      className={cn(
        "group flex items-center py-3 hover",
        className
      )}
      {...props}
    >
      <span className={cn("mr-4 h-px w-8 bg-muted-foreground transition-all group-hover:w-16 group-hover:bg-foreground group-focus-visible:w-16 group-focus-visible:bg-foreground motion-reduce:transition-none",
        active && "w-16 bg-primary"
      )}/>
      <span className={cn("text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground",
        active && "text-primary"
      )}>
        {children}
      </span>
    </Link>
  )
}
NavLink.displayName = "NavLink"
export { NavLink }