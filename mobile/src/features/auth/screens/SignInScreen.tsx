import { router } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";

type FormErrors = { email?: string; password?: string };

const validate = (email: string, password: string): FormErrors => {
  const errs: FormErrors = {};
  if (!email) errs.email = "Email wajib diisi.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";
  if (!password) errs.password = "Password wajib diisi.";
  else if (password.length < 8) errs.password = "Password minimal 8 karakter.";
  return errs;
};

export const SignInScreen = () => {
  const { login, isLoading, error } = useAuth();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleLogin = async () => {
    const errs = validate(emailRef.current, passwordRef.current);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    await login({ email: emailRef.current, password: passwordRef.current });
  };

  const handleRegisterPress = () => router.push("/register");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          className="px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View className="items-center gap-3 mb-10">
            <View className="w-24 h-24 rounded-full items-center justify-center bg-primary-light mb-1">
              <Text className="text-5xl">🌱</Text>
            </View>
            <Text className="text-3xl font-extrabold tracking-tight text-primary">Tumbuh Sehat</Text>
            <Text className="text-sm text-gray-500">Pantau tumbuh kembang si kecil</Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            <Text className="text-2xl font-bold text-gray-900">Masuk</Text>

            {error && (
              <View className="p-3.5 rounded-xl bg-danger-light">
                <Text className="text-sm font-medium text-danger">{error.message}</Text>
              </View>
            )}

            <Input
              label="Email"
              defaultValue=""
              onChangeText={(t) => {
                emailRef.current = t;
              }}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={formErrors.email}
            />

            <Input
              label="Password"
              defaultValue=""
              onChangeText={(t) => {
                passwordRef.current = t;
              }}
              placeholder="Minimal 8 karakter"
              secureTextEntry
              showPasswordToggle
              error={formErrors.password}
            />

            <Button onPress={handleLogin} loading={isLoading} className="mt-2">
              Masuk
            </Button>
          </View>

          {/* Register link */}
          <View className="flex-row justify-center items-center mt-8 gap-1.5">
            <Text className="text-sm text-gray-500">Belum punya akun?</Text>
            <Pressable onPress={handleRegisterPress} hitSlop={8}>
              <Text className="text-sm font-bold text-primary">Daftar sekarang</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
