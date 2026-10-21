import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderBrandingProps {
  subtitle?: string;
  showRoleBadge?: boolean;
}

export const HeaderBranding: React.FC<HeaderBrandingProps> = ({
  subtitle,
  showRoleBadge = true,
}) => {
  const { user, isAdmin, lockApp } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.brandGroup}>
          <LinearGradient
            colors={['#10B981', '#047857']}
            style={styles.logoBadge}
          >
            <Ionicons name="wallet" size={17} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.brandTitle}>Bachat</Text>
              <Text style={styles.brandSeparator}>•</Text>
              <Text style={styles.companyName}>Shrestha Services</Text>
            </View>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : (
              <Text style={styles.subtitle}>
                {user?.fullName ? `${user.fullName}` : 'Khata & Digital Cashbook'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actionsRight}>
          {showRoleBadge && (
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: isAdmin ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)' },
              ]}
            >
              <View
                style={[
                  styles.roleDot,
                  { backgroundColor: isAdmin ? '#10B981' : '#F59E0B' },
                ]}
              />
              <Text
                style={[
                  styles.roleText,
                  { color: isAdmin ? '#10B981' : '#F59E0B' },
                ]}
              >
                {isAdmin ? 'HANDLER' : 'STAFF'}
              </Text>
            </View>
          )}

          {/* Instant 1-Tap Lock Button */}
          <TouchableOpacity
            style={styles.lockButton}
            onPress={lockApp}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="lock-closed" size={15} color="#94A3B8" />
          </TouchableOpacity>
        </View>
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
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 6,
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
    color: '#10B981',
    fontSize: 10,
  },
  companyName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
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
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lockButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
