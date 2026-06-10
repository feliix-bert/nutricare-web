"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const UserIcon = createAnimatedIcon({
  displayName: "UserIcon",
  variants: {
    normal: { scale: 1 },
    animate: { scale: [1, 1.08, 1], transition: { duration: 0.35 } },
  },
  renderPaths: () => (
    <>
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </>
  ),
});
