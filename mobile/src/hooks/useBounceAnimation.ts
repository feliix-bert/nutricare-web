import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";

type BounceConfig = {
  amplitude?: number;
  duration?: number;
};

export const useBounceAnimation = (
  config: BounceConfig = {}
): { transform: { translateY: number }[] } => {
  const { amplitude = -10, duration = 600 } = config;
  const bounce = useSharedValue(0);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(amplitude, {
          duration,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [bounce, amplitude, duration]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));
};
