"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const PlusIcon = createAnimatedIcon({
  displayName: "PlusIcon",
  variants: {
    normal: { rotate: 0 },
    animate: { rotate: 90, transition: { duration: 0.3 } },
  },
  renderPaths: () => (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
});
