import Link from "next/link";
import { Page } from "@/components/page/Page";

export default function NotFound() {
  return (
    <Page
      kicker="404"
      title="This beat"
      accent="got lost."
      lead={
        <p>
          The page you were looking for isn&apos;t here. Try <Link href="/beats">the latest beats</Link> or{" "}
          <Link href="/lost-tapes">the Lost Tapes</Link>.
        </p>
      }
    />
  );
}
