import React from 'react';
import { Text, View } from 'react-native';

type FoodTagListProps = {
  items: string[];
};

const FoodTagList = React.memo(({ items }: FoodTagListProps) => (
  <View className="flex-row flex-wrap gap-2">
    {items.map((item) => (
      <View key={item} className="bg-primary-light/60 border border-primary/10 rounded-full px-3 py-1">
        <Text className="text-[10px] text-primary font-bold">{item}</Text>
      </View>
    ))}
  </View>
));

FoodTagList.displayName = 'FoodTagList';

export { FoodTagList };
