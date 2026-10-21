import React, { useState } from 'react';
import {
  Keyboard,
  Pressable as RNPressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Pressable, Touchable } from 'react-native-gesture-handler';

// Android regression #4622: tap the input itself, not the surrounding padding.
// A scroll ancestor defers native button interception, exposing the regression.
export default function DisabledTextInput() {
  const [editable, setEditable] = useState(false);
  const [scrollable, setScrollable] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [events, setEvents] = useState<string[]>([]);
  const record = (name: string, event: string) => {
    setEvents((previous) => [`${name}: ${event}`, ...previous].slice(0, 6));
    if (event === 'press') {
      setCounts((previous) => ({
        ...previous,
        [name]: (previous[name] ?? 0) + 1,
      }));
    }
  };

  const Container = scrollable ? ScrollView : View;
  return (
    <Container
      keyboardShouldPersistTaps="always"
      contentContainerStyle={scrollable ? styles.container : undefined}
      style={scrollable ? undefined : styles.container}>
      <RNPressable
        testID="toggle-scroll"
        onPress={() => setScrollable(!scrollable)}>
        <Text>Scroll container: {String(scrollable)} (tap to toggle)</Text>
      </RNPressable>
      <RNPressable
        testID="toggle-editable"
        onPress={() => {
          Keyboard.dismiss();
          setEditable(!editable);
        }}>
        <Text style={styles.title}>
          Editable: {String(editable)} (tap to toggle)
        </Text>
      </RNPressable>
      {[RNPressable, Pressable, Touchable].map((Component, index) => {
        const name = ['RN Pressable', 'RNGH Pressable', 'RNGH Touchable'][
          index
        ];
        return (
          <View key={name}>
            <Text>
              {name}: {counts[name] ?? 0} presses
            </Text>
            <Component
              testID={`input-parent-${index}`}
              style={styles.button}
              onPress={() => record(name, 'press')}
              onPressIn={() => record(name, 'in')}
              onPressOut={() => record(name, 'out')}
              onLongPress={() => record(name, 'long')}>
              <TextInput
                testID={`input-${index}`}
                editable={editable}
                placeholder="Tap this input"
                placeholderTextColor="#555"
                style={styles.input}
                onFocus={() => record(name, 'focus')}
              />
            </Component>
          </View>
        );
      })}
      <Text>Workaround control: input wrapper uses pointerEvents="none".</Text>
      <Touchable
        style={styles.button}
        onPress={() => record('Workaround', 'press')}>
        <View pointerEvents="none" collapsable={false}>
          <TextInput
            editable={false}
            placeholder="Tap this input"
            placeholderTextColor="#555"
            style={styles.input}
          />
        </View>
      </Touchable>
      <Text>Workaround: {counts.Workaround ?? 0} presses</Text>
      <Text testID="event-log">{events.join('\n')}</Text>
      {scrollable && (
        <Text style={styles.spacer}>
          Drag from an input: scrolling must not fire a press.
        </Text>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16, backgroundColor: '#fff' },
  title: { fontWeight: 'bold' },
  button: { padding: 12, backgroundColor: '#dde7ff', borderRadius: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
    color: '#111',
  },
  spacer: { marginTop: 400, marginBottom: 40 },
});
