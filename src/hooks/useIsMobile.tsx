import { BREAKPOINTS } from "@/lib/constants";
import { useMediaQuery } from "usehooks-ts";

export default function useIsMobile() {
  return !useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
}
