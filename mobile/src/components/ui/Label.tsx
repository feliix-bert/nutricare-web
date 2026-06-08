import { Text, type TextProps } from "react-native";
import { cn } from "@/utils/cn";

function Label({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      data-slot="label"
      className={cn("flex flex-row items-center gap-2 text-sm font-medium", className)}
      {...props}
    />
  );
}

export { Label };
