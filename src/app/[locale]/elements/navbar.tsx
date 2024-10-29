import { NextIntlClientProvider, useMessages } from "next-intl"
import { NavbarClient } from "./navbar-client";

export const Navbar = () => {
  const messages = useMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <NavbarClient />
    </NextIntlClientProvider>
  )
}