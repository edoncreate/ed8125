import { ButtonLink, Page } from "@/components/page/Page";

export default function NotFound() {
  return (
    <Page
      kicker="404"
      title="This beat"
      accent="got lost."
      lead={<p>The page you were looking for isn&apos;t here.</p>}
      actions={
        <>
          <ButtonLink href="/beats">Latest beats</ButtonLink>
          <ButtonLink href="/lost-tapes">Lost Tapes</ButtonLink>
        </>
      }
    />
  );
}
