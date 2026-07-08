import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useChild, useUpdateChild } from "@/features/children/hooks/useChildren";
import type { Gender } from "@/features/children/types/child-types";

type FormErrors = { name?: string; birthDate?: string };

const validate = (name: string, birthDate: string): FormErrors => {
  const errs: FormErrors = {};
  if (!name.trim()) errs.name = "Nama anak wajib diisi.";
  if (!birthDate) {
    errs.birthDate = "Tanggal lahir wajib diisi.";
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      errs.birthDate = "Format: YYYY-MM-DD (contoh: 2023-01-15)";
    } else {
      const parsed = new Date(birthDate);
      if (isNaN(parsed.getTime()) || parsed >= new Date()) {
        errs.birthDate = "Tanggal lahir harus di masa lalu.";
      }
    }
  }
  return errs;
};

export const EditChildScreen = () => {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const { data: child, isLoading } = useChild(childId ?? "");
  const { mutateAsync, isPending } = useUpdateChild(childId ?? "");

  const nameRef = useRef("");
  const birthDateRef = useRef("");
  // Gender tidak bisa diupdate berdasarkan API doc (hanya name, birthDate), tapi kita tampilkan readonly.
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (child) {
      nameRef.current = child.name;
      birthDateRef.current = child.birthDate;
    }
  }, [child]);

  if (isLoading || !child) return <LoadingOverlay />;

  const handleSave = async () => {
    const errs = validate(nameRef.current, birthDateRef.current);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    try {
      await mutateAsync({ name: nameRef.current.trim(), birthDate: birthDateRef.current });
      router.back();
    } catch {
      Alert.alert("Gagal", "Tidak bisa memperbarui data anak. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-container-padding py-4 border-b border-surface-container bg-surface-lowest flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="p-1 rounded-full active:scale-95">
            <IconSymbol name="arrow.left" size={20} color="#3e646a" />
          </Pressable>
          <Text className="font-bold text-lg text-primary ml-3">Edit Data Anak</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InputField
            label="Nama Anak"
            defaultValue={child.name}
            onChangeText={(t) => {
              nameRef.current = t;
            }}
            placeholder="Nama lengkap anak"
            autoCapitalize="words"
            error={formErrors.name}
          />

          <InputField
            label="Tanggal Lahir"
            defaultValue={child.birthDate}
            onChangeText={(t) => {
              birthDateRef.current = t;
            }}
            placeholder="YYYY-MM-DD (contoh: 2023-01-15)"
            keyboardType="numeric"
            error={formErrors.birthDate}
          />

          <View className="gap-2">
            <Text className="text-sm font-semibold text-outline">Jenis Kelamin (Tidak dapat diubah)</Text>
            <View className="flex-row items-center px-4 py-4 rounded-xl border-2 bg-surface-low border-outline-variant/15">
              <Text className="font-bold text-on-surface-variant">
                {child.gender === "MALE" ? "Laki-laki 👦" : "Perempuan 👧"}
              </Text>
            </View>
          </View>

          <Button onPress={handleSave} loading={isPending} className="mt-4">
            Simpan Perubahan
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
