import React from 'react';
import { router } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '@/components/ui/AppCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useChildrenList } from '@/features/children/hooks/useChildren';
import { useAuthStore } from '@/stores/authStore';
import type { Child } from '@/features/children/types/child.types';

const GenderIcon = React.memo(({ gender }: { gender: Child['gender'] }) => (
  <Text className="text-3xl">{gender === 'MALE' ? '👦' : '👧'}</Text>
));

const ChildCard = React.memo(({ child }: { child: Child }) => {
  return (
    <AppCard onPress={() => router.push(`/(app)/children/${child.id}`)} className="p-3">
      <View className="flex-row items-center gap-4">
        <View className="w-13 h-13 rounded-full items-center justify-center bg-primary-light dark:bg-primary-dark/20 flex-shrink-0">
          <GenderIcon gender={child.gender} />
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-100" numberOfLines={1}>
            {child.name}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400">{child.ageMonths} bulan</Text>
          {child.latestPrediction ? (
            <StatusBadge status={child.latestPrediction.status} />
          ) : (
            <Text className="text-xs text-gray-500 dark:text-gray-400">Belum ada assessment</Text>
          )}
        </View>

        <Text className="text-2xl font-light text-gray-400 dark:text-gray-600">›</Text>
      </View>
    </AppCard>
  );
});

export const HomeScreen = () => {
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, refetch, isRefetching } = useChildrenList();

  const children = data?.data ?? [];
  const firstName = user?.name?.split(' ')[0] ?? 'Bunda';

  if (isLoading) return <LoadingOverlay />;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <View>
          <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">Halo,</Text>
          <Text className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">{firstName}! 👋</Text>
        </View>
        <Pressable
          onPress={() => router.push('/(app)/children/new')}
          className="w-11 h-11 rounded-full items-center justify-center bg-primary"
          hitSlop={8}
        >
          <Text className="text-white text-2xl font-normal leading-7">+</Text>
        </Pressable>
      </View>

      {/* Section Title */}
      <View className="flex-row justify-between items-center px-6 pb-2 mt-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-gray-100">Data Anak</Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">{children.length} anak</Text>
      </View>

      {/* List */}
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChildCard child={item} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#0a7ea4"
            colors={['#0a7ea4']}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="👶"
            title="Belum Ada Data Anak"
            description="Tambahkan data anak pertama kamu untuk mulai memantau tumbuh kembangnya."
            actionLabel="Tambah Anak"
            onAction={() => router.push('/(app)/children/new')}
          />
        }
      />
    </SafeAreaView>
  );
};
