import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useNutritionStore } from "@/stores/nutritionStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/common/InputField";

type LocalFoodItem = {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const FOOD_DATABASE: LocalFoodItem[] = [
  { name: "Bubur Beras Merah", calories: 120, protein: 4, fat: 3, carbs: 20 },
  { name: "Puree Alpukat Halus", calories: 160, protein: 2, fat: 15, carbs: 9 },
  { name: "Bubur Salmon Labu", calories: 140, protein: 7, fat: 5, carbs: 16 },
  { name: "Nasi Tim Ayam Brokoli", calories: 180, protein: 9, fat: 6, carbs: 22 },
  { name: "Potongan Pepaya", calories: 45, protein: 0.5, fat: 0.1, carbs: 11 },
  { name: "Biskuit Bayi Organik", calories: 60, protein: 1, fat: 1.5, carbs: 10 },
  { name: "Puree Pisang Susu", calories: 95, protein: 1.5, fat: 0.5, carbs: 22 },
];

const searchIconStyle = { transform: [{ rotate: "45deg" }], marginRight: 4 };
const MEALS = ["Sarapan", "Makan Siang", "Makan Malam", "Camilan"] as const;
type MealType = typeof MEALS[number];

export const ManualEntryScreen = () => {
  const addLog = useNutritionStore((s) => s.addLog);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("Sarapan");
  const [selectedFood, setSelectedFood] = useState<LocalFoodItem | null>(null);
  const [portion, setPortion] = useState(1);

  const filteredFoods = FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectFood = (food: LocalFoodItem) => {
    setSelectedFood(food);
  };

  const renderFoodItem = useCallback(
    ({ item }: { item: LocalFoodItem }) => (
      <Pressable
        onPress={() => setSelectedFood(item)}
        className="px-6 py-3 border-b border-surface-container active:bg-surface-low flex-row justify-between items-center"
      >
        <Text className="text-xs font-bold text-on-surface">{item.name}</Text>
        <Text className="text-[10px] text-outline font-bold">{item.calories} kkal</Text>
      </Pressable>
    ),
    []
  );

  const handleSaveLog = () => {
    if (!selectedFood) return;

    // Fiber calculation based roughly on carbs
    const calculatedFiber = Math.round(selectedFood.carbs * portion * 0.1 * 10) / 10;

    addLog({
      childId: "child_001",
      photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=240&auto=format&fit=crop",
      foodDetected: [selectedFood.name],
      portionEstimate: `${portion} Porsi (${selectedMeal})`,
      calories: selectedFood.calories * portion,
      protein: selectedFood.protein * portion,
      fat: selectedFood.fat * portion,
      carbs: selectedFood.carbs * portion,
      fiber: calculatedFiber || 0.5,
      adequacyNote: `Tercatat sebagai ${selectedMeal} anak.`,
      mpasiRecommendation: "Pastikan kecukupan cairan dengan memberikan ASI atau air putih hangat.",
    });

    router.replace("/(app)/(tabs)/scanner" as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-container-padding py-4 border-b border-surface-container bg-surface-lowest">
        <View className="flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} className="p-1 rounded-full active:scale-95">
            <IconSymbol name="arrow.left" size={20} color="#3e646a" />
          </Pressable>
          <Text className="font-bold text-lg text-primary">Input Log Gizi Manual</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }} showsVerticalScrollIndicator={false}>
        {/* Step 1: Select Meal Type */}
        <View className="gap-2">
          <Text className="font-bold text-sm text-on-surface uppercase tracking-wider">1. Pilih Waktu Makan</Text>
          <View className="flex-row flex-wrap gap-2">
            {MEALS.map((meal) => {
              const isSelected = selectedMeal === meal;
              return (
                <Pressable
                  key={meal}
                  onPress={() => setSelectedMeal(meal)}
                  className={`px-4 py-2.5 rounded-full border active:scale-95 transition-transform ${
                    isSelected
                      ? "bg-primary-container border-primary-container"
                      : "bg-surface-lowest border-outline-variant/30"
                  }`}
                >
                  <Text className={`text-xs font-bold ${isSelected ? "text-on-surface" : "text-outline"}`}>
                    {meal}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Step 2: Choose food */}
        <View className="gap-3">
          <Text className="font-bold text-sm text-on-surface uppercase tracking-wider">2. Pilih Makanan</Text>

          {/* Search box */}
          <InputField
            value={searchQuery}
            onChangeText={(t) => {
              setSearchQuery(t);
              setSelectedFood(null);
            }}
            placeholder="Cari makanan (misal: Bubur Salmon)..."
            rightElement={
              <IconSymbol 
                name="plus" 
                size={16} 
                color="#717879" 
                style={searchIconStyle}
              />
            }
          />

          {/* Search Results */}
          {!selectedFood && (
            <View className="bg-surface-lowest border border-outline-variant/15 rounded-[24px] max-h-56 overflow-hidden shadow-sm">
              {filteredFoods.length === 0 ? (
                <Text className="text-xs text-outline text-center py-6">Makanan tidak ditemukan.</Text>
              ) : (
                <FlashList
                  data={filteredFoods}
                  keyExtractor={(item) => item.name}
                  renderItem={renderFoodItem}
                  estimatedItemSize={60}
                  scrollEnabled={filteredFoods.length > 4}
                  nestedScrollEnabled
                />
              )}
            </View>
          )}

          {/* Selected Food Detail Card */}
          {selectedFood && (
            <View className="bg-primary/5 border border-primary/20 rounded-[24px] p-5 gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="font-bold text-primary text-sm">{selectedFood.name}</Text>
                <Pressable onPress={() => setSelectedFood(null)} className="p-1">
                  <Text className="text-xs font-bold text-outline">Ganti</Text>
                </Pressable>
              </View>
              <View className="flex-row justify-between bg-surface-lowest p-3 rounded-[16px] border border-primary/10">
                <View className="items-center flex-1">
                  <Text className="text-[10px] text-outline">Kalori</Text>
                  <Text className="font-bold text-xs text-on-surface">{selectedFood.calories * portion} kkal</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-[10px] text-outline">Protein</Text>
                  <Text className="font-bold text-xs text-on-surface">{(selectedFood.protein * portion).toFixed(1)}g</Text>
                </View>
                <View className="items-center flex-1">
                  <Text className="text-[10px] text-outline">Lemak</Text>
                  <Text className="font-bold text-xs text-on-surface">{(selectedFood.fat * portion).toFixed(1)}g</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Step 3: Select Portion Counter */}
        {selectedFood && (
          <View className="gap-3">
            <Text className="font-bold text-sm text-on-surface uppercase tracking-wider">3. Tentukan Porsi</Text>
            <View className="flex-row items-center justify-center gap-6 py-3 bg-surface-lowest border border-outline-variant/15 rounded-[24px]">
              <Pressable
                onPress={() => setPortion((p) => Math.max(0.5, p - 0.5))}
                className="w-10 h-10 rounded-full bg-surface-low items-center justify-center active:scale-95"
              >
                <Text className="text-lg font-bold text-on-surface">-</Text>
              </Pressable>
              <Text className="text-lg font-extrabold text-primary">{portion} Porsi</Text>
              <Pressable
                onPress={() => setPortion((p) => p + 0.5)}
                className="w-10 h-10 rounded-full bg-surface-low items-center justify-center active:scale-95"
              >
                <Text className="text-lg font-bold text-on-surface">+</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Submit */}
        <Button
          onPress={handleSaveLog}
          disabled={!selectedFood}
          variant="primary"
          className="mt-6"
        >
          Simpan ke Log Gizi
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};
