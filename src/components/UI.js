import React from 'react';
import { Pressable, Text, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';

export function TeamMark({ team, size = 42 }) {
  const color = team?.color || '#187B62';
  const short = team?.short || (team?.name ? team.name.slice(0, 2).toUpperCase() : '??');
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        backgroundColor: `${color}18`,
        borderWidth: 1.5,
        borderColor: `${color}35`,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <Text style={{ color, fontWeight: '900', fontSize: size * 0.36, letterSpacing: -0.5 }}>
        {short}
      </Text>
    </View>
  );
}

export function SectionTitle({ title, subtitle, action, onPress }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
      <View>
        <Text style={{ fontSize: 18, fontWeight: '900', color: '#17221D', letterSpacing: -0.4 }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 11, color: '#78857C', marginTop: 1 }}>{subtitle}</Text>}
      </View>
      {action ? (
        <Pressable
          onPress={onPress}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 4, paddingHorizontal: 6 }}
        >
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#187B62' }}>{action}</Text>
          <Ionicons name="chevron-forward" size={13} color="#187B62" />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({ children, color = '#187B62', bg = '#EAF4EF', icon }) {
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: `${color}25`,
      }}
    >
      {icon && <Ionicons name={icon} size={11} color={color} />}
      <Text style={{ color, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 }}>{children}</Text>
    </View>
  );
}

export function DeliveryBall({ label, size = 32 }) {
  let bg = 'white';
  let text = '#253129';
  let border = '#E4E8E5';
  let isBoundary = false;

  if (label === '4') {
    bg = '#10B981';
    text = 'white';
    border = '#059669';
    isBoundary = true;
  } else if (label === '6') {
    bg = '#6366F1';
    text = 'white';
    border = '#4F46E5';
    isBoundary = true;
  } else if (label === 'W' || label === 'Ret.Out') {
    bg = '#EF4444';
    text = 'white';
    border = '#DC2626';
    isBoundary = true;
  } else if (label === 'Wd') {
    bg = '#F59E0B';
    text = 'white';
    border = '#D97706';
  } else if (label?.startsWith('Nb')) {
    bg = '#EA580C';
    text = 'white';
    border = '#C2410C';
  } else if (label === '0' || label === 'DOT') {
    bg = '#F3F5F3';
    text = '#87948B';
    border = '#E1E6E2';
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: isBoundary ? bg : 'transparent',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isBoundary ? 0.3 : 0,
        shadowRadius: 2,
        elevation: isBoundary ? 2 : 0,
      }}
    >
      {label === 'DOT' ? (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: text }} />
      ) : (
        <Text style={{ color: text, fontSize: size * 0.34, fontWeight: '900' }}>
          {label}
        </Text>
      )}
    </View>
  );
}
