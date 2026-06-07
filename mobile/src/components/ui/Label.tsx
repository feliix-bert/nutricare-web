import { Text, TextProps } from "react-native";

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ")
}

interface LabelProps extends TextProps {
  disabled?: boolean;
}

const Label = ({ children, className = "", disabled, ...props }: LabelProps) => {
  return (
    <Text
      className={cn(
        "text-sm font-medium select-none text-gray-900",
        disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
};

export { Label };
