"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const ScanLineIcon = createAnimatedIcon({
  displayName: "ScanLineIcon",
  variants: {
    normal: { y: 0 },
    animate: { y: [0, -2, 2, 0], transition: { duration: 0.5, repeat: 1 } },
  },
  renderPaths: () => (
    <>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </>
  ),
});
