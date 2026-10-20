import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface HeaderBrandingProps {
  subtitle?: string;
  showRoleBadge?: boolean;
}

export const HeaderBranding: React.FC<HeaderBrandingProps> = ({
  subtitle,
  showRoleBadge = true,
}) => {
  const { user, isAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.brandGroup}>
          <View style={styles.logoBadge}>
            <Ionicons name="wallet" size={18} color="#FFFFFF" />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.brandTitle}>Bachat</Text>
              <Text style={styles.brandSeparator}>|</Text>
              <Text style={styles.companyName}>Shrestha Services</Text>
            </View>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : (
              <Text style={styles.subtitle}>Executive Financial Suite</Text>
            )}
          </View>
        </View>

        {showRoleBadge && (
          <Pressable
            style={[
              styles.roleBadge,
              { backgroundColor: isAdmin ? Palette.indigoMuted : Palette.amberMuted },
            ]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <View
              style={[
                styles.roleDot,
                { backgroundColor: isAdmin ? Palette.indigo : Palette.amber },
              ]}
            />
            <Text
              style={[
                styles.roleText,
                { color: isAdmin ? Palette.indigo : Palette.amber },
              ]}
            >
              {isAdmin ? 'OFFICE ADMIN' : 'STAFF USER'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  brandSeparator: {
    marginHorizontal: 6,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '300',
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
