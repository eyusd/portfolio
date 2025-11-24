import { InlineLink } from "@/components/ui/inline-link";
import {useTranslations} from 'next-intl';
import { Fragment } from "react";

export const About = () => {
  const t = useTranslations("About");

  return (
    <Fragment>
      <p className="mb-4">
        {t.rich("code", {
          sniivelink: (chunks) => <InlineLink href="https://sniive.com">{chunks}</InlineLink>,
          eledonelink: (chunks) => <InlineLink href="https://eledone-ai.com">{chunks}</InlineLink>,
          cedelink: (chunks) => <InlineLink href="https://cede.store/">{chunks}</InlineLink>,
          wanderlink: (chunks) => <InlineLink href="https://www.wandercraft.eu/">{chunks}</InlineLink>,
        })}
      </p>
      <p className="mb-4">
        {t.rich("other", {
          spotilink: (chunks) => <InlineLink href="https://open.spotify.com/artist/69FmfmKQDzQPSGzltAudeh">{chunks}</InlineLink>,
        })}
      </p>
    </Fragment>
  );
};
