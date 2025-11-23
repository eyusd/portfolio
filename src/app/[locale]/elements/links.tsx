import { Icons } from "@/components/icons"
import { Link } from "@/i18n/routing"


export const Links = () => {
  return (
    <ul className="ml-1 mt-8 flex items-center">
      <li className="mr-5 text-xs">
        <Link 
          href="https://github.com/eyusd"
          target="_blank"
          rel="noopener noreferrer"
          passHref
        >
          <Icons.github className="w-6 h-6 fill-current hover:fill-primary"/>
        </Link>
      </li>
      <li className="text-xs mr-5">
        <Link 
          href="https://www.linkedin.com/in/clement-chardine/"
          target="_blank"
          rel="noopener noreferrer"
          passHref
        >
          <Icons.linkedIn className="w-6 h-6 fill-current hover:fill-primary"/>
        </Link>
      </li>
      <li className="text-xs mr-5">
        <Link 
          href="mailto:clement.chardine@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          passHref
        >
          <span className="text-2xl hover:text-primary">@</span>
        </Link>
      </li>
    </ul>
  )
}