"use client";

import { createAnimatedIcon } from "./create-animated-icon";

export const MessageCircleIcon = createAnimatedIcon({
  displayName: "MessageCircleIcon",
  variants: {
    normal: { scale: 1 },
    animate: { scale: [1, 1.1, 1], transition: { duration: 0.35 } },
  },
  renderPaths: () => (
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  ),
});
