"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const FileTextIcon = createAnimatedIcon({
  displayName: "FileTextIcon",
  variants: {
    normal: { rotate: 0 },
    animate: { rotate: [0, -3, 3, 0], transition: { duration: 0.4 } },
  },
  renderPaths: () => (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
});
