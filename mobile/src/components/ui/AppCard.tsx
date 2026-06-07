import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type AppCardProps = {
  className?: string;
  children: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AppCard = ({
  className = '',
  children,
  pressable = true,
  onPress,
  ...rest
}: AppCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardClasses = `rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 ${className}`;

  if (!pressable || !onPress) {
    return (
      <View className={cardClasses} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <AnimatedPressable
      style={animatedStyle}
      className={cardClasses}
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
};
