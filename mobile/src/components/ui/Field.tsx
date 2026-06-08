import { useMemo } from "react";
import { View, Text, type ViewProps, type TextProps } from "react-native";
import { cn } from "@/utils/cn";
import { Label } from "@/components/ui/Label";

function FieldSet({ className, ...props }: ViewProps & { className?: string }) {
  return <View data-slot="field-set" className={cn("flex flex-col gap-4", className)} {...props} />;
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: TextProps & { className?: string; variant?: "legend" | "label" }) {
  return (
    <Text
      data-slot="field-legend"
      className={cn("mb-1.5 font-medium", variant === "label" ? "text-sm" : "text-base", className)}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: ViewProps & { className?: string }) {
  return <View data-slot="field-group" className={cn("flex w-full flex-col gap-5", className)} {...props} />;
}

type FieldProps = ViewProps & {
  className?: string;
  orientation?: "vertical" | "horizontal";
  isInvalid?: boolean;
};

function Field({ className, orientation = "vertical", isInvalid = false, ...props }: FieldProps) {
  return (
    <View
      data-slot="field"
      className={cn(
        "flex w-full gap-2",
        orientation === "vertical" ? "flex-col" : "flex-row items-center",
        isInvalid && "text-destructive",
        className
      )}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: ViewProps & { className?: string }) {
  return <View data-slot="field-content" className={cn("flex flex-1 flex-col gap-0.5", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn("flex w-fit flex-row gap-2", className)} {...props} />;
}

function FieldTitle({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      data-slot="field-label"
      className={cn("flex flex-row items-center gap-2 text-sm font-medium", className)}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: TextProps & { className?: string }) {
  return (
    <Text
      data-slot="field-description"
      className={cn("text-left text-sm font-normal text-muted-foreground", className)}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: ViewProps & { className?: string; children?: React.ReactNode }) {
  return <View data-slot="field-separator" className={cn("relative my-2 h-5 justify-center", className)} {...props} />;
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: ViewProps & {
  className?: string;
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors?.length === 1) {
      return <Text className="text-sm font-normal text-destructive">{uniqueErrors[0]?.message}</Text>;
    }

    return (
      <View className="ml-4 flex flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && (
              <Text key={index} className="text-sm font-normal text-destructive">
                • {error.message}
              </Text>
            )
        )}
      </View>
    );
  }, [children, errors]);

  if (!content) return null;

  return (
    <View data-slot="field-error" className={className} {...props}>
      {content}
    </View>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
