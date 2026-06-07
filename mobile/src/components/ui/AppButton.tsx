import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

type AppButtonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VARIANT_STYLES: Record<Variant, { container: string; text: string }> = {
  primary: {
    container: 'bg-primary dark:bg-primary-dark',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-primary-light dark:bg-primary-dark/20',
    text: 'text-primary dark:text-primary-light',
  },
  outline: {
    container: 'bg-transparent border border-primary dark:border-primary-light',
    text: 'text-primary dark:text-primary-light',
  },
  ghost: {
    container: 'bg-transparent',
    text: 'text-primary dark:text-primary-light',
  },
};

const SIZE_STYLES: Record<Size, { container: string; text: string }> = {
  sm: { container: 'py-2 px-4 rounded-lg', text: 'text-sm' },
  md: { container: 'py-3.5 px-6 rounded-xl', text: 'text-base' },
  lg: { container: 'py-4.5 px-8 rounded-2xl', text: 'text-lg' },
};

export const AppButton = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  onPress,
  className = '',
  textClassName = '',
  children,
}: AppButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 20, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 20, stiffness: 300 });
  };

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={`flex-row items-center justify-center gap-2 ${VARIANT_STYLES[variant].container} ${SIZE_STYLES[size].container} ${
        isDisabled ? 'opacity-50' : ''
      } ${className}`}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#0a7ea4'}
        />
      ) : (
        <Text
          className={`font-semibold tracking-wide ${VARIANT_STYLES[variant].text} ${SIZE_STYLES[size].text} ${textClassName}`}
        >
          {children}
        </Text>
      )}
    </AnimatedPressable>
  );
};
