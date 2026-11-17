import React from 'react';
import { Pressable, ScrollView, Text, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { matches as initialMatches, getTeam } from '../data/mockData';
import { Pill, SectionTitle, TeamMark } from '../components/UI';

function MatchRow({ match, onPress }) {
  const home = getTeam(match.home); const away = getTeam(match.away);
  const live = match.status === 'LIVE';
  return <Pressable onPress={() => onPress(match)} style={{ padding: 16, borderRadius: 18, backgroundColor: 'white', marginBottom: 11, borderWidth: 1, borderColor: '#EDF0ED' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Pill color={live ? '#C74F38' : match.status === 'UPCOMING' ? '#A16A21' : '#647068'} bg={live ? '#FCECE8' : match.status === 'UPCOMING' ? '#FBF2E3' : '#EFF2F0'}>{match.status}</Pill><Text style={{ color: '#929C95', fontSize: 10, fontWeight: '700' }}>{match.format}</Text></View>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}><TeamMark team={home} size={36} /><View style={{ flex: 1, marginLeft: 9 }}><Text style={{ color: '#26332C', fontSize: 13, fontWeight: '700' }}>{home.name}</Text><Text style={{ color: '#818C84', fontSize: 11, marginTop: 3 }}>{live ? `${match.score}/${match.wickets}  (${match.overs})` : match.homeScore || match.time}</Text></View><View style={{ alignItems: 'center', paddingHorizontal: 9 }}><Text style={{ color: '#A3ACA6', fontSize: 10, fontWeight: '800' }}>VS</Text></View><View style={{ flex: 1, alignItems: 'flex-end', marginRight: 9 }}><Text style={{ color: '#26332C', fontSize: 13, fontWeight: '700' }}>{away.name}</Text><Text style={{ color: '#818C84', fontSize: 11, marginTop: 3 }}>{live ? 'Bowling' : match.awayScore || (match.status === 'UPCOMING' ? 'Upcoming' : '-')}</Text></View><TeamMark team={away} size={36} /></View>
    {match.result ? <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '600', marginTop: 12 }}>{match.result}</Text> : live ? <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 13 }}><View style={{ width: 6, height: 6, backgroundColor: '#D05E44', borderRadius: 4, marginRight: 6 }} /><Text style={{ color: '#B7533B', fontSize: 10, fontWeight: '700' }}>LIVE  -  {match.venue}</Text></View> : <Text style={{ color: '#929C95', fontSize: 10, marginTop: 12 }}>{match.venue}</Text>}
  </Pressable>;
}

export default function Matches({ matches = initialMatches, onOpenMatch, onCreateMatch }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 22 }}><View><Text style={{ fontSize: 25, fontWeight: '800', color: '#17221D' }}>Matches</Text><Text style={{ color: '#818C84', fontSize: 12, marginTop: 5 }}>Tap a completed match to view its scorecard</Text></View><Pressable onPress={onCreateMatch} style={{ backgroundColor: '#187B62', width: 41, height: 41, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="add" size={23} color="white" /></Pressable></View><SectionTitle title="All fixtures" action={`${matches.length} total`} />{matches.map((match) => <MatchRow key={match.id} match={match} onPress={onOpenMatch} />)}</ScrollView>;
}
