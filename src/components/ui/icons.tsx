/**
 * The site's icon set (lucide-react: 24px grid, 2px round strokes).
 * Icons size to the surrounding font (1em) unless a size is passed, and are hidden
 * from assistive tech: the button or link around them carries the label.
 * Transport icons (play, pause, skip) are filled so they read at small sizes.
 */
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  AudioLines,
  Check,
  ListPlus,
  Moon,
  Pause,
  Play,
  Plus,
  Search,
  SkipBack,
  Share,
  SkipForward,
  Sun,
  Volume2,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

type IconProps = Omit<LucideProps, "ref">;

function make(Icon: LucideIcon, filled = false) {
  function SiteIcon({ size = "1em", strokeWidth = 2, className, ...rest }: IconProps) {
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        aria-hidden="true"
        focusable="false"
        className={["icon", className].filter(Boolean).join(" ")}
        {...(filled ? { fill: "currentColor" } : null)}
        {...rest}
      />
    );
  }
  SiteIcon.displayName = `Icon(${Icon.displayName ?? "lucide"})`;
  return SiteIcon;
}

export const IconPlay = make(Play, true);
export const IconPause = make(Pause, true);
export const IconPrev = make(SkipBack, true);
export const IconNext = make(SkipForward, true);
export const IconClose = make(X);
export const IconCheck = make(Check);
export const IconPlus = make(Plus);
export const IconAddToList = make(ListPlus);
export const IconSearch = make(Search);
/** Leaves the site (new tab). Nudges up-right on hover inside `.go`. */
export const IconExternal = make(ArrowUpRight);
/** Goes somewhere on the site. Nudges right on hover inside `.go`. */
export const IconArrowRight = make(ArrowRight);
export const IconArrowLeft = make(ArrowLeft);
export const IconUp = make(ArrowUp);
export const IconDown = make(ArrowDown);
export const IconSun = make(Sun);
export const IconSound = make(Volume2);
export const IconSoundOn = make(AudioLines);
export const IconMoon = make(Moon);
/** Share sheet (phones) or copy link (desktop). */
export const IconShare = make(Share);
