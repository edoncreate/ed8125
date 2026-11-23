import styles from "./GridLines.module.css";

export function GridLines() {
  return (
    <div className={styles.grid} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}
