import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  Platform,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export const AuthGate: React.FC = () => {
  const { unlockWithPin, loginWithCredentials, savedPin, user } = useAuth();
  const [authMode, setAuthMode] = useState<'PIN' | 'CREDENTIALS'>('PIN');

  // PIN state
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Credentials state
  const [username, setUsername] = useState<string>('admin@shrestha.com');
  const [password, setPassword] = useState<string>('Admin@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credError, setCredError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Animation values
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const triggerShake = () => {
    if (Platform.OS !== 'web') {
      try {
        Vibration.vibrate(80);
      } catch (e) {}
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (digit: string) => {
    setPinError(null);
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 4) {
        // Validate immediately
        setTimeout(() => {
          const success = unlockWithPin(nextPin);
          if (!success) {
            triggerShake();
            setPinError('Incorrect Security PIN');
            setPin('');
          }
        }, 120);
      }
    }
  };

  const handleDelete = () => {
    setPinError(null);
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleCredentialsSubmit = async () => {
    setCredError(null);
    if (!username.trim() || !password.trim()) {
      setCredError('Please fill in both email and password.');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    const result = await loginWithCredentials(username.trim(), password);
    setIsSubmitting(false);

    if (!result.success) {
      triggerShake();
      setCredError(result.message || 'Invalid handler credentials.');
    }
  };

  const switchMode = (mode: 'PIN' | 'CREDENTIALS') => {
    setPin('');
    setPinError(null);
    setCredError(null);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setAuthMode(mode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#06090F', '#04060A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative luxury radial background circles */}
      <View style={styles.glowTop} pointerEvents="none" />

      <View style={styles.contentWrapper}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.shieldIconWrapper}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.shieldGradient}
            >
              <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
            </LinearGradient>
            <View style={styles.shieldPulseRing} />
          </View>

          <Text style={styles.companyTitle}>SHRESTHA SERVICES</Text>
          <Text style={styles.appTitle}>Bachat</Text>
          <Text style={styles.subtitle}>
            Financial Engine & Khata Ledger
          </Text>

          <View style={styles.securityBadge}>
            <Ionicons name="lock-closed" size={12} color="#10B981" />
            <Text style={styles.securityBadgeText}>
              VAULT LOCKED • AUTHORIZED HANDLERS ONLY
            </Text>
          </View>
        </View>

        {/* Mode Selector Pill */}
        <View style={styles.modeTabs}>
          <TouchableOpacity
            style={[styles.modeTab, authMode === 'PIN' && styles.modeTabActive]}
            onPress={() => switchMode('PIN')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="keypad-outline"
              size={15}
              color={authMode === 'PIN' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.modeTabText,
                authMode === 'PIN' && styles.modeTabTextActive,
              ]}
            >
              Quick PIN
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeTab,
              authMode === 'CREDENTIALS' && styles.modeTabActive,
            ]}
            onPress={() => switchMode('CREDENTIALS')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="person-outline"
              size={15}
              color={authMode === 'CREDENTIALS' ? '#FFFFFF' : '#64748B'}
            />
            <Text
              style={[
                styles.modeTabText,
                authMode === 'CREDENTIALS' && styles.modeTabTextActive,
              ]}
            >
              Handler Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Container */}
        <Animated.View
          style={[
            styles.interactiveArea,
            { opacity: fadeAnim, transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {authMode === 'PIN' ? (
            /* PIN Mode */
            <View style={styles.pinSection}>
              <Text style={styles.pinPrompt}>Enter 4-Digit Security PIN</Text>
              
              {/* 4 Pin Indicator Dots */}
              <View style={styles.dotsRow}>
                {[0, 1, 2, 3].map(i => {
                  const filled = pin.length > i;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        filled && styles.dotFilled,
                        pinError && styles.dotError,
                      ]}
                    />
                  );
                })}
              </View>

              {pinError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{pinError}</Text>
                </View>
              )}

              {/* Number Keypad */}
              <View style={styles.keypad}>
                {[
                  ['1', '2', '3'],
                  ['4', '5', '6'],
                  ['7', '8', '9'],
                  ['C', '0', 'DEL'],
                ].map((row, rIdx) => (
                  <View key={rIdx} style={styles.keypadRow}>
                    {row.map(k => {
                      if (k === 'C') {
                        return (
                          <TouchableOpacity
                            key={k}
                            style={styles.keyAction}
                            onPress={() => {
                              setPin('');
                              setPinError(null);
                            }}
                            activeOpacity={0.6}
                          >
                            <Text style={styles.keyActionText}>CLR</Text>
                          </TouchableOpacity>
                        );
                      }
                      if (k === 'DEL') {
                        return (
                          <TouchableOpacity
                            key={k}
                            style={styles.keyAction}
                            onPress={handleDelete}
                            activeOpacity={0.6}
                          >
                            <Ionicons
                              name="backspace-outline"
                              size={22}
                              color="#94A3B8"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return (
                        <TouchableOpacity
                          key={k}
                          style={styles.keyNumber}
                          onPress={() => handleKeyPress(k)}
                          activeOpacity={0.6}
                        >
                          <Text style={styles.keyNumberText}>{k}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>

              <View style={styles.pinHintContainer}>
                <Ionicons name="information-circle-outline" size={14} color="#64748B" />
                <Text style={styles.pinHint}>Default Office PIN: 1234</Text>
              </View>
            </View>
          ) : (
            /* Credentials Mode */
            <View style={styles.credSection}>
              <Text style={styles.credTitle}>Handler Authentication</Text>
              <Text style={styles.credSubtitle}>
                Sign in to manage company accounts, customers, and funds
              </Text>

              {credError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{credError}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Corporate Email / ID</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="admin@shrestha.com"
                    placeholderTextColor="#475569"
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Security Password</Text>
                <View style={styles.inputBox}>
                  <Ionicons name="key-outline" size={18} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    placeholderTextColor="#475569"
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={handleCredentialsSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.loginGradient}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Text style={styles.loginButtonText}>Unlock Office Vault</Text>
                      <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Quick Preset Selector for Easy Testing */}
              <View style={styles.quickPresets}>
                <Text style={styles.quickPresetsTitle}>Quick Credentials:</Text>
                <View style={styles.presetButtonsRow}>
                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => {
                      setUsername('admin@shrestha.com');
                      setPassword('Admin@123');
                    }}
                  >
                    <Text style={styles.presetChipText}>Admin (Rajesh)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.presetChip}
                    onPress={() => {
                      setUsername('staff@shrestha.com');
                      setPassword('Staff@123');
                    }}
                  >
                    <Text style={styles.presetChipText}>Staff (Sunita)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06090F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shieldIconWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  shieldGradient: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  shieldPulseRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 33,
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  companyTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 2,
    marginBottom: 2,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    gap: 6,
  },
  securityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: '#1E293B',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#F8FAFC',
  },
  interactiveArea: {
    width: '100%',
    backgroundColor: '#0C121E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  pinSection: {
    alignItems: 'center',
  },
  pinPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    transform: [{ scale: 1.15 }],
  },
  dotError: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    gap: 6,
  },
  errorText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    gap: 10,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyNumber: {
    width: 68,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#141D2F',
    borderWidth: 1,
    borderColor: '#24324D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  keyAction: {
    width: 68,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pinHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  pinHint: {
    fontSize: 11,
    color: '#64748B',
  },
  credSection: {
    width: '100%',
  },
  credTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  credSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    height: 44,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  eyeButton: {
    padding: 6,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    gap: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickPresets: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  quickPresetsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
