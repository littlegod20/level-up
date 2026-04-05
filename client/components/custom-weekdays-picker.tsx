import { Picker } from '@react-native-picker/picker';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { WEEKDAY_ORDER, sortWeekdayIndices, weekdayLabel } from '@/constants/weekdays';

type Props = {
  /** JavaScript weekday indices: 0 = Sun … 6 = Sat */
  value: number[];
  onChange: (days: number[]) => void;
  accentColor: string;
  borderColor: string;
  textColor: string;
  mutedColor: string;
};

export function CustomWeekdaysPicker({
  value,
  onChange,
  accentColor,
  borderColor,
  textColor,
  mutedColor,
}: Props) {
  const sorted = useMemo(() => sortWeekdayIndices(value), [value]);
  const [pickerValue, setPickerValue] = useState<number>(WEEKDAY_ORDER[0]);

  const addDay = () => {
    if (value.includes(pickerValue)) return;
    onChange(sortWeekdayIndices([...value, pickerValue]));
  };

  const removeDay = (d: number) => {
    onChange(value.filter((x) => x !== d));
  };

  return (
    <View>
      <View style={[styles.pickerRow, { borderColor }]}>
        <View style={styles.pickerWrap}>
          <Picker
            selectedValue={pickerValue}
            onValueChange={(v) => setPickerValue(Number(v))}
            style={styles.picker}
            dropdownIconColor={mutedColor}
          >
            {WEEKDAY_ORDER.map((d) => (
              <Picker.Item key={d} label={weekdayLabel(d)} value={d} color={textColor} />
            ))}
          </Picker>
        </View>
        <Pressable
          style={[styles.addBtn, { backgroundColor: accentColor, borderRadius:10 }]}
          onPress={addDay}
          accessibilityRole="button"
          accessibilityLabel="Add selected day"
        >
          <ThemedText style={styles.addBtnText}>Add</ThemedText>
        </Pressable>
      </View>
      {sorted.length > 0 ? (
        <View style={styles.badges}>
          {sorted.map((d) => (
            <Pressable
              key={d}
              style={[styles.badge, { backgroundColor: accentColor + '33', borderColor: accentColor }]}
              onPress={() => removeDay(d)}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${weekdayLabel(d)}`}
            >
              <ThemedText style={[styles.badgeText, { color: textColor }]}>{weekdayLabel(d)}</ThemedText>
              <ThemedText style={[styles.badgeX, { color: mutedColor }]}>×</ThemedText>
            </Pressable>
          ))}
        </View>
      ) : (
        <ThemedText style={[styles.hint, { color: mutedColor }]}>
          Pick a day above and tap Add. Selected days appear here.
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerWrap: { flex: 1 },
  picker: { width: '100%' },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15},
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: { fontSize: 13, fontWeight: '600' },
  badgeX: { fontSize: 18, lineHeight: 20, fontWeight: '400' },
  hint: { marginTop: 10, fontSize: 13 },
});
