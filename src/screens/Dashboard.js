import React from 'react';
import { Pressable, ScrollView, Text, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '../theme/native';
import { matches as initialMatches, getTeam } from '../data/mockData';
import { Pill, SectionTitle, TeamMark } from '../components/UI';

function LiveCard({ match, onPress }) {
  const batting = getTeam(match.home);
  const bowling = getTeam(match.away);
  return <Pressable onPress={() => onPress(match)} style={{ borderRadius: 22, overflow: 'hidden', marginBottom: 14 }}>
    <LinearGradient colors={['#103C2E', '#0C2F25']} style={{ padding: 19 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><View style={{ width: 7, height: 7, borderRadius: 5, backgroundColor: '#E66D51' }} /><Text style={{ color: '#FFB4A2', fontSize: 10, letterSpacing: 1.2, fontWeight: '800' }}>LIVE NOW</Text></View><Text style={{ color: '#A9C3B8', fontSize: 11 }}>{match.format}  -  {match.venue}</Text></View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={{ backgroundColor: '#FFFFFF18', borderRadius: 22, padding: 4 }}><TeamMark team={batting} size={40} /></View><View><Text style={{ color: '#F4F7F3', fontSize: 14, fontWeight: '700' }}>{batting.name}</Text><Text style={{ color: 'white', fontSize: 30, fontWeight: '800', marginTop: 1 }}>{match.score}<Text style={{ fontSize: 16, color: '#B9CEC4' }}>/{match.wickets}</Text></Text></View></View><Text style={{ color: '#A9C3B8', fontSize: 12, marginLeft: 58, marginTop: 3 }}>({match.overs} overs)</Text></View><View style={{ alignItems: 'flex-end', paddingLeft: 8 }}><TeamMark team={bowling} size={36} /><Text style={{ color: '#CBD8D0', marginTop: 8, fontSize: 12 }}>{bowling.short}</Text></View></View>
      <View style={{ height: 1, backgroundColor: '#FFFFFF20', marginVertical: 15 }} /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: '#C3D2CA', fontSize: 11 }}>{match.totalOvers ? 'Overs ' : 'Need '}<Text style={{ color: 'white', fontWeight: '700' }}>{match.totalOvers ? `${match.overs}/${match.totalOvers}` : '39 runs'}</Text>{match.totalOvers ? '  -  ' : ' from '}<Text style={{ color: 'white', fontWeight: '700' }}>{match.totalOvers ? `Bowler ${match.bowler.name}` : '21 balls'}</Text></Text><Text style={{ color: '#A9C3B8', fontSize: 11 }}>{match.totalOvers ? '' : 'CRR 8.61'}</Text><View style={{ width: 28, height: 28, borderRadius: 15, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-forward" size={14} color="white" /></View></View>
    </LinearGradient>
  </Pressable>;
}

function UpcomingCard({ match, onPress }) {
  const home = getTeam(match.home); const away = getTeam(match.away);
  return <Pressable onPress={() => onPress(match)} style={{ backgroundColor: 'white', borderRadius: 17, padding: 15, marginBottom: 10, borderWidth: 1, borderColor: '#EEF1EE' }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Pill color="#A16A21" bg="#FBF2E3">UPCOMING</Pill><Text style={{ fontSize: 10, fontWeight: '700', color: '#87928A' }}>{match.time}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}><TeamMark team={home} size={36} /><Text style={{ flex: 1, color: '#26332C', fontSize: 13, fontWeight: '700', marginLeft: 9 }}>{home.name}</Text><Text style={{ color: '#9AA49E', fontSize: 10, fontWeight: '700' }}>VS</Text><Text style={{ flex: 1, color: '#26332C', fontSize: 13, fontWeight: '700', textAlign: 'right', marginRight: 9 }}>{away.name}</Text><TeamMark team={away} size={36} /></View><Text style={{ fontSize: 11, color: '#909A93', marginTop: 11 }}>{match.format}  -  {match.venue}</Text></Pressable>;
}

export default function Dashboard({ matches = initialMatches, onOpenMatch, onCreateMatch, onLiveScore, onNavigate }) {
  const live = matches.find((match) => match.status === 'LIVE');
  const upcoming = matches.filter((match) => match.status === 'UPCOMING');
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30 }}>
    <LinearGradient colors={['#F0F5F0', '#F8F8F4']} style={{ borderRadius: 19, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}><View><Text style={{ color: '#66756B', fontSize: 11, fontWeight: '600' }}>MONDAY, 16 NOVEMBER</Text><Text style={{ fontSize: 17, fontWeight: '800', color: '#1B2921', marginTop: 4 }}>Your cricket, at a glance</Text></View><View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="sunny-outline" size={21} color="#B68236" /></View></LinearGradient>
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}><Shortcut title="New match" detail="Set up a game" icon="add-circle-outline" color="#187B62" onPress={onCreateMatch} /><Shortcut title="Live score" detail={live ? 'Open live scoring' : 'No live match yet'} icon="radio-outline" color="#C6533C" onPress={() => live ? onOpenMatch(live) : onLiveScore()} /></View>
    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}><Shortcut title="Players" detail="Manage your squad" icon="people-outline" color="#5265B8" onPress={() => onNavigate('Teams')} /><Shortcut title="Match history" detail="Browse past games" icon="time-outline" color="#B68236" onPress={() => onNavigate('Matches')} /></View>
    <SectionTitle title="Live match" action="All matches" onPress={() => onNavigate('Matches')} />{live ? <LiveCard match={live} onPress={onOpenMatch} /> : <Text>No live matches right now.</Text>}
    <View style={{ marginTop: 12 }}><SectionTitle title="Coming up" action="View schedule" onPress={() => onNavigate('Matches')} />{upcoming.map((match) => <UpcomingCard key={match.id} match={match} onPress={onOpenMatch} />)}</View>
    <Pressable onPress={() => onNavigate('Teams')} style={{ backgroundColor: '#E9F1EB', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', marginTop: 8 }}><View style={{ width: 39, height: 39, borderRadius: 13, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="trophy-outline" size={20} color="#187B62" /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: '#1B2921', fontWeight: '800', fontSize: 13 }}>Harbor Cricket League</Text><Text style={{ color: '#748078', fontSize: 11, marginTop: 3 }}>Season 2025  -  8 teams competing</Text></View><Ionicons name="chevron-forward" size={17} color="#748078" /></Pressable>
  </ScrollView>;
}

function Shortcut({ title, detail, icon, color, onPress }) {
  return <Pressable onPress={onPress} style={{ flex: 1, minHeight: 75, backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1, borderColor: '#EEF1EE', flexDirection: 'row', alignItems: 'center' }}><View style={{ width: 35, height: 35, borderRadius: 12, backgroundColor: `${color}14`, alignItems: 'center', justifyContent: 'center', marginRight: 9 }}><Ionicons name={icon} size={19} color={color} /></View><View style={{ flex: 1 }}><Text style={{ color: '#223028', fontSize: 11, fontWeight: '800' }}>{title}</Text><Text numberOfLines={1} style={{ color: '#8A948D', fontSize: 9, marginTop: 3 }}>{detail}</Text></View><Ionicons name="chevron-forward" size={14} color="#A3ACA6" /></Pressable>;
}
