import React from 'react';
import { Pressable, Text, View } from '../theme/native';

export function TeamMark({ team, size = 42 }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${team?.color || '#187B62'}18`, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: team?.color || '#187B62', fontWeight: '800', fontSize: size * .30 }}>{team?.short || '??'}</Text></View>;
}

export function SectionTitle({ title, action, onPress }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}><Text style={{ fontSize: 19, fontWeight: '800', color: '#17221D' }}>{title}</Text>{action ? <Pressable onPress={onPress}><Text style={{ fontSize: 13, fontWeight: '700', color: '#187B62' }}>{action}</Text></Pressable> : null}</View>;
}

export function Pill({ children, color = '#187B62', bg = '#EAF4EF' }) {
  return <View style={{ backgroundColor: bg, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, alignSelf: 'flex-start' }}><Text style={{ color, fontSize: 10, fontWeight: '800', letterSpacing: .6 }}>{children}</Text></View>;
}
