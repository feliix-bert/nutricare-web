import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/features/auth/hooks/useAuth";

type FormErrors = { name?: string; email?: string; password?: string };

const validate = (name: string, email: string, password: string): FormErrors => {
  const errs: FormErrors = {};
  if (!name.trim()) errs.name = "Nama wajib diisi.";
  if (!email) errs.email = "Email wajib diisi.";
  else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Format email tidak valid.";
  if (!password) errs.password = "Password wajib diisi.";
  else if (password.length < 8) errs.password = "Password minimal 8 karakter.";
  return errs;
};

export const RegisterScreen = () => {
  const { register, isLoading, error } = useAuth();

  const nameRef = useRef("");
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleRegister = async () => {
    const errs = validate(nameRef.current, emailRef.current, passwordRef.current);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    const success = await register({
      name: nameRef.current.trim(),
      email: emailRef.current,
      password: passwordRef.current,
    });
    if (success) {
      Alert.alert("Pendaftaran Berhasil! 🎉", "Akun kamu sudah dibuat. Silakan masuk.", [
        { text: "Masuk", onPress: () => router.replace("/sign-in") },
      ]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          className="px-6 py-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="gap-2 mb-8">
            <Pressable onPress={() => router.back()} className="self-start mb-1" hitSlop={12}>
              <Text className="text-base font-semibold text-primary">← Kembali</Text>
            </Pressable>
            <Text className="text-3xl font-extrabold tracking-tight text-gray-900">Buat Akun</Text>
            <Text className="text-sm text-gray-500">
              Daftar untuk mulai memantau tumbuh kembang anak
            </Text>
          </View>

          {/* Form */}
          <View className="gap-5">
            {error && (
              <View className="p-3.5 rounded-xl bg-danger-light">
                <Text className="text-sm font-medium text-danger">{error.message}</Text>
              </View>
            )}

            <Input
              label="Nama Lengkap"
              defaultValue=""
              onChangeText={(t) => {
                nameRef.current = t;
              }}
              placeholder="Nama kamu"
              autoCapitalize="words"
              error={formErrors.name}
            />

            <Input
              label="Email"
              defaultValue=""
              onChangeText={(t) => {
                emailRef.current = t;
              }}
              placeholder="contoh@email.com"
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

            <Button onPress={handleRegister} loading={isLoading} className="mt-2">
              Daftar
            </Button>
          </View>

          {/* Login link */}
          <View className="flex-row justify-center items-center mt-8 gap-1.5">
            <Text className="text-sm text-gray-500">Sudah punya akun?</Text>
            <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
              <Text className="text-sm font-bold text-primary">Masuk</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
