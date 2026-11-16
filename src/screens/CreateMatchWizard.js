import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';

const colors = { green: '#187B62', orange: '#C66A3F', ink: '#17221D', muted: '#829087', line: '#E7ECE7', page: '#F8F9F6' };
const inputStyle = { borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 13, color: colors.ink, backgroundColor: 'white', fontSize: 13 };

function StepProgress({ step }) {
  const labels = ['Teams', 'Players', 'Start'];
  return <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 21, marginBottom: 25 }}>{labels.map((label, i) => <React.Fragment key={label}><View style={{ alignItems: 'center', width: 62 }}><View style={{ width: 29, height: 29, borderRadius: 15, backgroundColor: step >= i + 1 ? colors.green : '#E8ECE8', alignItems: 'center', justifyContent: 'center' }}>{step > i + 1 ? <Ionicons name="checkmark" size={15} color="white" /> : <Text style={{ color: step === i + 1 ? 'white' : '#849087', fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>}</View><Text style={{ color: step === i + 1 ? colors.green : colors.muted, fontSize: 10, fontWeight: step === i + 1 ? '800' : '600', marginTop: 5 }}>{label}</Text></View>{i < 2 && <View style={{ height: 2, backgroundColor: step > i + 1 ? colors.green : '#E8ECE8', flex: 1, marginTop: -14 }} />}</React.Fragment>)}</View>;
}

function FieldLabel({ children }) { return <Text style={{ color: '#728077', fontSize: 10, letterSpacing: .7, fontWeight: '800', marginBottom: 8 }}>{children}</Text>; }
function TeamPanel({ teamName, color, players, value, onChangeText, onAdd, onEditPlayer, onDeletePlayer, editing }) {
  return <View style={{ borderRadius: 17, backgroundColor: 'white', padding: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}><View style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: color, marginRight: 8 }} /><Text style={{ flex: 1, color: colors.ink, fontSize: 13, fontWeight: '800' }}>{teamName}</Text><Text style={{ color: colors.muted, fontSize: 10 }}>{players.length} players</Text></View><View style={{ flexDirection: 'row', gap: 8 }}><TextInput value={value} onChangeText={onChangeText} onSubmitEditing={onAdd} returnKeyType="done" placeholder={editing ? 'Edit player name' : 'Enter player name'} placeholderTextColor="#A4ADA6" style={[inputStyle, { flex: 1, paddingVertical: 11 }]} /><Pressable onPress={onAdd} style={{ width: 43, borderRadius: 13, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={editing ? 'checkmark' : 'add'} color="white" size={21} /></Pressable></View>{players.length > 0 && <View style={{ gap: 7, marginTop: 11 }}>{players.map((player, i) => <View key={`${player}-${i}`} style={{ minHeight: 39, backgroundColor: `${color}10`, borderRadius: 12, paddingLeft: 11, paddingRight: 6, flexDirection: 'row', alignItems: 'center' }}><Text style={{ flex: 1, color, fontSize: 11, fontWeight: '700' }}>{player}</Text><Pressable accessibilityLabel={`Edit ${player}`} onPress={() => onEditPlayer(player)} style={{ padding: 8 }}><Ionicons name="pencil-outline" size={15} color={color} /></Pressable><Pressable accessibilityLabel={`Delete ${player}`} onPress={() => onDeletePlayer(player)} style={{ padding: 8 }}><Ionicons name="trash-outline" size={15} color="#BD5942" /></Pressable></View>)}</View>}</View>;
}

function PlayerChoices({ title, players, selected, onSelect, color, emptyText }) {
  return <View style={{ marginTop: 13, padding: 13, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: selected ? `${color}75` : colors.line }}><FieldLabel>{title}</FieldLabel>{players.length === 0 ? <Text style={{ color: colors.muted, fontSize: 11 }}>{emptyText}</Text> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{players.map((player) => { const active = selected === player; return <Pressable key={player} onPress={() => onSelect(player)} style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 22, backgroundColor: active ? color : 'white', borderWidth: 1, borderColor: active ? color : colors.line }}><Text style={{ color: active ? 'white' : '#425047', fontSize: 11, fontWeight: '700' }}>{player}</Text></Pressable>; })}</View>}</View>;
}

export default function CreateMatchWizard({ onClose, onStart }) {
  const [step, setStep] = useState(1);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [oversChoice, setOversChoice] = useState('2');
  const [customOvers, setCustomOvers] = useState('');
  const [battingFirst, setBattingFirst] = useState(1);
  const [players1, setPlayers1] = useState([]);
  const [players2, setPlayers2] = useState([]);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [editing1, setEditing1] = useState('');
  const [editing2, setEditing2] = useState('');
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');

  const overs = oversChoice === 'custom' ? Number(customOvers) : Number(oversChoice);
  const battingPlayers = battingFirst === 1 ? players1 : players2;
  const bowlingPlayers = battingFirst === 1 ? players2 : players1;
  const battingName = battingFirst === 1 ? team1Name.trim() : team2Name.trim();
  const bowlingName = battingFirst === 1 ? team2Name.trim() : team1Name.trim();
  const battingColor = battingFirst === 1 ? colors.green : colors.orange;
  const bowlingColor = battingFirst === 1 ? colors.orange : colors.green;

  const addPlayer = (team) => {
    const value = (team === 1 ? input1 : input2).trim();
    if (!value) return;
    const roster = team === 1 ? players1 : players2;
    const editing = team === 1 ? editing1 : editing2;
    if (roster.some((name) => name !== editing && name.toLowerCase() === value.toLowerCase())) { Alert.alert('Player already added', 'Use a different name for each player on a team.'); return; }
    if (team === 1) { setPlayers1(editing ? roster.map((name) => name === editing ? value : name) : [...roster, value]); setInput1(''); setEditing1(''); }
    else { setPlayers2(editing ? roster.map((name) => name === editing ? value : name) : [...roster, value]); setInput2(''); setEditing2(''); }
  };
  const editPlayer = (team, player) => { if (team === 1) { setEditing1(player); setInput1(player); } else { setEditing2(player); setInput2(player); } };
  const deletePlayer = (team, player) => { if (team === 1) { setPlayers1((list) => list.filter((name) => name !== player)); if (editing1 === player) { setEditing1(''); setInput1(''); } } else { setPlayers2((list) => list.filter((name) => name !== player)); if (editing2 === player) { setEditing2(''); setInput2(''); } } };
  const next = () => {
    if (step === 1) {
      if (!team1Name.trim() || !team2Name.trim() || team1Name.trim().toLowerCase() === team2Name.trim().toLowerCase()) { Alert.alert('Add two team names', 'Team names must be different.'); return; }
      if (!Number.isInteger(overs) || overs < 1 || overs > 50) { Alert.alert('Check the overs', 'Choose a whole number from 1 to 50 overs.'); return; }
    }
    if (step === 2 && (players1.length < 2 || players2.length < 2)) { Alert.alert('Add players first', 'Add at least two players to each team before continuing.'); return; }
    setStep((current) => Math.min(3, current + 1));
  };
  const start = () => {
    if (battingPlayers.length < 2 || bowlingPlayers.length < 1) { Alert.alert('Add players first', 'Go back and add at least two batting players and one bowler.'); return; }
    if (!battingPlayers.includes(striker) || !battingPlayers.includes(nonStriker) || !bowlingPlayers.includes(bowler) || striker === nonStriker) { Alert.alert('Finish the line-up', 'Choose two different batters and an opening bowler from the selected teams.'); return; }
    onStart({ team1Name: team1Name.trim(), team2Name: team2Name.trim(), overs, battingFirst, players1, players2, striker, nonStriker, bowler });
  };

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><View style={{ height: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ECEFEC', backgroundColor: 'white' }}><Pressable onPress={step === 1 ? onClose : () => setStep(step - 1)} style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: '#F1F4F0', alignItems: 'center', justifyContent: 'center' }}><Ionicons name={step === 1 ? 'close' : 'arrow-back'} size={18} color="#35443B" /></Pressable><Text style={{ color: colors.ink, fontSize: 14, fontWeight: '800' }}>Create a match</Text><View style={{ width: 36 }} /></View>
    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 3, paddingBottom: 30 }}><StepProgress step={step} />
      {step === 1 && <><Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Set up your match</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 22 }}>Name the teams and choose your overs.</Text><FieldLabel>TEAM 1</FieldLabel><TextInput value={team1Name} onChangeText={setTeam1Name} placeholder="Team 1" style={[inputStyle, { marginBottom: 17 }]} /><FieldLabel>TEAM 2</FieldLabel><TextInput value={team2Name} onChangeText={setTeam2Name} placeholder="Team 2" style={[inputStyle, { marginBottom: 21 }]} /><FieldLabel>OVERS PER INNINGS</FieldLabel><View style={{ flexDirection: 'row', gap: 9, marginBottom: 13 }}>{['2', '3', '4', 'custom'].map((option) => { const active = oversChoice === option; return <Pressable key={option} onPress={() => setOversChoice(option)} style={{ flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center', backgroundColor: active ? '#E6F1EB' : 'white', borderWidth: 1, borderColor: active ? colors.green : colors.line }}><Text style={{ color: active ? colors.green : '#59665E', fontSize: 12, fontWeight: '800' }}>{option === 'custom' ? 'Custom' : `${option} ov`}</Text></Pressable>; })}</View>{oversChoice === 'custom' && <TextInput value={customOvers} onChangeText={setCustomOvers} placeholder="Enter overs (1-50)" keyboardType="number-pad" style={[inputStyle, { marginBottom: 19 }]} />}<View style={{ marginTop: oversChoice === 'custom' ? 1 : 6 }}><FieldLabel>WHO BATS FIRST?</FieldLabel><View style={{ flexDirection: 'row', gap: 10 }}>{[{ id: 1, name: team1Name, color: colors.green }, { id: 2, name: team2Name, color: colors.orange }].map((team) => { const active = battingFirst === team.id; return <Pressable key={team.id} onPress={() => setBattingFirst(team.id)} style={{ flex: 1, minHeight: 61, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: active ? `${team.color}12` : 'white', borderWidth: 1, borderColor: active ? team.color : colors.line }}><View style={{ width: 12, height: 12, borderRadius: 7, backgroundColor: team.color, marginRight: 8 }} /><Text numberOfLines={1} style={{ flex: 1, color: active ? team.color : '#4A574E', fontSize: 11, fontWeight: '800' }}>{team.name}</Text>{active && <Ionicons name="checkmark-circle" color={team.color} size={17} />}</Pressable>; })}</View></View></>}
      {step === 2 && <><Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Build your squads</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 20 }}>Tap the pencil to edit a player or the bin to remove one.</Text><TeamPanel teamName={team1Name.trim()} color={colors.green} players={players1} value={input1} onChangeText={setInput1} onAdd={() => addPlayer(1)} onEditPlayer={(player) => editPlayer(1, player)} onDeletePlayer={(player) => deletePlayer(1, player)} editing={editing1} /><TeamPanel teamName={team2Name.trim()} color={colors.orange} players={players2} value={input2} onChangeText={setInput2} onAdd={() => addPlayer(2)} onEditPlayer={(player) => editPlayer(2, player)} onDeletePlayer={(player) => deletePlayer(2, player)} editing={editing2} /><View style={{ backgroundColor: '#F0F4F0', borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'center', marginTop: 3 }}><Ionicons name="information-circle-outline" color={colors.green} size={17} /><Text style={{ flex: 1, color: '#718078', fontSize: 10, marginLeft: 8, lineHeight: 15 }}>Add at least two players per team. Tap + after entering each player.</Text></View></>}
      {step === 3 && <><Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Opening line-up</Text><Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Choose two batters for {battingName} and a bowler for {bowlingName}.</Text><View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}><View style={{ flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#E8F2EC' }}><Text style={{ color: colors.green, fontSize: 9, fontWeight: '800' }}>BATTING FIRST</Text><Text style={{ color: colors.green, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{battingName}</Text></View><View style={{ flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#F7ECE7' }}><Text style={{ color: colors.orange, fontSize: 9, fontWeight: '800' }}>BOWLING FIRST</Text><Text style={{ color: colors.orange, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{bowlingName}</Text></View></View><PlayerChoices title="STRIKER END" players={battingPlayers} selected={striker} onSelect={setStriker} color={battingColor} emptyText="Add batting players in the previous step." /><PlayerChoices title="NON-STRIKER END" players={battingPlayers.filter((player) => player !== striker)} selected={nonStriker} onSelect={setNonStriker} color={battingColor} emptyText="Add a second batter to choose the non-striker." /><PlayerChoices title="OPENING BOWLER" players={bowlingPlayers} selected={bowler} onSelect={setBowler} color={bowlingColor} emptyText="Add bowlers to the opposing team." /><View style={{ marginTop: 20, borderRadius: 13, padding: 12, backgroundColor: '#F0F4F0', flexDirection: 'row', alignItems: 'center' }}><Ionicons name="time-outline" color={colors.green} size={16} /><Text style={{ color: '#718078', fontSize: 10, marginLeft: 8 }}>Bowler overs will be counted automatically as you score.</Text></View></>}
    </ScrollView><View style={{ padding: 16, borderTopWidth: 1, borderColor: '#ECEFEC', backgroundColor: 'white' }}><Pressable onPress={step < 3 ? next : start} style={{ backgroundColor: colors.green, minHeight: 51, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}><Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>{step < 3 ? 'Next' : 'Start match'}</Text><Ionicons name={step < 3 ? 'arrow-forward' : 'play'} size={16} color="white" style={{ marginLeft: 8 }} /></Pressable></View>
  </KeyboardAvoidingView>;
}
