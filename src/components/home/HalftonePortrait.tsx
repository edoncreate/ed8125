import Image from "next/image";
import { asset } from "@/lib/asset";
import styles from "./HalftonePortrait.module.css";

/** Static halftone portrait tinted Spotlight orange (CSS dot mask over the photo). */
export function HalftonePortrait({ alt = "ED8125 in profile, as an orange halftone" }: { alt?: string }) {
  return (
    <div className={styles.frame}>
      <div className={styles.dots}>
        <Image src={asset("/media/img/head.png")} alt={alt} fill preload sizes="(max-width: 767px) 100vw, 42vw" className={styles.img} />
      </div>
    </div>
  );
}
