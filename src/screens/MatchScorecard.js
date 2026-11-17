import React from 'react';
import { Pressable, ScrollView, Text, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { getTeam } from '../data/mockData';
import { TeamMark } from '../components/UI';

const colors = { ink: '#253129', muted: '#78857C', line: '#EDF0ED', green: '#187B62' };

function BattingCard({ innings }) {
  const batters = innings.battingCard?.length ? innings.battingCard : innings.batters || [];
  return <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginTop: 10 }}>
    <View style={{ padding: 13, backgroundColor: '#F3F6F3' }}><Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>Batting</Text></View>
    <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FAFBF9' }}><Text style={{ flex: 1, color: colors.muted, fontSize: 9, fontWeight: '800' }}>BATTER</Text>{['R', 'B', '4s', '6s', 'SR'].map((label) => <Text key={label} style={{ width: 34, textAlign: 'right', color: colors.muted, fontSize: 9, fontWeight: '800' }}>{label}</Text>)}</View>
    {batters.length ? batters.map((batter) => <View key={batter.name} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: 1, borderColor: '#F0F2F0' }}><View style={{ flex: 1, paddingRight: 5 }}><Text numberOfLines={1} style={{ color: colors.ink, fontSize: 10, fontWeight: '700' }}>{batter.name}</Text><Text numberOfLines={1} style={{ color: batter.dismissed ? '#C6533C' : colors.muted, fontSize: 8, marginTop: 3, fontWeight: batter.dismissed ? '600' : '400' }}>{batter.dismissed === true ? (batter.howOut || 'Out') : batter.dismissed === false ? 'Not out' : 'Status unavailable'}</Text></View>{[batter.runs ?? 0, batter.balls ?? 0, batter.fours ?? '-', batter.sixes ?? '-', batter.balls ? ((batter.runs || 0) * 100 / batter.balls).toFixed(1) : '0.0'].map((value, index) => <Text key={index} style={{ width: 34, textAlign: 'right', color: index === 0 ? colors.ink : '#68756C', fontSize: 9, fontWeight: index === 0 ? '800' : '500' }}>{value}</Text>)}</View>) : <Text style={{ padding: 14, color: colors.muted, fontSize: 10 }}>Player-by-player batting figures were not recorded for this older match.</Text>}
  </View>;
}

function BowlingCard({ innings }) {
  const bowlers = innings.bowlingStats || {};
  const rows = Object.entries(bowlers);
  return <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginTop: 10, marginBottom: 18 }}>
    <View style={{ padding: 13, backgroundColor: '#F3F6F3' }}><Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>Bowling</Text></View>
    <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FAFBF9' }}><Text style={{ flex: 1, color: colors.muted, fontSize: 9, fontWeight: '800' }}>BOWLER</Text>{['O', 'R', 'W', 'ECON'].map((label) => <Text key={label} style={{ width: 39, textAlign: 'right', color: colors.muted, fontSize: 9, fontWeight: '800' }}>{label}</Text>)}</View>
    {rows.length ? rows.map(([name, stats]) => { const legalBalls = stats.legalBalls || 0; return <View key={name} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderColor: '#F0F2F0' }}><Text numberOfLines={1} style={{ flex: 1, color: colors.ink, fontSize: 10, fontWeight: '700' }}>{name}</Text>{[`${Math.floor(legalBalls / 6)}.${legalBalls % 6}`, stats.runs || 0, stats.wickets || 0, legalBalls ? ((stats.runs || 0) * 6 / legalBalls).toFixed(1) : '0.0'].map((value, index) => <Text key={index} style={{ width: 39, textAlign: 'right', color: index === 2 ? colors.ink : '#68756C', fontSize: 9, fontWeight: index === 2 ? '800' : '500' }}>{value}</Text>)}</View>; }) : <Text style={{ padding: 14, color: colors.muted, fontSize: 10 }}>Bowling figures were not recorded for this older match.</Text>}
  </View>;
}

function Innings({ innings, team }) {
  const scoreText = (innings.wickets === '' || innings.wickets === undefined || String(innings.score).includes('/')) ? `${innings.score}` : `${innings.score}/${innings.wickets}`;
  return <View style={{ marginTop: 18 }}><View style={{ flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 17, backgroundColor: '#103C2E' }}><TeamMark team={team} size={38} /><View style={{ flex: 1, marginLeft: 10 }}><Text style={{ color: '#D6E4DC', fontSize: 10, fontWeight: '700' }}>{innings.label}</Text><Text style={{ color: 'white', fontSize: 13, fontWeight: '800', marginTop: 4 }}>{innings.team}</Text></View><View style={{ alignItems: 'flex-end' }}><Text style={{ color: 'white', fontSize: 21, fontWeight: '900' }}>{scoreText}</Text><Text style={{ color: '#B6C9C0', fontSize: 9, marginTop: 2 }}>{innings.overs || 'Overs unavailable'} overs</Text></View></View><BattingCard innings={innings} /><BowlingCard innings={innings} /></View>;
}

export default function MatchScorecard({ match, onBack }) {
  const upcoming = match.status === 'UPCOMING';
  const initialFirstTeam = match.inningsNumber === 2 ? match.away : match.home;
  const initialSecondTeam = match.home;
  const innings = match.firstInnings && match.inningsNumber === 2 ? [
    { label: '1ST INNINGS', team: match.firstInnings.team, score: match.firstInnings.score, wickets: match.firstInnings.wickets, overs: match.firstInnings.overs, battingCard: match.firstInnings.battingCard, batters: match.firstInnings.batters, bowlingStats: match.firstInnings.bowlingStats },
    { label: '2ND INNINGS', team: match.home.name || match.home, score: match.score, wickets: match.wickets, overs: match.overs, battingCard: match.battingCard, batters: match.batters, bowlingStats: match.bowlingStats },
  ] : match.homeScore || match.awayScore ? [
    { label: 'HOME TEAM', team: match.home?.name || match.home, score: match.homeScore || '-', wickets: match.homeWickets ?? '', overs: match.homeOvers },
    { label: 'AWAY TEAM', team: match.away?.name || match.away, score: match.awayScore || '-', wickets: match.awayWickets ?? '', overs: match.awayOvers },
  ] : [{ label: 'MATCH SCORE', team: match.home?.name || match.home, score: match.score || '-', wickets: match.wickets ?? '', overs: match.overs, battingCard: match.battingCard, batters: match.batters, bowlingStats: match.bowlingStats }];
  return <View style={{ flex: 1, backgroundColor: '#F8F9F6' }}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}><Pressable onPress={onBack} style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Ionicons name="arrow-back" size={18} color={colors.ink} /></Pressable><View style={{ flex: 1 }}><Text style={{ color: colors.ink, fontSize: 20, fontWeight: '900' }}>{upcoming ? 'Match details' : 'Match scorecard'}</Text><Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>{match.home?.name || match.home} vs {match.away?.name || match.away}</Text></View></View><View style={{ padding: 16, borderRadius: 18, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line }}><Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>{upcoming ? match.time || 'Match has not started' : match.result || 'Match details'}</Text>{upcoming && <Text style={{ color: colors.muted, fontSize: 10, marginTop: 8 }}>Scorecard details will appear here after the match begins.</Text>}{match.playerOfMatch && <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}><Ionicons name="trophy" size={15} color="#B68236" /><Text style={{ marginLeft: 7, color: colors.muted, fontSize: 10 }}>Player of the Match</Text><Text style={{ flex: 1, textAlign: 'right', color: colors.ink, fontSize: 10, fontWeight: '800' }}>{match.playerOfMatch}</Text></View>}</View>{!upcoming && innings.map((item, index) => { const team = index === 0 ? initialFirstTeam : initialSecondTeam; return <Innings key={`${item.label}-${index}`} innings={item} team={getTeam(team)} />; })}</ScrollView></View>;
}
