import type { ReactNode } from "react";
import Link from "next/link";
import { Header } from "@/components/chrome/Header";
import styles from "./Page.module.css";

/** Inner page frame: sticky header, big Inter Tight title, optional kicker/lead/actions. */
export function Page({
  kicker,
  title,
  accent,
  lead,
  actions,
  children,
}: {
  kicker?: ReactNode;
  title: string;
  /** Trailing words of the title rendered in the accent colour. */
  accent?: string;
  lead?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <>
      <Header variant="page" />
      <main className={styles.page}>
        <header className={styles.head}>
          {kicker && <p className={styles.kicker}>{kicker}</p>}
          <h1 className={styles.title}>
            {title}
            {accent && (
              <>
                {" "}
                <span className={styles.acc}>{accent}</span>
              </>
            )}
          </h1>
          {lead && <div className={styles.lead}>{lead}</div>}
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
        {children}
      </main>
    </>
  );
}

export function Section({ title, children, id }: { title?: string; children: ReactNode; id?: string }) {
  return (
    <section className={styles.section} id={id} aria-label={title}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {children}
    </section>
  );
}

/** Outline pill for page-level links (sits in `actions`, beside or instead of a filled play button). */
export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className={styles.btn}>
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}
