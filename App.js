import React, { useEffect, useState } from 'react';
import './global.css';
import { ActivityIndicator, Alert, Modal, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from './src/theme/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Dashboard from './src/screens/PersonalDashboard';
import Matches from './src/screens/Matches';
import Teams from './src/screens/Teams';
import LiveMatch from './src/screens/LiveMatch';
import MatchScorecard from './src/screens/MatchScorecard';
import { ThemeProvider, useTheme } from './src/theme/context';
import Auth from './src/screens/Auth';
import CreateMatchWizard from './src/screens/CreateMatchWizard';
import { matches as initialMatches, teams } from './src/data/mockData';

const tabs = [
  { name: 'Home', icon: 'grid-outline', active: 'grid' },
  { name: 'Matches', icon: 'calendar-outline', active: 'calendar' },
  { name: 'Teams', icon: 'people-outline', active: 'people' },
  { name: 'Profile', icon: 'person-outline', active: 'person' },
];

function CreateMatchModal({ visible, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('T20');
  const [home, setHome] = useState(teams[0].id);
  const [away, setAway] = useState(teams[1].id);
  const submit = () => {
    if (home === away) { Alert.alert('Choose two teams', 'A match needs two different teams.'); return; }
    onCreate({ title, format, home, away });
    setTitle(''); onClose();
  };
  return <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: '#111B1680', justifyContent: 'flex-end' }}><View style={{ backgroundColor: '#F8F9F6', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 22, paddingBottom: 28 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 19 }}><View><Text style={{ color: '#17221D', fontSize: 21, fontWeight: '800' }}>New match</Text><Text style={{ color: '#87928A', fontSize: 11, marginTop: 4 }}>Set up your next fixture</Text></View><Pressable onPress={onClose} style={{ width: 34, height: 34, borderRadius: 13, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={19} color="#526057" /></Pressable></View>
    <Text style={label}>MATCH NAME <Text style={{ color: '#9BA49E' }}> -  OPTIONAL</Text></Text><TextInput value={title} onChangeText={setTitle} placeholder="e.g. Sunday league opener" placeholderTextColor="#A3ACA6" style={input} />
    <Text style={label}>FORMAT</Text><View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>{['T10', 'T20', 'ODI', 'TEST'].map((item) => <Pressable onPress={() => setFormat(item)} key={item} style={{ flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: format === item ? '#E2EFE8' : 'white', borderWidth: 1, borderColor: format === item ? '#187B62' : '#E7ECE7', alignItems: 'center' }}><Text style={{ color: format === item ? '#187B62' : '#536057', fontSize: 11, fontWeight: '800' }}>{item}</Text></Pressable>)}</View>
    <Text style={label}>HOME TEAM</Text><View style={chips}>{teams.map((team) => <Pressable key={team.id} onPress={() => setHome(team.id)} style={[chip, home === team.id && activeChip]}><Text style={[chipText, home === team.id && activeChipText]}>{team.short}  -  {team.name}</Text></Pressable>)}</View>
    <Text style={[label, { marginTop: 15 }]}>AWAY TEAM</Text><View style={chips}>{teams.map((team) => <Pressable key={team.id} onPress={() => setAway(team.id)} style={[chip, away === team.id && activeChip]}><Text style={[chipText, away === team.id && activeChipText]}>{team.short}  -  {team.name}</Text></Pressable>)}</View>
    <Pressable onPress={submit} style={{ backgroundColor: '#187B62', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 22 }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>Create match</Text></Pressable>
  </View></View></Modal>;
}
const label = { color: '#738078', fontSize: 9, fontWeight: '800', letterSpacing: .8, marginBottom: 8 };
const input = { backgroundColor: 'white', borderWidth: 1, borderColor: '#E7ECE7', borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12, color: '#26332C', fontSize: 13, marginBottom: 17 };
const chips = { flexDirection: 'row', flexWrap: 'wrap', gap: 7 };
const chip = { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', borderWidth: 1, borderColor: '#E7ECE7' };
const activeChip = { backgroundColor: '#E2EFE8', borderColor: '#187B62' };
const chipText = { fontSize: 10, fontWeight: '700', color: '#647068' };
const activeChipText = { color: '#187B62' };

function Profile({ onSignOut, mode, onToggleTheme }) {
  return <ScrollView contentContainerStyle={{ padding: 20 }}><Text style={{ fontSize: 25, fontWeight: '800', color: '#17221D' }}>Profile</Text><Text style={{ color: '#818C84', fontSize: 12, marginTop: 5, marginBottom: 22 }}>Your account & preferences</Text><View style={{ backgroundColor: 'white', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#EDF0ED' }}><View style={{ width: 70, height: 70, borderRadius: 24, backgroundColor: '#E5F0EB', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#187B62', fontWeight: '800', fontSize: 24 }}>RP</Text></View><Text style={{ color: '#1B2921', fontSize: 17, fontWeight: '800', marginTop: 12 }}>Rahul Patel</Text><Text style={{ color: '#849087', fontSize: 11, marginTop: 4 }}>rahul.patel@example.com</Text><View style={{ backgroundColor: '#EAF4EF', borderRadius: 20, paddingHorizontal: 11, paddingVertical: 6, marginTop: 11 }}><Text style={{ color: '#187B62', fontWeight: '800', fontSize: 9, letterSpacing: .6 }}>CLUB ADMIN</Text></View></View><View style={{ backgroundColor: 'white', borderRadius: 18, paddingHorizontal: 15, marginTop: 18, borderWidth: 1, borderColor: '#EDF0ED' }}>{[['person-outline', 'Edit profile'], ['notifications-outline', 'Notifications'], ['moon-outline', 'Appearance'], ['help-circle-outline', 'Help & support'], ['log-out-outline', 'Sign out']].map(([icon, title], i) => <Pressable key={title} onPress={title === 'Sign out' ? onSignOut : title === 'Appearance' ? onToggleTheme : undefined} style={{ height: 53, flexDirection: 'row', alignItems: 'center', borderBottomWidth: i < 4 ? 1 : 0, borderColor: '#F0F2F0' }}><Ionicons name={icon} size={18} color={title === 'Sign out' ? '#BB5942' : '#718078'} /><Text style={{ flex: 1, marginLeft: 12, color: title === 'Sign out' ? '#BB5942' : '#344239', fontSize: 12, fontWeight: '600' }}>{title === 'Appearance' ? `Appearance: ${mode === 'dark' ? 'Dark' : 'Light'} mode` : title}</Text>{title === 'Appearance' ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Text style={{ color: '#187B62', fontSize: 9, fontWeight: '800' }}>{mode === 'dark' ? 'DARK' : 'LIGHT'}</Text><Ionicons name={mode === 'dark' ? 'moon' : 'sunny'} size={15} color={mode === 'dark' ? '#8FCFB2' : '#B68236'} /></View> : <Ionicons name="chevron-forward" size={15} color="#A5AEA8" />}</Pressable>)}</View><Text style={{ color: '#A6AEA8', fontSize: 10, textAlign: 'center', marginTop: 20 }}>PITCH  -  VERSION 1.0.0</Text></ScrollView>;
}

function AppContent() {
  const { mode, toggleMode } = useTheme();
  const [tab, setTab] = useState('Home');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [createVisible, setCreateVisible] = useState(false);
  const [scoreMatches, setScoreMatches] = useState(() => initialMatches.filter((match) => match.status !== 'LIVE'));
  const [isHydrated, setIsHydrated] = useState(false);
  const [undoHistory, setUndoHistory] = useState([]);
  const [toast, setToast] = useState('');
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('pitch-cricket-matches-v1').then((stored) => {
      if (stored) {
        const savedMatches = JSON.parse(stored);
        if (Array.isArray(savedMatches)) setScoreMatches(savedMatches);
      }
    }).catch(() => {}).finally(() => setIsHydrated(true));
  }, []);
  useEffect(() => {
    if (isHydrated) AsyncStorage.setItem('pitch-cricket-matches-v1', JSON.stringify(scoreMatches)).catch(() => {});
  }, [isHydrated, scoreMatches]);
  const openMatch = (match) => { const current = scoreMatches.find((item) => item.id === match.id) || match; setSelectedMatch(current); };
  const updateScore = (event) => {
    if (event === 'undo') {
      const previous = undoHistory[undoHistory.length - 1];
      if (!previous) { setToast('Nothing to undo yet'); setTimeout(() => setToast(''), 1800); return; }
      setScoreMatches((all) => all.map((item) => item.id === previous.id ? previous : item));
      setSelectedMatch(previous); setUndoHistory((all) => all.slice(0, -1)); return;
    }
    const item = selectedMatch;
    if (item.status !== 'LIVE') return;
    const out = event === 'Wicket';
    const extra = ['Wide', 'No ball'].includes(event);
    const runs = typeof event === 'number' ? event : event === 'Bye' || event === 'Leg bye' ? 1 : extra ? 1 : 0;
    const ballLabel = out ? 'W' : event === 'Wide' ? 'Wd' : event === 'No ball' ? 'Nb' : typeof event === 'number' ? `${event}` : event === 'Bye' ? 'B' : 'Lb';
    const legalDelivery = !extra;
    const [completedOvers, ballsInOver] = item.overs.split('.').map(Number);
    const totalBalls = completedOvers * 6 + ballsInOver + (legalDelivery ? 1 : 0);
    const overText = `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
    let batters = [...item.batters];
    let strikerIndex = Math.max(0, batters.findIndex((batter) => batter.onStrike));
    const batterRuns = typeof event === 'number' && !out ? event : 0;
    const dismissedName = out ? batters[strikerIndex].name : null;
    const battingCard = [...(item.battingCard || item.batters.map((batter) => ({ ...batter, fours: batter.fours || 0, sixes: batter.sixes || 0 })))];
    let cardIndex = battingCard.findIndex((batter) => batter.name === batters[strikerIndex].name);
    if (cardIndex < 0) { cardIndex = battingCard.length; battingCard.push({ name: batters[strikerIndex].name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }); }
    battingCard[cardIndex] = { ...battingCard[cardIndex], runs: (battingCard[cardIndex].runs || 0) + batterRuns, balls: (battingCard[cardIndex].balls || 0) + (legalDelivery ? 1 : 0), fours: (battingCard[cardIndex].fours || 0) + (batterRuns === 4 ? 1 : 0), sixes: (battingCard[cardIndex].sixes || 0) + (batterRuns === 6 ? 1 : 0), dismissed: out || battingCard[cardIndex].dismissed };
    if (out) batters[strikerIndex] = { ...batters[strikerIndex], dismissed: true, onStrike: false, balls: batters[strikerIndex].balls + (legalDelivery ? 1 : 0) };
    else {
      batters[strikerIndex] = { ...batters[strikerIndex], runs: batters[strikerIndex].runs + batterRuns, balls: batters[strikerIndex].balls + (legalDelivery ? 1 : 0) };
    }
    const strikeRuns = typeof event === 'number' ? event : event === 'Bye' || event === 'Leg bye' ? 1 : 0;
    if (!out && (strikeRuns % 2 === 1 || (legalDelivery && totalBalls % 6 === 0)) && batters.length > 1) batters = batters.map((batter) => ({ ...batter, onStrike: !batter.onStrike }));
    const oldBowler = item.bowler;
    const [oldBowlerOvers, oldBowlerBallsInOver] = oldBowler.overs.split('.').map(Number);
    const bowlerBalls = (oldBowler.legalBalls ?? oldBowlerOvers * 6 + oldBowlerBallsInOver) + (legalDelivery ? 1 : 0);
    const bowlerRuns = typeof event === 'number' ? event : extra ? 1 : 0;
    const bowlingStats = { ...(item.bowlingStats || {}), [oldBowler.name]: { runs: oldBowler.runs + bowlerRuns, wickets: oldBowler.wickets + (out ? 1 : 0), legalBalls: bowlerBalls } };
    const overNumber = completedOvers + 1;
    const overHistory = [...(item.overHistory || [])];
    let currentOverIndex = overHistory.findIndex((over) => over.over === overNumber);
    if (currentOverIndex < 0) {
      currentOverIndex = overHistory.length;
      overHistory.push({ over: overNumber, runs: 0, wickets: 0, balls: [], bowler: oldBowler.name, complete: false });
    }
    const currentOver = overHistory[currentOverIndex];
    overHistory[currentOverIndex] = { ...currentOver, runs: currentOver.runs + runs, wickets: currentOver.wickets + (out ? 1 : 0), balls: [...currentOver.balls, { label: ballLabel, runs, legal: legalDelivery, wicket: out }], bowler: oldBowler.name, complete: legalDelivery && totalBalls % 6 === 0 };
    const overComplete = legalDelivery && totalBalls > 0 && totalBalls % 6 === 0;
    const nextBowlerName = oldBowler.name;
    const bowlerStats = bowlingStats[nextBowlerName] || { runs: 0, wickets: 0, legalBalls: 0 };
    const nextBatterIndex = item.nextBatterIndex ?? 2;
    const availableBatters = item.battingPlayers?.filter((name) => !(item.dismissedPlayers || []).includes(name) && !item.batters.some((batter) => batter.name === name));
    const nextBatterName = availableBatters?.[0];
    const allOut = Boolean(out && item.battingPlayers && item.wickets + 1 >= item.battingPlayers.length - 1);
    const oversComplete = Boolean(item.totalOvers && totalBalls >= item.totalOvers * 6);
    const inningComplete = oversComplete || allOut;
    const inningsBreak = Boolean(inningComplete && (item.inningsNumber || 1) === 1);
    const targetReached = Boolean((item.inningsNumber || 1) === 2 && item.target && item.score + runs >= item.target);
    const matchComplete = Boolean((item.inningsNumber || 1) === 2 && (targetReached || inningComplete));
    const completed = inningsBreak || matchComplete;
    const pendingBatterSelection = Boolean(out && nextBatterName && !completed);
    const pendingBowlerSelection = Boolean(overComplete && item.bowlingPlayers?.length > 1 && !completed);
    const finalScore = item.score + runs;
    const finalWickets = item.wickets + (out ? 1 : 0);
    const result = inningsBreak ? 'First innings complete' : matchComplete ? targetReached ? `${item.home.name} won by ${Math.max(1, item.battingPlayers.length - finalWickets - 1)} wickets` : finalScore === item.target - 1 ? 'Match tied' : `${item.away.name} won by ${Math.max(0, item.target - 1 - finalScore)} runs` : item.result;
    const firstInnings = inningsBreak ? { team: item.home.name, score: finalScore, wickets: finalWickets, overs: overText, totalOvers: item.totalOvers, batters, battingCard, overHistory, bowlingStats, bowler: { ...item.bowler } } : item.firstInnings;
    const next = { ...item, status: inningsBreak ? 'INNINGS_BREAK' : matchComplete ? 'AWAITING_END' : item.status, result, target: inningsBreak ? finalScore + 1 : item.target, firstInnings, score: finalScore, wickets: finalWickets, overs: overText, lastBalls: [...item.lastBalls, ballLabel].slice(-6), overHistory, batters, battingCard, nextBatterIndex, dismissedPlayers: out ? [...(item.dismissedPlayers || []), dismissedName] : item.dismissedPlayers || [], pendingBatterSelection, pendingBatterIndex: pendingBatterSelection ? strikerIndex : null, pendingBatterOnStrike: pendingBatterSelection ? !overComplete : null, pendingBowlerSelection, bowlingStats, bowler: { name: nextBowlerName, runs: bowlerStats.runs, wickets: bowlerStats.wickets, legalBalls: bowlerStats.legalBalls, overs: `${Math.floor(bowlerStats.legalBalls / 6)}.${bowlerStats.legalBalls % 6}` } };
    setUndoHistory((history) => [...history, item]);
    setSelectedMatch(next);
    setScoreMatches((all) => all.map((entry) => entry.id === item.id ? next : entry));
  };
  const createMatch = ({ title, format, home, away }) => {
    const newMatch = { id: `m${Date.now()}`, name: title || 'New fixture', status: 'UPCOMING', format, venue: 'Venue to be confirmed', home, away, time: 'UPCOMING  -  SCHEDULE TO BE SET' };
    setScoreMatches((all) => [newMatch, ...all]); setTab('Matches');
  };
  const startMatch = ({ team1Name, team2Name, overs, battingFirst, players1, players2, striker, nonStriker, bowler }) => {
    const suffix = Date.now();
    const team1 = { id: `custom-${suffix}-1`, name: team1Name, short: team1Name.slice(0, 2).toUpperCase(), color: '#187B62' };
    const team2 = { id: `custom-${suffix}-2`, name: team2Name, short: team2Name.slice(0, 2).toUpperCase(), color: '#C66A3F' };
    const battingTeam = battingFirst === 1 ? team1 : team2;
    const bowlingTeam = battingFirst === 1 ? team2 : team1;
    const battingPlayers = battingFirst === 1 ? players1 : players2;
    const bowlingPlayers = battingFirst === 1 ? players2 : players1;
    const newMatch = { id: `match-${suffix}`, name: `${team1Name} vs ${team2Name}`, status: 'LIVE', inningsNumber: 1, format: `T${overs}`, venue: 'Friendly match', home: battingTeam, away: bowlingTeam, innings: `${battingTeam.name} 1st innings`, score: 0, wickets: 0, overs: '0.0', totalOvers: overs, target: null, batters: [{ name: striker, runs: 0, balls: 0, onStrike: true }, { name: nonStriker, runs: 0, balls: 0, onStrike: false }], battingCard: [{ name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }, { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }], battingPlayers, bowlingPlayers, nextBatterIndex: 2, dismissedPlayers: [], pendingBatterSelection: false, pendingBowlerSelection: false, bowler: { name: bowler, overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 }, bowlingStats: {}, lastBalls: [], overHistory: [] };
    setScoreMatches((all) => [newMatch, ...all]);
    setUndoHistory([]);
    setCreateVisible(false);
    setSelectedMatch(newMatch);
  };
  const selectNextBatter = (name) => {
    const item = selectedMatch;
    if (!item?.pendingBatterSelection || !item.battingPlayers.includes(name)) return;
    const usedNames = [...(item.dismissedPlayers || []), ...item.batters.map((batter) => batter.name)];
    if (usedNames.includes(name)) return;
    const batters = item.batters.map((batter, index) => index === item.pendingBatterIndex ? { name, runs: 0, balls: 0, onStrike: item.pendingBatterOnStrike !== false } : { ...batter, onStrike: item.pendingBatterOnStrike === false });
    const battingCard = [...(item.battingCard || [])];
    if (!battingCard.some((batter) => batter.name === name)) battingCard.push({ name, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false });
    const next = { ...item, batters, battingCard, pendingBatterSelection: false, pendingBatterIndex: null, pendingBatterOnStrike: null };
    setSelectedMatch(next);
    setScoreMatches((all) => all.map((entry) => entry.id === item.id ? next : entry));
  };
  const selectNextBowler = (name) => {
    const item = selectedMatch;
    if (!item?.pendingBowlerSelection || !item.bowlingPlayers.includes(name) || name === item.bowler.name) return;
    const stats = item.bowlingStats[name] || { runs: 0, wickets: 0, legalBalls: 0 };
    const next = { ...item, bowler: { name, ...stats, overs: `${Math.floor(stats.legalBalls / 6)}.${stats.legalBalls % 6}` }, pendingBowlerSelection: false };
    setSelectedMatch(next);
    setScoreMatches((all) => all.map((entry) => entry.id === item.id ? next : entry));
  };
  const startSecondInnings = ({ striker, nonStriker, bowler }) => {
    const item = selectedMatch;
    if (!item || item.status !== 'INNINGS_BREAK') return;
    // Innings two swaps the teams' batting and bowling roles. Keep those role
    // lists in sync with the selected opening pair so future wicket prompts
    // and scorecard updates use the chasing team's squad.
    const battingPlayers = item.bowlingPlayers || [];
    const bowlingPlayers = item.battingPlayers || [];
    if (!battingPlayers.includes(striker) || !battingPlayers.includes(nonStriker) || striker === nonStriker || !bowlingPlayers.includes(bowler)) {
      setToast('Choose batters and a bowler from the correct teams');
      setTimeout(() => setToast(''), 2200);
      return;
    }
    const next = { ...item, status: 'LIVE', inningsNumber: 2, innings: `${item.away.name} 2nd innings`, home: item.away, away: item.home, battingPlayers, bowlingPlayers, score: 0, wickets: 0, overs: '0.0', target: item.firstInnings.score + 1, result: null, batters: [{ name: striker, runs: 0, balls: 0, onStrike: true }, { name: nonStriker, runs: 0, balls: 0, onStrike: false }], battingCard: [{ name: striker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }, { name: nonStriker, runs: 0, balls: 0, fours: 0, sixes: 0, dismissed: false }], nextBatterIndex: 2, dismissedPlayers: [], pendingBatterSelection: false, pendingBowlerSelection: false, pendingBatterIndex: null, pendingBatterOnStrike: null, bowler: { name: bowler, overs: '0.0', runs: 0, wickets: 0, legalBalls: 0 }, bowlingStats: {}, lastBalls: [], overHistory: [] };
    setUndoHistory([]);
    setSelectedMatch(next);
    setScoreMatches((all) => all.map((entry) => entry.id === item.id ? next : entry));
  };
  const endMatch = (playerOfMatch) => {
    const item = selectedMatch;
    if (!item || item.status !== 'AWAITING_END') return;
    const next = { ...item, status: 'COMPLETED', playerOfMatch, completedAt: new Date().toISOString() };
    setScoreMatches((all) => all.map((entry) => entry.id === item.id ? next : entry));
    setSelectedMatch(null);
    setTab('Home');
  };  const openLiveScore = () => {
    const live = scoreMatches.find((match) => match.status === 'LIVE' || match.status === 'INNINGS_BREAK' || match.status === 'AWAITING_END');
    if (live) openMatch(live);
    else Alert.alert('No live match', 'Start a new match to begin scoring.');
  };
  const goTab = (name) => { setSelectedMatch(null); setTab(name); };

  if (!isHydrated) return <SafeAreaView className="flex-1" style={{ width: '100%', alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', backgroundColor: mode === 'dark' ? '#111814' : '#F8F9F6' }}><ActivityIndicator color="#187B62" /></SafeAreaView>;
  if (!signedIn) return <SafeAreaView className="flex-1" style={{ width: '100%', alignSelf: 'stretch', backgroundColor: mode === 'dark' ? '#111814' : '#F8F9F6' }}><StatusBar barStyle="dark-content" backgroundColor={mode === 'dark' ? '#111814' : '#F8F9F6'} /><Auth onSuccess={() => setSignedIn(true)} /></SafeAreaView>;
  if (createVisible) return <SafeAreaView className="flex-1" style={{ width: '100%', alignSelf: 'stretch', backgroundColor: mode === 'dark' ? '#111814' : '#F8F9F6' }}><StatusBar barStyle="dark-content" backgroundColor={mode === 'dark' ? '#111814' : '#F8F9F6'} /><CreateMatchWizard onClose={() => setCreateVisible(false)} onStart={startMatch} /></SafeAreaView>;
  return <SafeAreaView className="flex-1" style={{ width: '100%', alignSelf: 'stretch', backgroundColor: mode === 'dark' ? '#111814' : '#F8F9F6' }}><StatusBar barStyle="dark-content" backgroundColor={mode === 'dark' ? '#111814' : '#F8F9F6'} />
    {!selectedMatch ? <><View style={{ height: 57, paddingHorizontal: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><View style={{ height: 31, width: 31, borderRadius: 11, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center', marginRight: 9 }}><Ionicons name="radio-button-on" size={17} color="white" /></View><Text style={{ color: '#18362B', fontSize: 20, fontWeight: '900', letterSpacing: -.7 }}>pitch<Text style={{ color: '#187B62' }}>.</Text></Text></View><Pressable onPress={() => setTab('Profile')} style={{ width: 36, height: 36, borderRadius: 14, backgroundColor: '#E8F0EA', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '800' }}>RP</Text><View style={{ position: 'absolute', right: -1, top: -1, width: 9, height: 9, backgroundColor: '#D96B50', borderRadius: 5, borderWidth: 1.5, borderColor: '#F8F9F6' }} /></Pressable></View>
      <View style={{ flex: 1 }}>{tab === 'Home' ? <Dashboard matches={scoreMatches} onOpenMatch={openMatch} onCreateMatch={() => setCreateVisible(true)} onLiveScore={openLiveScore} onNavigate={goTab} /> : tab === 'Matches' ? <Matches matches={scoreMatches} onOpenMatch={openMatch} onCreateMatch={() => setCreateVisible(true)} /> : tab === 'Teams' ? <Teams /> : <Profile mode={mode} onToggleTheme={toggleMode} onSignOut={() => setSignedIn(false)} />}</View>
      <View style={{ flexDirection: 'row', backgroundColor: 'white', paddingTop: 8, paddingBottom: 5, borderTopWidth: 1, borderTopColor: '#ECEFEC' }}>{tabs.map((item) => { const active = tab === item.name; return <Pressable onPress={() => goTab(item.name)} key={item.name} style={{ flex: 1, alignItems: 'center', paddingVertical: 3 }}><Ionicons name={active ? item.active : item.icon} size={20} color={active ? '#187B62' : '#909B93'} /><Text style={{ color: active ? '#187B62' : '#909B93', fontSize: 9, fontWeight: active ? '800' : '600', marginTop: 3 }}>{item.name}</Text>{active && <View style={{ width: 4, height: 4, borderRadius: 3, backgroundColor: '#187B62', marginTop: 3 }} />}</Pressable>; })}</View></> : <View style={{ flex: 1 }}>{selectedMatch.status === 'COMPLETED' || selectedMatch.status === 'UPCOMING' ? <MatchScorecard match={selectedMatch} onBack={() => setSelectedMatch(null)} /> : <LiveMatch match={selectedMatch} onBack={() => setSelectedMatch(null)} onUpdate={updateScore} onSelectBatter={selectNextBatter} onSelectBowler={selectNextBowler} onStartSecondInnings={startSecondInnings} onEndMatch={endMatch} />}</View>}
    {toast ? <View style={{ position: 'absolute', bottom: 90, alignSelf: 'center', backgroundColor: '#24352C', paddingHorizontal: 17, paddingVertical: 11, borderRadius: 20 }}><Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>{toast}</Text></View> : null}
  </SafeAreaView>;
}

export default function App() { return <ThemeProvider><AppContent /></ThemeProvider>; }
