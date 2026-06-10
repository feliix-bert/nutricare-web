import { useRouter } from "next/navigation";

/**
 * A generic navigation hook that wraps Next.js router.
 * Use this hook throughout the app instead of `useRouter` directly.
 * 
 * When migrating to React Native, you can simply swap the internal
 * implementation of this hook to use `useNavigation` from React Navigation
 * without needing to touch every single screen component.
 */
export const useAppNavigation = () => {
  const router = useRouter();

  const navigate = (path: string) => {
    router.push(path);
  };

  const replace = (path: string) => {
    router.replace(path);
  };

  const goBack = () => {
    router.back();
  };

  return {
    navigate,
    replace,
    goBack,
    // Provide raw router for specific Next.js features if absolutely necessary,
    // but try to avoid using it to maintain portability.
    _rawRouter: router,
  };
};
