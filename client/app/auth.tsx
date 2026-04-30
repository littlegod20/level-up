import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';
import levelUpLogo from '@/assets/images/level_up_bg_removed.png';

function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AuthScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { signIn, signUp, status } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setDateOfBirth(formatDate(selectedDate));
    }
    setShowDatePicker(false);
  };

  const submit = async () => {
    const trimmed = email.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedDateOfBirth = dateOfBirth.trim();

    if (!trimmed || !password) {
      Alert.alert('Missing fields', 'Enter both email and password.');
      return;
    }

    if (mode === 'register') {
      if (!trimmedFirstName || !trimmedLastName || !trimmedDateOfBirth) {
        Alert.alert('Missing fields', 'Enter first name, last name, and date of birth.');
        return;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDateOfBirth)) {
        Alert.alert('Invalid date', 'Use date format YYYY-MM-DD.');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        console.log('signing in', trimmed, password);
        await signIn(trimmed, password);
      } else {
        console.log('signing up', trimmed, password, trimmedFirstName, trimmedLastName, trimmedDateOfBirth);
        await signUp({
          email: trimmed,
          password,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          dateOfBirth: trimmedDateOfBirth,
        });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Authentication failed';
      Alert.alert('Auth error', msg);
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Image source={levelUpLogo} style={styles.logo} />
          <View style={styles.titleBlock}>
            <ThemedText type="title">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {mode === 'login'
                ? 'Welcome back. Enter your details to continue.'
                : 'Fill in your details to start your journey.'}
            </ThemedText>
          </View>

          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor={colors.icon}
              autoComplete='email'
              textContentType='emailAddress'
              importantForAutofill='yes'
              autoCorrect={false}
            />
          </View>
          {mode === 'register' && (
            <>
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>First name</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="words"
                  textContentType="givenName"
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Last name</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor={colors.icon}
                  autoCapitalize="words"
                  textContentType="familyName"
                />
              </View>
              <View style={styles.fieldGroup}>
                <ThemedText style={styles.label}>Date of birth</ThemedText>
                <DateTimePicker
                  value={dateOfBirth ? new Date(dateOfBirth) : new Date(2000, 0, 1)}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              </View> 
            </>
          )}
          <View style={styles.fieldGroup}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <View style={[styles.passwordRow, { borderColor: colors.icon }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholder="Password"
                placeholderTextColor={colors.icon}
                autoComplete='password'
              />
              <Pressable onPress={() => setShowPassword((v) => !v)}>
                <ThemedText type="link">{showPassword ? 'Hide' : 'Show'}</ThemedText>
              </Pressable>
            </View>
          </View>

          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} onPress={submit} disabled={busy}>
            <ThemedText style={styles.buttonText}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</ThemedText>
          </Pressable>

          <Pressable onPress={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}>
            <ThemedText type="link">
              {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { gap: 12 },
  titleBlock: { gap: 4, marginBottom: 4 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, opacity: 0.8 },
  subtitle: { opacity: 0.8 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  dateInput: {
    justifyContent: 'center',
    minHeight: 44,
  },
  button: { marginTop: 8, padding: 14, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },

  passwordRow: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  logo:{
    width: 'auto',
    height:100,
    boxSizing: 'content-box',
    objectFit: 'contain'
  }
});
