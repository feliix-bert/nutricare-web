import { Pressable, View, type PressableProps } from "react-native";
import { cn } from "@/utils/cn";
import { IconSymbol } from "@/components/ui/icon-symbol";

type CheckboxProps = Omit<PressableProps, "children"> & {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  isInvalid?: boolean;
};

function Checkbox({
  className,
  checked = false,
  onCheckedChange,
  disabled = false,
  isInvalid = false,
  ...props
}: CheckboxProps) {
  return (
    <Pressable
      data-slot="checkbox"
      disabled={disabled}
      onPress={() => onCheckedChange?.(!checked)}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors",
        disabled && "opacity-50",
        isInvalid && "border-destructive",
        checked && "border-primary bg-primary",
        className
      )}
      {...props}
    >
      {checked ? (
        <View data-slot="checkbox-indicator" className="items-center justify-center">
          <IconSymbol name="checkmark" size={12} color="#ffffff" />
        </View>
      ) : null}
    </Pressable>
  );
}

export { Checkbox };
