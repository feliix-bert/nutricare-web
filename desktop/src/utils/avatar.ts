import { Avatar } from "@dicebear/core";
import lorelei from "@dicebear/styles/lorelei.json";
import bigSmile from "@dicebear/styles/big-smile.json";
import bottts from "@dicebear/styles/bottts.json";
import shapes from "@dicebear/styles/shapes.json";

export type AvatarVariant = "parent" | "child" | "ai" | "food";

const STYLE_MAP = {
  parent: lorelei,
  child: bigSmile,
  ai: bottts,
  food: shapes,
} as const;

const PASTEL_BACKGROUNDS = ["bde6ec", "cfe7be", "e8e291", "f4f1c5", "d9f3f6"];

export function getAvatarUri(seed: string, variant: AvatarVariant = "parent"): string {
  return new Avatar(STYLE_MAP[variant], {
    seed,
    backgroundColor: PASTEL_BACKGROUNDS,
    borderRadius: 50,
  }).toDataUri();
}
