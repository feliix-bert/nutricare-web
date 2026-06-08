import { View, type ViewProps } from "react-native";
import { cn } from "@/utils/cn";

type SeparatorProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
};

const Separator = ({ className, orientation = "horizontal", ...props }: SeparatorProps) => {
  return (
    <View
      data-slot="separator"
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch",
        className
      )}
      {...props}
    />
  );
};

export { Separator };
