import { router } from "expo-router";
import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";
import { useCreateChild } from "@/features/children/hooks/useChildren";
import type { Gender } from "@/features/children/types/child.types";

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

export const AddChildScreen = () => {
  const { mutateAsync, isPending } = useCreateChild();

  const nameRef = useRef("");
  const birthDateRef = useRef("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleSave = async () => {
    const errs = validate(nameRef.current, birthDateRef.current);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
    try {
      await mutateAsync({ name: nameRef.current.trim(), birthDate: birthDateRef.current, gender });
      router.back();
    } catch {
      Alert.alert("Gagal", "Tidak bisa menyimpan data anak. Coba lagi.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 24 }}
          className="gap-5"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <InputField
            label="Nama Anak"
            defaultValue=""
            onChangeText={(t) => {
              nameRef.current = t;
            }}
            placeholder="Nama lengkap anak"
            autoCapitalize="words"
            error={formErrors.name}
          />

          <InputField
            label="Tanggal Lahir"
            defaultValue=""
            onChangeText={(t) => {
              birthDateRef.current = t;
            }}
            placeholder="YYYY-MM-DD (contoh: 2023-01-15)"
            keyboardType="numeric"
            error={formErrors.birthDate}
          />

          {/* Gender Selector */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-gray-900">Jenis Kelamin</Text>
            <View className="flex-row gap-3">
              {(["MALE", "FEMALE"] as Gender[]).map((g) => {
                const isSelected = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 ${
                      isSelected
                        ? "bg-primary border-primary"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <Text className="text-xl">{g === "MALE" ? "👦" : "👧"}</Text>
                    <Text
                      className={`text-sm font-bold ${
                        isSelected ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {g === "MALE" ? "Laki-laki" : "Perempuan"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Button onPress={handleSave} loading={isPending} className="mt-2">
            Simpan
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
