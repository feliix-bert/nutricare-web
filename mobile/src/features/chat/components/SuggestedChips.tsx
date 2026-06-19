import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type SuggestedChipsProps = {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  title?: string;
};

const SuggestedChips = React.memo(({ suggestions, onSelect, title = 'Saran Pertanyaan:' }: SuggestedChipsProps) => {
  if (suggestions.length === 0) return null;

  return (
    <View className="px-container-padding pb-3">
      <Text className="text-xs text-outline mb-2 font-bold uppercase tracking-wider">{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
        {suggestions.map((item) => (
          <Pressable
            key={item}
            onPress={() => onSelect(item)}
            className="bg-primary-light/50 border border-primary/20 rounded-full px-4 py-2 mr-2.5 active:scale-95"
          >
            <Text className="text-primary font-bold text-xs">{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
});

SuggestedChips.displayName = 'SuggestedChips';

export { SuggestedChips };
