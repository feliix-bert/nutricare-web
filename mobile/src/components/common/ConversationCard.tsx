import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '@/components/ui/Card';
import { IconSymbol } from '@/components/ui/icon-symbol';

type ConversationCardProps = {
  parentName: string;
  lastMessage: string;
  lastMessageAt: string;
  onPress: () => void;
};

export const ConversationCard = React.memo(({ parentName, lastMessage, onPress }: ConversationCardProps) => {
  return (
    <Pressable onPress={onPress} className="mb-2 active:opacity-80">
      <Card className="p-4 flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="font-bold text-on-surface">{parentName}</Text>
          <Text className="text-sm text-outline" numberOfLines={1}>{lastMessage}</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color="#3e646a" />
      </Card>
    </Pressable>
  );
});

ConversationCard.displayName = 'ConversationCard';
