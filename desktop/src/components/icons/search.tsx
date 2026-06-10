"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const SearchIcon = createAnimatedIcon({
  displayName: "SearchIcon",
  variants: {
    normal: { scale: 1, rotate: 0 },
    animate: { scale: [1, 1.1, 1], rotate: [0, -8, 0], transition: { duration: 0.4 } },
  },
  renderPaths: () => (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
});
