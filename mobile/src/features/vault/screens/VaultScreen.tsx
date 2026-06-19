import React, { useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Card, CardContent } from "@/components/ui/Card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useVaultStore, BlockchainRecord } from "@/stores/vaultStore";

const chevronExpandedStyle = { transform: [{ rotate: "90deg" }] };
const chevronCollapsedStyle = { transform: [{ rotate: "0deg" }] };

export const VaultScreen = () => {
  const records = useVaultStore((s) => s.records);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const RecordCard = React.memo(({ record }: { record: BlockchainRecord }) => {
    const isExpanded = expandedId === record.id;
    return (
      <Card pressable onPress={() => toggleExpand(record.id)} className="mb-3">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
              <IconSymbol name="shield.fill" size={20} color="#506444" />
            </View>
            <View>
              <Text className="font-bold text-on-surface text-base">{record.childName}</Text>
              <Text className="text-xs text-outline font-medium">{record.timestamp}</Text>
            </View>
          </View>
          <View className="items-end gap-1">
            <StatusBadge status={record.status} />
            <Text className="text-[10px] text-primary font-bold">Block #{record.blockNumber}</Text>
          </View>
        </View>

        {isExpanded && (
          <View className="mt-4 pt-4 border-t border-surface-container gap-3">
            <View className="flex-row justify-between items-center bg-surface-low p-3 rounded-[20px]">
              <View className="items-center flex-1">
                <Text className="text-xs text-outline mb-0.5">Tinggi Badan</Text>
                <Text className="font-bold text-on-surface text-sm">{record.height} cm</Text>
              </View>
              <View className="w-px h-8 bg-outline-variant/35" />
              <View className="items-center flex-1">
                <Text className="text-xs text-outline mb-0.5">Berat Badan</Text>
                <Text className="font-bold text-on-surface text-sm">{record.weight} kg</Text>
              </View>
              <View className="w-px h-8 bg-outline-variant/35" />
              <View className="items-center flex-1">
                <Text className="text-xs text-outline mb-0.5">Usia Anak</Text>
                <Text className="font-bold text-on-surface text-sm">{record.ageMonths} bln</Text>
              </View>
            </View>

            <View className="gap-2 px-1">
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline">TX Hash</Text>
                <Text className="text-xs font-mono text-on-surface select-all">{record.txHash}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline">Network Cost</Text>
                <Text className="text-xs font-bold text-on-surface">{record.gasFee}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-outline">Integrity Status</Text>
                <View className="flex-row items-center gap-1">
                  <IconSymbol name="checkmark.circle.fill" size={12} color="#506444" />
                  <Text className="text-xs font-bold text-secondary">Verified Verified</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="flex-row justify-center mt-2">
          <IconSymbol
            name="chevron.right"
            size={16}
            color="#717879"
            style={isExpanded ? chevronExpandedStyle : chevronCollapsedStyle}
          />
        </View>
      </Card>
    );
  });

  RecordCard.displayName = "RecordCard";

  const renderItem = useCallback(
    ({ item }: { item: BlockchainRecord }) => <RecordCard record={item} />,
    [expandedId]
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Header */}
      <View className="px-container-padding py-6 border-b border-surface-container bg-surface-lowest">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-full bg-primary-light items-center justify-center">
            <IconSymbol name="wallet.pass.fill" size={24} color="#3e646a" />
          </View>
          <View>
            <Text className="text-xl font-bold text-on-surface">GiziChain Health Vault</Text>
            <Text className="text-xs text-outline font-medium">
              Data rekam medis terdesentralisasi anti-stunting
            </Text>
          </View>
        </View>
      </View>

      {/* Intro card */}
      <View className="px-container-padding pt-4">
        <View className="bg-primary/5 border border-primary/10 rounded-[32px] p-4 flex-row items-center gap-3">
          <IconSymbol name="info.circle" size={20} color="#3e646a" />
          <Text className="text-xs text-primary font-medium leading-4 flex-1">
            Seluruh data pengukuran berat & tinggi badan anak tersimpan permanen di jaringan GiziChain. Keamanan rekam medis dijamin dengan enkripsi kriptografi.
          </Text>
        </View>
      </View>

      {/* List */}
      <FlashList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        estimatedItemSize={100}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20 gap-4">
            <Text className="text-4xl">🔒</Text>
            <Text className="font-bold text-on-surface text-base">Belum Ada Rekaman Blockchain</Text>
            <Text className="text-xs text-outline text-center px-8">
              Lakukan assessment tumbuh kembang anak untuk mencatatkan rekam medis pertama ke GiziChain Vault.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
