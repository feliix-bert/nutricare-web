import { Text, type TextProps } from "react-native";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";

type BadgeProps = TextProps & {
  variant?: BadgeVariant;
};

const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  return (
    <Text
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex h-5 shrink-0 items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "destructive" && "bg-destructive/10 text-destructive dark:bg-destructive/20",
        variant === "outline" && "border-border text-foreground",
        variant === "ghost" && "text-muted-foreground",
        variant === "link" && "text-primary underline",

        className
      )}
      {...props}
    />
  );
};

export { Badge };
