import { BREAKPOINTS } from "@/utils/constants";
import { useMediaQuery } from "usehooks-ts";

export default function useIsMobile() {
  return !useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
}
