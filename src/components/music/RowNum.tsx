import { IconPause, IconPlay } from "@/components/ui/icons";

/**
 * The number cell of a playable row. Shows the row number; when the row's button is
 * hovered or focused it turns into a play icon. The current track shows pause (playing)
 * or play (paused). Put it inside the row's <button>; style the box with `className`.
 */
export function RowNum({ n, status, className }: { n: string; status?: "playing" | "paused" | "idle"; className?: string }) {
  return (
    <span className={["rownum", className].filter(Boolean).join(" ")} aria-hidden="true">
      {status === "playing" ? (
        <IconPause />
      ) : status === "paused" ? (
        <IconPlay />
      ) : (
        <>
          <span className="rownum-n">{n}</span>
          <IconPlay className="rownum-play" />
        </>
      )}
    </span>
  );
}
