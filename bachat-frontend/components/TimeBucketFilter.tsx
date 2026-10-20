import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TimeBucket } from '@/context/LedgerContext';
import { Palette } from '@/constants/Colors';

interface TimeBucketFilterProps {
  selected: TimeBucket;
  onSelect: (bucket: TimeBucket) => void;
}

const BUCKETS: { id: TimeBucket; label: string }[] = [
  { id: 'TODAY', label: 'Today' },
  { id: 'THIS_WEEK', label: 'This Week' },
  { id: 'THIS_MONTH', label: 'This Month' },
  { id: 'THIS_YEAR', label: 'This Year' },
];

export const TimeBucketFilter: React.FC<TimeBucketFilterProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {BUCKETS.map(b => {
        const isActive = selected === b.id;
        return (
          <Pressable
            key={b.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onSelect(b.id)}
          >
            <Text style={[styles.text, isActive && styles.textActive]}>{b.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  pillActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  textActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
});
