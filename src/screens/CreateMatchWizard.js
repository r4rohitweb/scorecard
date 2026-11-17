import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { getPlayerInitials } from '../data/mockData';

const colors = { green: '#187B62', orange: '#C66A3F', ink: '#17221D', muted: '#829087', line: '#E7ECE7', page: '#F8F9F6' };
const inputStyle = { borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 13, color: colors.ink, backgroundColor: 'white', fontSize: 13 };

function StepProgress({ step }) {
  const labels = ['Teams', 'Players', 'Start'];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 21, marginBottom: 25 }}>
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <View style={{ alignItems: 'center', width: 62 }}>
            <View style={{ width: 29, height: 29, borderRadius: 15, backgroundColor: step >= i + 1 ? colors.green : '#E8ECE8', alignItems: 'center', justifyContent: 'center' }}>
              {step > i + 1 ? <Ionicons name="checkmark" size={15} color="white" /> : <Text style={{ color: step === i + 1 ? 'white' : '#849087', fontSize: 11, fontWeight: '800' }}>{i + 1}</Text>}
            </View>
            <Text style={{ color: step === i + 1 ? colors.green : colors.muted, fontSize: 10, fontWeight: step === i + 1 ? '800' : '600', marginTop: 5 }}>{label}</Text>
          </View>
          {i < 2 && <View style={{ height: 2, backgroundColor: step > i + 1 ? colors.green : '#E8ECE8', flex: 1, marginTop: -14 }} />}
        </React.Fragment>
      ))}
    </View>
  );
}

function FieldLabel({ children }) {
  return <Text style={{ color: '#728077', fontSize: 10, letterSpacing: 0.7, fontWeight: '800', marginBottom: 8 }}>{children}</Text>;
}

function PlayerChoices({ title, players, selected, onSelect, color, emptyText }) {
  return (
    <View style={{ marginTop: 13, padding: 13, borderRadius: 16, backgroundColor: 'white', borderWidth: 1, borderColor: selected ? `${color}75` : colors.line }}>
      <FieldLabel>{title}</FieldLabel>
      {players.length === 0 ? (
        <Text style={{ color: colors.muted, fontSize: 11 }}>{emptyText}</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {players.map((player) => {
            const active = selected === player;
            return (
              <Pressable
                key={player}
                onPress={() => onSelect(player)}
                style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 22, backgroundColor: active ? color : 'white', borderWidth: 1, borderColor: active ? color : colors.line }}
              >
                <Text style={{ color: active ? 'white' : '#425047', fontSize: 11, fontWeight: '700' }}>{player}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

export default function CreateMatchWizard({ allPlayers = [], onAddPlayer, onClose, onStart }) {
  const [step, setStep] = useState(1);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [oversChoice, setOversChoice] = useState('2');
  const [customOvers, setCustomOvers] = useState('');
  const [battingFirst, setBattingFirst] = useState(1);
  const [players1, setPlayers1] = useState([]);
  const [players2, setPlayers2] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRole, setNewPlayerRole] = useState('Batter');
  const [showAddForm, setShowAddForm] = useState(false);

  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  const [noBallRun, setNoBallRun] = useState(0);

  const overs = oversChoice === 'custom' ? Number(customOvers) : Number(oversChoice);
  const battingPlayers = battingFirst === 1 ? players1 : players2;
  const bowlingPlayers = battingFirst === 1 ? players2 : players1;
  const battingName = battingFirst === 1 ? team1Name.trim() : team2Name.trim();
  const bowlingName = battingFirst === 1 ? team2Name.trim() : team1Name.trim();
  const battingColor = battingFirst === 1 ? colors.green : colors.orange;
  const bowlingColor = battingFirst === 1 ? colors.orange : colors.green;

  // Toggle player for Team 1 (Mutual exclusion: cannot select if in Team 2)
  const toggleTeam1 = (playerName) => {
    if (players2.includes(playerName)) {
      Alert.alert('Player unavailable', `"${playerName}" is already selected for ${team2Name.trim()}. A player cannot be in both teams.`);
      return;
    }
    if (players1.includes(playerName)) {
      setPlayers1((list) => list.filter((n) => n !== playerName));
    } else {
      setPlayers1((list) => [...list, playerName]);
    }
  };

  // Toggle player for Team 2 (Mutual exclusion: cannot select if in Team 1)
  const toggleTeam2 = (playerName) => {
    if (players1.includes(playerName)) {
      Alert.alert('Player unavailable', `"${playerName}" is already selected for ${team1Name.trim()}. A player cannot be in both teams.`);
      return;
    }
    if (players2.includes(playerName)) {
      setPlayers2((list) => list.filter((n) => n !== playerName));
    } else {
      setPlayers2((list) => [...list, playerName]);
    }
  };

  const handleAddNewPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Enter player name to add.');
      return;
    }
    if (onAddPlayer) {
      onAddPlayer({ name: trimmed, role: newPlayerRole });
    }
    setNewPlayerName('');
    setShowAddForm(false);
  };

  const next = () => {
    if (step === 1) {
      if (!team1Name.trim() || !team2Name.trim() || team1Name.trim().toLowerCase() === team2Name.trim().toLowerCase()) {
        Alert.alert('Add two team names', 'Team names must be different.');
        return;
      }
      if (!Number.isInteger(overs) || overs < 1 || overs > 50) {
        Alert.alert('Check the overs', 'Choose a whole number from 1 to 50 overs.');
        return;
      }
    }
    if (step === 2) {
      if (players1.length < 2 || players2.length < 2) {
        Alert.alert('Select players', `Please select at least 2 players for each team.\n\n${team1Name.trim()}: ${players1.length}\n${team2Name.trim()}: ${players2.length}`);
        return;
      }
    }
    setStep((current) => Math.min(3, current + 1));
  };

  const start = () => {
    if (battingPlayers.length < 2 || bowlingPlayers.length < 1) {
      Alert.alert('Add players first', 'Go back and select at least two batting players and one bowler.');
      return;
    }
    if (!battingPlayers.includes(striker) || !battingPlayers.includes(nonStriker) || !bowlingPlayers.includes(bowler) || striker === nonStriker) {
      Alert.alert('Finish the line-up', 'Choose two different batters and an opening bowler from the selected teams.');
      return;
    }
    onStart({
      team1Name: team1Name.trim(),
      team2Name: team2Name.trim(),
      overs,
      battingFirst,
      players1,
      players2,
      striker,
      nonStriker,
      bowler,
      noBallRun,
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.page }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={{ height: 56, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ECEFEC', backgroundColor: 'white' }}>
        <Pressable onPress={step === 1 ? onClose : () => setStep(step - 1)} style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: '#F1F4F0', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={step === 1 ? 'close' : 'arrow-back'} size={18} color="#35443B" />
        </Pressable>
        <Text style={{ color: colors.ink, fontSize: 14, fontWeight: '800' }}>Create a match</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 3, paddingBottom: 30 }}>
        <StepProgress step={step} />

        {/* STEP 1: Match Setup */}
        {step === 1 && (
          <>
            <Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Set up your match</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 22 }}>Name the teams and choose your overs.</Text>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 21 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel>TEAM 1</FieldLabel>
                <TextInput value={team1Name} onChangeText={setTeam1Name} placeholder="Team 1" style={inputStyle} />
              </View>
              <View style={{ flex: 1 }}>
                <FieldLabel>TEAM 2</FieldLabel>
                <TextInput value={team2Name} onChangeText={setTeam2Name} placeholder="Team 2" style={inputStyle} />
              </View>
            </View>

            <FieldLabel>OVERS PER INNINGS</FieldLabel>
            <View style={{ flexDirection: 'row', gap: 9, marginBottom: 13 }}>
              {['2', '3', '4', 'custom'].map((option) => {
                const active = oversChoice === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setOversChoice(option)}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 13, alignItems: 'center', backgroundColor: active ? '#E6F1EB' : 'white', borderWidth: 1, borderColor: active ? colors.green : colors.line }}
                  >
                    <Text style={{ color: active ? colors.green : '#59665E', fontSize: 12, fontWeight: '800' }}>{option === 'custom' ? 'Custom' : `${option} ov`}</Text>
                  </Pressable>
                );
              })}
            </View>
            {oversChoice === 'custom' && <TextInput value={customOvers} onChangeText={setCustomOvers} placeholder="Enter overs (1-50)" keyboardType="number-pad" style={[inputStyle, { marginBottom: 19 }]} />}

            <View style={{ marginTop: oversChoice === 'custom' ? 1 : 6 }}>
              <FieldLabel>WHO BATS FIRST?</FieldLabel>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { id: 1, name: team1Name.trim() || 'Team 1', color: colors.green },
                  { id: 2, name: team2Name.trim() || 'Team 2', color: colors.orange },
                ].map((team) => {
                  const active = battingFirst === team.id;
                  return (
                    <Pressable
                      key={team.id}
                      onPress={() => setBattingFirst(team.id)}
                      style={{ flex: 1, minHeight: 61, paddingHorizontal: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', backgroundColor: active ? `${team.color}12` : 'white', borderWidth: 1, borderColor: active ? team.color : colors.line }}
                    >
                      <View style={{ width: 12, height: 12, borderRadius: 7, backgroundColor: team.color, marginRight: 8 }} />
                      <Text numberOfLines={1} style={{ flex: 1, color: active ? team.color : '#4A574E', fontSize: 11, fontWeight: '800' }}>{team.name}</Text>
                      {active && <Ionicons name="checkmark-circle" color={team.color} size={17} />}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={{ marginTop: 17 }}>
              <FieldLabel>NO-BALL PENALTY RUNS (MATCH RULE)</FieldLabel>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {[
                  { value: 0, label: '0 Runs (Local / Gully)', desc: 'Re-bowl delivery, 0 penalty runs' },
                  { value: 1, label: '+1 Run (Standard)', desc: '+1 run penalty + re-bowl delivery' },
                ].map((rule) => {
                  const active = noBallRun === rule.value;
                  return (
                    <Pressable
                      key={rule.value}
                      onPress={() => setNoBallRun(rule.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        paddingHorizontal: 12,
                        borderRadius: 14,
                        backgroundColor: active ? '#E6F1EB' : 'white',
                        borderWidth: 1.5,
                        borderColor: active ? colors.green : colors.line,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: active ? colors.green : '#253129', fontSize: 11, fontWeight: '800' }}>
                          {rule.label}
                        </Text>
                        {active && <Ionicons name="checkmark-circle" color={colors.green} size={15} />}
                      </View>
                      <Text style={{ color: active ? '#2D6B53' : colors.muted, fontSize: 9, marginTop: 4 }}>
                        {rule.desc}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* STEP 2: Squad Selection with Mutual Exclusion */}
        {step === 2 && (
          <>
            <Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Build your squads</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5, marginBottom: 18 }}>
              Select players for each team. A player chosen by one team cannot be chosen by the other.
            </Text>

            {/* Squad Counters Banner */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: colors.green }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green, marginRight: 6 }} />
                  <Text numberOfLines={1} style={{ flex: 1, color: colors.ink, fontSize: 12, fontWeight: '800' }}>{team1Name.trim()}</Text>
                </View>
                <Text style={{ color: colors.green, fontSize: 18, fontWeight: '900' }}>{players1.length} <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '600' }}>players</Text></Text>
                {players1.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {players1.map((p) => (
                      <Pressable key={p} onPress={() => toggleTeam1(p)} style={{ backgroundColor: '#E2EFE8', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ color: colors.green, fontSize: 9, fontWeight: '700' }}>{p}</Text>
                        <Ionicons name="close" size={11} color={colors.green} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>

              <View style={{ flex: 1, backgroundColor: 'white', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: colors.orange }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.orange, marginRight: 6 }} />
                  <Text numberOfLines={1} style={{ flex: 1, color: colors.ink, fontSize: 12, fontWeight: '800' }}>{team2Name.trim()}</Text>
                </View>
                <Text style={{ color: colors.orange, fontSize: 18, fontWeight: '900' }}>{players2.length} <Text style={{ fontSize: 10, color: colors.muted, fontWeight: '600' }}>players</Text></Text>
                {players2.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    {players2.map((p) => (
                      <Pressable key={p} onPress={() => toggleTeam2(p)} style={{ backgroundColor: '#FCECE8', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ color: colors.orange, fontSize: 9, fontWeight: '700' }}>{p}</Text>
                        <Ionicons name="close" size={11} color={colors.orange} />
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Quick Add Player Section */}
            <View style={{ marginBottom: 16 }}>
              {!showAddForm ? (
                <Pressable
                  onPress={() => setShowAddForm(true)}
                  style={{ backgroundColor: 'white', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: colors.line, borderStyle: 'dashed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Ionicons name="add-circle" size={17} color={colors.green} />
                  <Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>+ Register new player to directory</Text>
                </Pressable>
              ) : (
                <View style={{ backgroundColor: 'white', borderRadius: 15, padding: 14, borderWidth: 1, borderColor: colors.line }}>
                  <Text style={{ color: colors.ink, fontSize: 12, fontWeight: '800', marginBottom: 8 }}>Quick Add to Directory</Text>
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                    <TextInput
                      value={newPlayerName}
                      onChangeText={setNewPlayerName}
                      placeholder="Player name (e.g. Rohit)"
                      placeholderTextColor="#A3ACA6"
                      style={[inputStyle, { flex: 1, paddingVertical: 9 }]}
                    />
                    <Pressable onPress={handleAddNewPlayer} style={{ backgroundColor: colors.green, paddingHorizontal: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ color: 'white', fontWeight: '800', fontSize: 11 }}>Add</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowAddForm(false)} style={{ backgroundColor: '#F0F2F0', paddingHorizontal: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                      <Ionicons name="close" size={16} color="#666" />
                    </Pressable>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'].map((r) => (
                      <Pressable key={r} onPress={() => setNewPlayerRole(r)} style={{ paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, backgroundColor: newPlayerRole === r ? '#E2EFE8' : '#F5F7F5' }}>
                        <Text style={{ color: newPlayerRole === r ? colors.green : '#666', fontSize: 9, fontWeight: '700' }}>{r}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Registered Players Directory List */}
            <FieldLabel>SELECT SQUAD MEMBERS ({allPlayers.length} REGISTERED)</FieldLabel>
            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' }}>
              {allPlayers.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: colors.muted, fontSize: 12 }}>No players registered in directory.</Text>
                  <Text style={{ color: colors.green, fontSize: 11, fontWeight: '700', marginTop: 4 }}>Add players above to start selecting squads.</Text>
                </View>
              ) : (
                allPlayers.map((player, idx) => {
                  const inTeam1 = players1.includes(player.name);
                  const inTeam2 = players2.includes(player.name);
                  const lockedForTeam1 = inTeam2; // Rohit chosen by Team B => locked for Team A
                  const lockedForTeam2 = inTeam1; // Rohit chosen by Team A => locked for Team B

                  return (
                    <View
                      key={player.id || player.name}
                      style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: idx > 0 ? 1 : 0, borderColor: '#F0F2F0', flexDirection: 'row', alignItems: 'center', backgroundColor: inTeam1 ? '#F4FAF6' : inTeam2 ? '#FDF7F4' : 'white' }}
                    >
                      {/* Avatar */}
                      <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: player.color || '#E5F0EB', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <Text style={{ color: '#35443B', fontSize: 11, fontWeight: '800' }}>{player.initials || getPlayerInitials(player.name)}</Text>
                      </View>

                      {/* Name & Role */}
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 12, fontWeight: inTeam1 || inTeam2 ? '800' : '700' }}>{player.name}</Text>
                        <Text numberOfLines={1} style={{ color: colors.muted, fontSize: 9, marginTop: 2 }}>{player.role || 'Player'}</Text>
                      </View>

                      {/* Radio / Selection Buttons for Team 1 and Team 2 */}
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {/* Team 1 Button */}
                        <Pressable
                          onPress={() => toggleTeam1(player.name)}
                          disabled={lockedForTeam1}
                          style={{
                            paddingHorizontal: 9,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: inTeam1 ? colors.green : lockedForTeam1 ? '#F0F2F0' : 'white',
                            borderWidth: 1,
                            borderColor: inTeam1 ? colors.green : lockedForTeam1 ? '#E4E7E4' : colors.green,
                            opacity: lockedForTeam1 ? 0.4 : 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Ionicons name={inTeam1 ? 'checkmark-circle' : lockedForTeam1 ? 'lock-closed' : 'add-circle-outline'} size={12} color={inTeam1 ? 'white' : lockedForTeam1 ? '#999' : colors.green} />
                          <Text style={{ color: inTeam1 ? 'white' : lockedForTeam1 ? '#999' : colors.green, fontSize: 10, fontWeight: '800' }}>
                            {inTeam1 ? team1Name.slice(0, 6) : team1Name.slice(0, 6)}
                          </Text>
                        </Pressable>

                        {/* Team 2 Button */}
                        <Pressable
                          onPress={() => toggleTeam2(player.name)}
                          disabled={lockedForTeam2}
                          style={{
                            paddingHorizontal: 9,
                            paddingVertical: 6,
                            borderRadius: 12,
                            backgroundColor: inTeam2 ? colors.orange : lockedForTeam2 ? '#F0F2F0' : 'white',
                            borderWidth: 1,
                            borderColor: inTeam2 ? colors.orange : lockedForTeam2 ? '#E4E7E4' : colors.orange,
                            opacity: lockedForTeam2 ? 0.4 : 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <Ionicons name={inTeam2 ? 'checkmark-circle' : lockedForTeam2 ? 'lock-closed' : 'add-circle-outline'} size={12} color={inTeam2 ? 'white' : lockedForTeam2 ? '#999' : colors.orange} />
                          <Text style={{ color: inTeam2 ? 'white' : lockedForTeam2 ? '#999' : colors.orange, fontSize: 10, fontWeight: '800' }}>
                            {inTeam2 ? team2Name.slice(0, 6) : team2Name.slice(0, 6)}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            <View style={{ backgroundColor: '#F0F4F0', borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
              <Ionicons name="information-circle-outline" color={colors.green} size={17} />
              <Text style={{ flex: 1, color: '#718078', fontSize: 10, marginLeft: 8, lineHeight: 15 }}>
                Select at least 2 players for each team. Mutual exclusion prevents any player from playing for both teams.
              </Text>
            </View>
          </>
        )}

        {/* STEP 3: Opening Lineup */}
        {step === 3 && (
          <>
            <Text style={{ color: colors.ink, fontSize: 23, fontWeight: '800' }}>Opening line-up</Text>
            <Text style={{ color: colors.muted, fontSize: 12, marginTop: 5 }}>Choose two batters for {battingName} and a bowler for {bowlingName}.</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
              <View style={{ flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#E8F2EC' }}>
                <Text style={{ color: colors.green, fontSize: 9, fontWeight: '800' }}>BATTING FIRST</Text>
                <Text style={{ color: colors.green, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{battingName}</Text>
              </View>
              <View style={{ flex: 1, padding: 11, borderRadius: 13, backgroundColor: '#F7ECE7' }}>
                <Text style={{ color: colors.orange, fontSize: 9, fontWeight: '800' }}>BOWLING FIRST</Text>
                <Text style={{ color: colors.orange, fontSize: 11, fontWeight: '800', marginTop: 4 }}>{bowlingName}</Text>
              </View>
            </View>

            <PlayerChoices title="STRIKER END" players={battingPlayers} selected={striker} onSelect={setStriker} color={battingColor} emptyText="No batting players found in previous step." />
            <PlayerChoices title="NON-STRIKER END" players={battingPlayers.filter((player) => player !== striker)} selected={nonStriker} onSelect={setNonStriker} color={battingColor} emptyText="Add a second batter to choose the non-striker." />
            <PlayerChoices title="OPENING BOWLER" players={bowlingPlayers} selected={bowler} onSelect={setBowler} color={bowlingColor} emptyText="No bowlers found for opposing team." />

            <View style={{ marginTop: 20, borderRadius: 13, padding: 12, backgroundColor: '#F0F4F0', flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" color={colors.green} size={16} />
              <Text style={{ color: '#718078', fontSize: 10, marginLeft: 8 }}>Bowler overs will be counted automatically as you score.</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Button */}
      <View style={{ padding: 16, borderTopWidth: 1, borderColor: '#ECEFEC', backgroundColor: 'white' }}>
        <Pressable
          onPress={step < 3 ? next : start}
          style={{ backgroundColor: colors.green, minHeight: 51, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
        >
          <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>{step < 3 ? 'Next' : 'Start match'}</Text>
          <Ionicons name={step < 3 ? 'arrow-forward' : 'play'} size={16} color="white" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
