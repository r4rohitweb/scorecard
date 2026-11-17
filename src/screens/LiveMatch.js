import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, shareToWhatsApp } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '../theme/native';
import { getTeam } from '../data/mockData';
import { Pill, TeamMark } from '../components/UI';
import { calculatePlayerOfMatch, generateWhatsAppSummary } from '../data/statsHelper';

function Stat({ label, value }) { return <View style={{ flex: 1 }}><Text style={{ color: '#A9C3B8', fontSize: 9, letterSpacing: .7 }}>{label}</Text><Text style={{ color: 'white', fontSize: 17, fontWeight: '800', marginTop: 5 }}>{value}</Text></View>; }
function StrikerIndicator({ size = 14 }) { return <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: '#0C604B', backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center', marginRight: 6, shadowColor: '#0C604B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 2, elevation: 3 }}><View style={{ width: size * 0.36, height: size * 0.36, borderRadius: size, backgroundColor: '#E4F4EB' }} /></View>; }
function BallResult({ label, color = '#425047' }) { return label === 'DOT' ? <Ionicons name="ellipse" size={7} color={color} /> : <Text style={{ color, fontSize: 9, fontWeight: '800' }}>{label}</Text>; }
function PlayerPrompt({ visible, title, subtitle, players, color, onSelect, stats = {} }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}><View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'center', alignItems: 'center', padding: 20 }}><View style={{ width: '100%', maxWidth: 420, maxHeight: '82%', borderRadius: 22, backgroundColor: '#F8F9F6', padding: 19 }}><View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}><View style={{ width: 39, height: 39, borderRadius: 14, backgroundColor: `${color}18`, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}><Ionicons name={title === 'Choose next bowler' ? 'baseball-outline' : 'person-add-outline'} size={19} color={color} /></View><View style={{ flex: 1 }}><Text style={{ color: '#17221D', fontSize: 17, fontWeight: '800' }}>{title}</Text><Text style={{ color: '#829087', fontSize: 11, marginTop: 3 }}>{subtitle}</Text></View></View><ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{players.map((player) => <Pressable key={player} onPress={() => onSelect(player)} style={{ minHeight: 52, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#E7ECE7', flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}><View style={{ width: 29, height: 29, borderRadius: 15, backgroundColor: `${color}15`, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}><Text style={{ color, fontSize: 10, fontWeight: '800' }}>{player.slice(0, 1).toUpperCase()}</Text></View><Text style={{ flex: 1, color: '#253129', fontSize: 12, fontWeight: '700' }}>{player}</Text>{title === 'Choose next bowler' && <Text style={{ color: '#829087', fontSize: 9, marginRight: 7 }}>{Math.floor((stats[player]?.legalBalls || 0) / 6)}.{(stats[player]?.legalBalls || 0) % 6} ov</Text>}<Ionicons name="chevron-forward" size={15} color={color} /></Pressable>)}</ScrollView></View></View></Modal>;
}
function LineupChoices({ title, players, selected, onSelect, color }) {
  return <View style={{ marginTop: 13, backgroundColor: 'white', borderWidth: 1, borderColor: '#E7ECE7', borderRadius: 15, padding: 12 }}><Text style={{ color: '#718078', fontSize: 9, fontWeight: '800', letterSpacing: .6, marginBottom: 9 }}>{title}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>{players.map((player) => <Pressable key={player} onPress={() => onSelect(player)} style={{ paddingHorizontal: 11, paddingVertical: 8, borderRadius: 20, backgroundColor: selected === player ? color : '#F4F6F3' }}><Text style={{ color: selected === player ? 'white' : '#425047', fontSize: 10, fontWeight: '700' }}>{player}</Text></Pressable>)}</View></View>;
}
function SecondInningsPrompt({ visible, battingTeam, bowlingTeam, battingPlayers, bowlingPlayers, onClose, onStart }) {
  const [striker, setStriker] = useState('');
  const [nonStriker, setNonStriker] = useState('');
  const [bowler, setBowler] = useState('');
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}><View style={{ maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F8F9F6', padding: 20 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View><Text style={{ color: '#17221D', fontSize: 19, fontWeight: '800' }}>Second innings line-up</Text><Text style={{ color: '#829087', fontSize: 11, marginTop: 4 }}>{battingTeam.name} chase the target</Text></View><Pressable onPress={onClose} style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: '#E9EDE8', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="close" size={18} color="#425047" /></Pressable></View><ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 12 }}><LineupChoices title="STRIKER END" players={battingPlayers} selected={striker} onSelect={setStriker} color={battingTeam.color} /><LineupChoices title="NON-STRIKER END" players={battingPlayers.filter((player) => player !== striker)} selected={nonStriker} onSelect={setNonStriker} color={battingTeam.color} /><LineupChoices title={`OPENING BOWLER  -  ${bowlingTeam.name}`} players={bowlingPlayers} selected={bowler} onSelect={setBowler} color={bowlingTeam.color} /></ScrollView><Pressable disabled={!striker || !nonStriker || !bowler} onPress={() => onStart({ striker, nonStriker, bowler })} style={{ minHeight: 49, borderRadius: 14, backgroundColor: striker && nonStriker && bowler ? '#187B62' : '#AAB7AE', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>Start second innings</Text></Pressable></View></View></Modal>;
}
function WicketModal({ visible, match, onClose, onConfirm }) {
  const [dismissalType, setDismissalType] = useState('Bowled');
  const [dismissedBatter, setDismissedBatter] = useState('');
  const [fielder, setFielder] = useState('');

  React.useEffect(() => {
    if (visible && match?.batters?.length) {
      const striker = match.batters.find((b) => b.onStrike)?.name || match.batters[0]?.name;
      setDismissedBatter(striker);
      setDismissalType('Bowled');
      setFielder('');
    }
  }, [visible, match]);

  if (!visible || !match) return null;

  const currentBowler = match.bowler?.name || 'Bowler';
  const dismissalTypes = [
    { label: 'Bowled' },
    { label: 'Caught' },
    { label: 'LBW' },
    { label: 'Run out' },
    { label: 'Stumped' },
    { label: 'Hit wicket' },
  ];

  const needsFielder = ['Caught', 'Run out', 'Stumped'].includes(dismissalType);
  const bowlingSquad = match.bowlingPlayers || [];

  const getPreviewText = () => {
    if (dismissalType === 'Bowled') return `b ${currentBowler}`;
    if (dismissalType === 'Caught') {
      if (fielder === currentBowler) return `c & b ${currentBowler}`;
      return fielder ? `c ${fielder} b ${currentBowler}` : `c & b ${currentBowler}`;
    }
    if (dismissalType === 'LBW') return `lbw b ${currentBowler}`;
    if (dismissalType === 'Run out') return fielder ? `run out (${fielder})` : 'run out';
    if (dismissalType === 'Stumped') return fielder ? `st ${fielder} b ${currentBowler}` : `st b ${currentBowler}`;
    if (dismissalType === 'Hit wicket') return `hit wicket b ${currentBowler}`;
    return dismissalType;
  };

  const handleConfirm = () => {
    onConfirm({
      type: 'Wicket',
      dismissalType,
      dismissedBatter: dismissedBatter || match.batters.find((b) => b.onStrike)?.name || match.batters[0]?.name,
      fielder: needsFielder ? fielder : '',
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F8F9F6', padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FCECE8', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="flash" size={18} color="#C6533C" />
              </View>
              <View>
                <Text style={{ color: '#17221D', fontSize: 18, fontWeight: '800' }}>Wicket fall</Text>
                <Text style={{ color: '#818C84', fontSize: 11, marginTop: 2 }}>Cause of dismissal & player details</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={17} color="#526057" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8, marginTop: 4 }}>
              CAUSE OF WICKET
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {dismissalTypes.map((t) => {
                const active = dismissalType === t.label;
                return (
                  <Pressable
                    key={t.label}
                    onPress={() => setDismissalType(t.label)}
                    style={{
                      paddingHorizontal: 13,
                      paddingVertical: 9,
                      borderRadius: 13,
                      backgroundColor: active ? '#C6533C' : 'white',
                      borderWidth: 1,
                      borderColor: active ? '#C6533C' : '#E7ECE7',
                    }}
                  >
                    <Text style={{ color: active ? 'white' : '#26332C', fontSize: 11, fontWeight: '700' }}>
                      {t.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
              DISMISSED BATTER
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {match.batters.map((b) => {
                const active = dismissedBatter === b.name;
                return (
                  <Pressable
                    key={b.name}
                    onPress={() => setDismissedBatter(b.name)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: active ? '#FDF1EE' : 'white',
                      borderWidth: 1.5,
                      borderColor: active ? '#C6533C' : '#E7ECE7',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: active ? '#C6533C' : '#26332C', fontSize: 12, fontWeight: '800' }}>
                        {b.name}
                      </Text>
                      {b.onStrike && (
                        <View style={{ backgroundColor: '#187B62', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: 'white', fontSize: 8, fontWeight: '700' }}>STRIKE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: '#818C84', fontSize: 10, marginTop: 4 }}>
                      {b.runs} off {b.balls}b
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {needsFielder && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
                  {dismissalType === 'Caught' ? 'CAUGHT BY' : dismissalType === 'Stumped' ? 'WICKETKEEPER' : 'RUN OUT BY'}
                </Text>
                {dismissalType === 'Caught' && (
                  <Pressable
                    onPress={() => setFielder(currentBowler)}
                    style={{
                      paddingVertical: 7,
                      paddingHorizontal: 12,
                      borderRadius: 10,
                      backgroundColor: fielder === currentBowler ? '#E6F1EB' : '#F2F5F2',
                      marginBottom: 8,
                      alignSelf: 'flex-start',
                    }}
                  >
                    <Text style={{ color: fielder === currentBowler ? '#187B62' : '#526057', fontSize: 10, fontWeight: '700' }}>
                      Caught & Bowled ({currentBowler})
                    </Text>
                  </Pressable>
                )}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {bowlingSquad.map((fName) => {
                    const active = fielder === fName;
                    return (
                      <Pressable
                        key={fName}
                        onPress={() => setFielder(active ? '' : fName)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 7,
                          borderRadius: 18,
                          backgroundColor: active ? '#187B62' : 'white',
                          borderWidth: 1,
                          borderColor: active ? '#187B62' : '#E7ECE7',
                        }}
                      >
                        <Text style={{ color: active ? 'white' : '#425047', fontSize: 10, fontWeight: '600' }}>
                          {fName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <View style={{ backgroundColor: '#103C2E', borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 16 }}>
              <Text style={{ color: '#A9C3B8', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>SCORECARD ENTRY</Text>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '800', marginTop: 3 }}>
                {dismissedBatter} <Text style={{ color: '#FFB4A2', fontWeight: '600', fontSize: 12 }}>{getPreviewText()}</Text>
              </Text>
            </View>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 14, backgroundColor: '#EDEFEA', alignItems: 'center' }}
            >
              <Text style={{ color: '#526057', fontWeight: '700', fontSize: 12 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 2, paddingVertical: 13, borderRadius: 14, backgroundColor: '#C6533C', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Confirm Wicket</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function NoBallModal({ visible, match, onClose, onConfirm }) {
  const currentRule = match?.noBallRun !== undefined ? match.noBallRun : 0;
  const [penalty, setPenalty] = useState(currentRule);
  const [batRuns, setBatRuns] = useState(0);

  React.useEffect(() => {
    if (visible) {
      setPenalty(match?.noBallRun !== undefined ? match.noBallRun : 0);
      setBatRuns(0);
    }
  }, [visible, match]);

  if (!visible || !match) return null;

  const striker = match.batters?.find((b) => b.onStrike)?.name || 'Striker';
  const totalRuns = penalty + batRuns;
  const ballLabel = batRuns > 0 ? `Nb+${batRuns}` : 'Nb';

  const handleConfirm = () => {
    onConfirm({
      type: 'No ball',
      batRuns,
      penalty,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F8F9F6', padding: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#FEF5E7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="alert-circle" size={20} color="#B86200" />
              </View>
              <View>
                <Text style={{ color: '#17221D', fontSize: 18, fontWeight: '800' }}>No Ball Delivery</Text>
                <Text style={{ color: '#818C84', fontSize: 11, marginTop: 2 }}>Extra ball • Choose penalty & bat runs</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={17} color="#526057" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Penalty rule toggle */}
            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8, marginTop: 4 }}>
              NO-BALL PENALTY (RULE FOR THIS MATCH)
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              {[
                { value: 0, label: '0 Runs (Local / Gully)', desc: 'Only extra ball, 0 penalty run' },
                { value: 1, label: '+1 Run (Standard)', desc: '+1 penalty run to team score' },
              ].map((rule) => {
                const active = penalty === rule.value;
                return (
                  <Pressable
                    key={rule.value}
                    onPress={() => setPenalty(rule.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: active ? '#FEF5E7' : 'white',
                      borderWidth: 1.5,
                      borderColor: active ? '#B86200' : '#E7ECE7',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: active ? '#B86200' : '#253129', fontSize: 11, fontWeight: '800' }}>
                        {rule.label}
                      </Text>
                      {active && <Ionicons name="checkmark-circle" size={15} color="#B86200" />}
                    </View>
                    <Text style={{ color: active ? '#8A4A00' : '#818C84', fontSize: 9, marginTop: 3 }}>
                      {rule.desc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Runs scored off the ball */}
            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
              RUNS SCORED OFF DELIVERY ({striker})
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[
                { r: 0, label: '0 (Dot / No run)' },
                { r: 1, label: '1 Run' },
                { r: 2, label: '2 Runs' },
                { r: 3, label: '3 Runs' },
                { r: 4, label: '4 (Four)' },
                { r: 6, label: '6 (Six)' },
              ].map((opt) => {
                const active = batRuns === opt.r;
                return (
                  <Pressable
                    key={opt.r}
                    onPress={() => setBatRuns(opt.r)}
                    style={{
                      flexBasis: '31%',
                      flexGrow: 1,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderRadius: 13,
                      backgroundColor: active ? '#187B62' : 'white',
                      borderWidth: 1,
                      borderColor: active ? '#187B62' : '#E7ECE7',
                    }}
                  >
                    <Text style={{ color: active ? 'white' : '#253129', fontSize: 12, fontWeight: '800' }}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Summary Box */}
            <View style={{ backgroundColor: '#103C2E', borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: '#A9C3B8', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 }}>SCORECARD IMPACT</Text>
                <View style={{ backgroundColor: '#FFFFFF22', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}>
                  <Text style={{ color: '#FCE2B6', fontSize: 10, fontWeight: '800' }}>Ball: {ballLabel}</Text>
                </View>
              </View>
              <Text style={{ color: 'white', fontSize: 15, fontWeight: '800', marginTop: 2 }}>
                Team Score: +{totalRuns} {totalRuns === 1 ? 'run' : 'runs'} <Text style={{ color: '#C8DDD2', fontSize: 11, fontWeight: '600' }}>({penalty} penalty + {batRuns} bat)</Text>
              </Text>
              <Text style={{ color: '#A9C3B8', fontSize: 11, marginTop: 4 }}>
                • Batter ({striker}): +{batRuns} runs {batRuns === 4 ? '(1 boundary)' : batRuns === 6 ? '(1 maximum)' : ''}
              </Text>
              <Text style={{ color: '#A9C3B8', fontSize: 11, marginTop: 2 }}>
                • Ball re-bowled: Over ball count does not advance
              </Text>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 14, backgroundColor: '#EDEFEA', alignItems: 'center' }}
            >
              <Text style={{ color: '#526057', fontWeight: '700', fontSize: 12 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 2, paddingVertical: 13, borderRadius: 14, backgroundColor: '#187B62', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Record No Ball (+{totalRuns})</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RetireModal({ visible, match, onClose, onConfirm }) {
  const [retireBatter, setRetireBatter] = useState('');
  const [reason, setReason] = useState('retired hurt');
  const [replacement, setReplacement] = useState('');

  React.useEffect(() => {
    if (visible && match?.batters?.length) {
      const striker = match.batters.find((b) => b.onStrike)?.name || match.batters[0]?.name;
      setRetireBatter(striker);
      setReason('retired hurt');
      setReplacement('');
    }
  }, [visible, match]);

  if (!visible || !match) return null;

  const availableBatters = (match.battingPlayers || []).filter(
    (name) => !(match.dismissedPlayers || []).includes(name) && !match.batters.some((b) => b.name === name)
  );

  const handleConfirm = () => {
    onConfirm({
      type: 'Retire',
      reason,
      batterName: retireBatter || match.batters[0]?.name,
      subBatter: replacement || null,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F8F9F6', padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#E8F5EF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="body-outline" size={20} color="#187B62" />
              </View>
              <View>
                <Text style={{ color: '#17221D', fontSize: 18, fontWeight: '800' }}>Retire Batter</Text>
                <Text style={{ color: '#818C84', fontSize: 11, marginTop: 2 }}>Retired Hurt vs Retired Out</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={17} color="#526057" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8, marginTop: 4 }}>
              BATTER RETIRING
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              {match.batters.map((b) => {
                const active = retireBatter === b.name;
                return (
                  <Pressable
                    key={b.name}
                    onPress={() => setRetireBatter(b.name)}
                    style={{
                      flex: 1,
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: active ? '#E8F5EF' : 'white',
                      borderWidth: 1.5,
                      borderColor: active ? '#187B62' : '#E7ECE7',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ color: active ? '#187B62' : '#253129', fontSize: 12, fontWeight: '800' }}>
                        {b.name}
                      </Text>
                      {b.onStrike && (
                        <View style={{ backgroundColor: '#187B62', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: 'white', fontSize: 8, fontWeight: '700' }}>STRIKE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: '#818C84', fontSize: 10, marginTop: 3 }}>
                      {b.runs} runs ({b.balls}b)
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
              RETIREMENT REASON
            </Text>
            <View style={{ gap: 10, marginBottom: 16 }}>
              <Pressable
                onPress={() => setReason('retired hurt')}
                style={{
                  padding: 13,
                  borderRadius: 14,
                  backgroundColor: reason === 'retired hurt' ? '#E8F5EF' : 'white',
                  borderWidth: 1.5,
                  borderColor: reason === 'retired hurt' ? '#187B62' : '#E7ECE7',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: reason === 'retired hurt' ? '#187B62' : '#253129', fontSize: 13, fontWeight: '800' }}>
                    🏥 Retired Hurt (Not Out)
                  </Text>
                  {reason === 'retired hurt' && <Ionicons name="checkmark-circle" size={18} color="#187B62" />}
                </View>
                <Text style={{ color: '#68756C', fontSize: 11, marginTop: 4 }}>
                  Injured or ill. Does NOT count as a wicket. Batter remains Not Out.
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setReason('retired out')}
                style={{
                  padding: 13,
                  borderRadius: 14,
                  backgroundColor: reason === 'retired out' ? '#FCECE8' : 'white',
                  borderWidth: 1.5,
                  borderColor: reason === 'retired out' ? '#C6533C' : '#E7ECE7',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ color: reason === 'retired out' ? '#C6533C' : '#253129', fontSize: 13, fontWeight: '800' }}>
                    🚪 Retired Out (Counts as Wicket)
                  </Text>
                  {reason === 'retired out' && <Ionicons name="checkmark-circle" size={18} color="#C6533C" />}
                </View>
                <Text style={{ color: '#68756C', fontSize: 11, marginTop: 4 }}>
                  Voluntary retirement. Adds +1 wicket to team score. Bowler gets no credit.
                </Text>
              </Pressable>
            </View>

            <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
              NEXT BATTER IN (OPTIONAL)
            </Text>
            {availableBatters.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
                {availableBatters.map((p) => {
                  const active = replacement === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => setReplacement(active ? '' : p)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 16,
                        backgroundColor: active ? '#187B62' : 'white',
                        borderWidth: 1,
                        borderColor: active ? '#187B62' : '#E7ECE7',
                      }}
                    >
                      <Text style={{ color: active ? 'white' : '#253129', fontSize: 11, fontWeight: '700' }}>
                        {p}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Text style={{ color: '#818C84', fontSize: 11, marginBottom: 12 }}>
                No more bench players; prompt will show if required.
              </Text>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 13, borderRadius: 14, backgroundColor: '#EDEFEA', alignItems: 'center' }}
            >
              <Text style={{ color: '#526057', fontWeight: '700', fontSize: 12 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              style={{ flex: 2, paddingVertical: 13, borderRadius: 14, backgroundColor: reason === 'retired out' ? '#C6533C' : '#187B62', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>
                Confirm {reason === 'retired out' ? 'Retired Out' : 'Retired Hurt'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ShotDirectionModal({ visible, runs, onClose, onSelect }) {
  if (!visible) return null;

  const directions = [
    { id: 'Off side', label: 'Off Side', icon: 'arrow-up-forward', sub: 'Cover / Point / Extra Cover' },
    { id: 'Straight', label: 'Straight', icon: 'arrow-up', sub: 'Long Off / Long On / Drive' },
    { id: 'Leg side', label: 'Leg Side', icon: 'arrow-up-back', sub: 'Mid Wicket / Square Leg' },
    { id: 'Behind', label: 'Behind', icon: 'refresh', sub: 'Fine Leg / Third Man / Scoop' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#F8F9F6', padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#E8F5EF', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Ionicons name="compass-outline" size={20} color="#187B62" />
              </View>
              <View>
                <Text style={{ color: '#17221D', fontSize: 18, fontWeight: '800' }}>
                  {runs === 6 ? 'SIX! 💥 Shot Direction' : 'FOUR! ⚡ Shot Direction'}
                </Text>
                <Text style={{ color: '#818C84', fontSize: 11, marginTop: 2 }}>Tag direction for Wagon Wheel</Text>
              </View>
            </View>
            <Pressable onPress={() => onSelect(null)} style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={17} color="#526057" />
            </Pressable>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            {directions.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => onSelect(d.id)}
                style={{
                  flexBasis: '48%',
                  flexGrow: 1,
                  padding: 14,
                  borderRadius: 16,
                  backgroundColor: 'white',
                  borderWidth: 1.5,
                  borderColor: '#E7ECE7',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={d.icon} size={24} color="#187B62" />
                <Text style={{ color: '#17221D', fontSize: 13, fontWeight: '800', marginTop: 6 }}>
                  {d.label}
                </Text>
                <Text style={{ color: '#829087', fontSize: 9, textAlign: 'center', marginTop: 2 }}>
                  {d.sub}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => onSelect(null)}
            style={{ paddingVertical: 12, borderRadius: 13, backgroundColor: '#EDEFEA', alignItems: 'center' }}
          >
            <Text style={{ color: '#526057', fontSize: 12, fontWeight: '700' }}>Skip / Quick Score (No Direction)</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function VictoryCelebrationModal({ visible, match, onClose, onEndMatch }) {
  if (!visible || !match) return null;

  const potmCalc = calculatePlayerOfMatch(match);
  const potmName = match.playerOfMatch || potmCalc?.bestPlayer?.name || 'Player of the match';
  const potmSummary = match.potmSummary || potmCalc?.bestPlayer?.summary || 'Match winning performance';
  const potmPoints = match.potmPoints || potmCalc?.bestPlayer?.points || 0;

  let winningTeamName = '';
  if (match.result) {
    if (match.result.includes(match.home?.name)) winningTeamName = match.home?.name;
    else if (match.result.includes(match.away?.name)) winningTeamName = match.away?.name;
  }
  if (!winningTeamName) winningTeamName = match.home?.name || 'Match Complete';

  const isTied = match.result && match.result.toLowerCase().includes('tie');
  const resultText = match.result || 'Match Completed!';

  const handleShare = () => {
    const summary = generateWhatsAppSummary(match);
    shareToWhatsApp(summary);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(10, 25, 20, 0.88)', justifyContent: 'center', alignItems: 'center', padding: 18 }}>
        <View style={{ width: '100%', maxWidth: 420, borderRadius: 26, backgroundColor: '#F8F9F6', overflow: 'hidden', borderWidth: 2, borderColor: '#F5BE47' }}>
          
          <LinearGradient colors={['#0F382B', '#07241B']} style={{ padding: 22, alignItems: 'center', position: 'relative' }}>
            <Pressable onPress={onClose} style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="white" />
            </Pressable>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <Text style={{ fontSize: 28 }}>🎊</Text>
              <Text style={{ fontSize: 32 }}>🏆</Text>
              <Text style={{ fontSize: 28 }}>🎊</Text>
              <Text style={{ fontSize: 26 }}>🎉</Text>
            </View>

            <Text style={{ color: '#F5BE47', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 }}>
              MATCH CHAMPIONS
            </Text>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: '900', textAlign: 'center', marginTop: 4, letterSpacing: -0.5 }}>
              {isTied ? 'MATCH TIED!' : winningTeamName.toUpperCase()}
            </Text>

            <View style={{ backgroundColor: 'rgba(245, 190, 71, 0.2)', borderWidth: 1, borderColor: '#F5BE47', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 10 }}>
              <Text style={{ color: '#FCD34D', fontSize: 13, fontWeight: '800', textAlign: 'center' }}>
                🎉 {resultText.toUpperCase()} 🎉
              </Text>
            </View>
          </LinearGradient>

          <ScrollView style={{ maxHeight: 360, padding: 18 }} showsVerticalScrollIndicator={false}>
            <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E7ECE7', marginBottom: 12 }}>
              <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 }}>
                FINAL SCORECARD
              </Text>
              {match.firstInnings && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                  <Text style={{ color: '#253129', fontSize: 13, fontWeight: '700' }}>
                    {match.firstInnings.team}
                  </Text>
                  <Text style={{ color: '#253129', fontSize: 13, fontWeight: '800' }}>
                    {match.firstInnings.score}/{match.firstInnings.wickets} <Text style={{ color: '#829087', fontSize: 11 }}>({match.firstInnings.overs} ov)</Text>
                  </Text>
                </View>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderTopWidth: match.firstInnings ? 1 : 0, borderColor: '#F0F2F0' }}>
                <Text style={{ color: '#253129', fontSize: 13, fontWeight: '700' }}>
                  {match.home?.name}
                </Text>
                <Text style={{ color: '#253129', fontSize: 13, fontWeight: '800' }}>
                  {match.score}/{match.wickets} <Text style={{ color: '#829087', fontSize: 11 }}>({match.overs} ov)</Text>
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: '#103C2E', borderRadius: 16, padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Ionicons name="trophy" size={18} color="#F5BE47" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#A9C3B8', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>
                    PLAYER OF THE MATCH
                  </Text>
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', marginTop: 1 }}>
                    {potmName}
                  </Text>
                </View>
                {potmPoints > 0 && (
                  <View style={{ backgroundColor: 'rgba(245, 190, 71, 0.25)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                    <Text style={{ color: '#F5BE47', fontSize: 11, fontWeight: '800' }}>{Math.round(potmPoints)} pts</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: '#D6E4DC', fontSize: 11 }}>{potmSummary}</Text>
            </View>
          </ScrollView>

          <View style={{ padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#EDF0ED', gap: 10 }}>
            <Pressable
              onPress={handleShare}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#25D366',
                paddingVertical: 13,
                borderRadius: 14,
                gap: 8,
              }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '900' }}>
                Share Result on WhatsApp 💬
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onEndMatch(potmName)}
              style={{
                backgroundColor: '#187B62',
                paddingVertical: 13,
                borderRadius: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>
                Save & View Full Scorecard 📊
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function LiveMatch({ match, onBack, onUpdate, onSelectBatter, onSelectBowler, onStartSecondInnings, onEndMatch }) {
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showNoBallModal, setShowNoBallModal] = useState(false);
  const [showRetireModal, setShowRetireModal] = useState(false);
  const [shotPrompt, setShotPrompt] = useState(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showSecondInningsSetup, setShowSecondInningsSetup] = useState(false);
  const [showPlayerOfMatch, setShowPlayerOfMatch] = useState(false);

  React.useEffect(() => {
    if (match.status === 'AWAITING_END') {
      setShowVictoryModal(true);
    }
  }, [match.status]);
  const batting = getTeam(match.home); const bowling = getTeam(match.away);  const [showAllOvers, setShowAllOvers] = useState(false);
  const history = match.overHistory || [];
  const latestOver = history[history.length - 1];
  const currentOverBalls = latestOver && !latestOver.complete ? latestOver.balls.map((ball) => ball.label) : [];
  const visibleOvers = showAllOvers ? [...history].reverse() : [...history].slice(-2).reverse();
  const availableBatters = (match.battingPlayers || []).filter((name) => !(match.dismissedPlayers || []).includes(name) && !match.batters.some((batter) => batter.name === name));
  const availableBowlers = (match.bowlingPlayers || []).filter((name) => name !== match.bowler.name);
  const [completedOvers, ballsInOver] = match.overs.split('.').map(Number);
  const totalBallsBowled = completedOvers * 6 + ballsInOver;
  const ballsRemaining = Math.max(0, (match.totalOvers || 0) * 6 - totalBallsBowled);
  const runsRequired = Math.max(0, (match.target || 0) - match.score);
  const currentRunRate = totalBallsBowled ? (match.score / (totalBallsBowled / 6)).toFixed(2) : '0.00';
  const requiredRunRate = ballsRemaining ? (runsRequired / (ballsRemaining / 6)).toFixed(2) : '0.00';
  return <View style={{ flex: 1 }}><ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
    <LinearGradient colors={['#103C2E', '#0C2F25']} style={{ padding: 20, paddingBottom: 22, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}><Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="arrow-back" size={18} color="white" /></Pressable><Pill color="#FFB4A2" bg="#FFFFFF18">{match.status === 'INNINGS_BREAK' ? 'INNINGS BREAK' : match.status === 'AWAITING_END' ? 'RESULT  -  END MATCH' : match.status === 'COMPLETED' ? 'MATCH COMPLETE' : 'LIVE'}</Pill><Pressable onPress={() => shareToWhatsApp(generateWhatsAppSummary(match))} style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center' }}><Ionicons name="logo-whatsapp" size={18} color="#43BA91" /></Pressable></View>
      <Text style={{ color: '#A9C3B8', fontSize: 10, letterSpacing: 1, fontWeight: '700', textAlign: 'center' }}>{match.format}  -  {match.venue}</Text><View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 16 }}><View style={{ alignItems: 'center' }}><TeamMark team={batting} size={48} /><Text style={{ color: 'white', fontWeight: '700', fontSize: 11, marginTop: 7 }}>{batting.short}</Text></View><View style={{ alignItems: 'center' }}><Text style={{ color: 'white', fontSize: 39, fontWeight: '800', letterSpacing: -1 }}>{match.score}<Text style={{ color: '#C4D5CC', fontSize: 23 }}>/{match.wickets}</Text></Text><Text style={{ color: '#B6C9C0', fontSize: 13, marginTop: -1 }}>{match.overs} <Text style={{ color: '#8CA99B' }}>overs</Text></Text></View><View style={{ alignItems: 'center' }}><TeamMark team={bowling} size={48} /><Text style={{ color: 'white', fontWeight: '700', fontSize: 11, marginTop: 7 }}>{bowling.short}</Text></View></View>
      <View style={{ height: 1, backgroundColor: '#FFFFFF22', marginVertical: 17 }} /><View style={{ flexDirection: 'row' }}>{match.inningsNumber === 2 ? <><Stat label="CRR" value={currentRunRate} /><Stat label="TARGET" value={match.target} /><Stat label="REQUIRED" value={`${runsRequired} off ${ballsRemaining}`} /></> : <><Stat label="OVERS" value={`${match.overs} / ${match.totalOvers || 20}`} /><Stat label={match.status === 'INNINGS_BREAK' ? 'TARGET' : 'INNINGS'} value={match.status === 'INNINGS_BREAK' ? match.target : match.status === 'LIVE' ? '1ST' : 'COMPLETE'} /><Stat label="BOWLER" value={match.bowler.name} /></>}</View>
    </LinearGradient>
    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
        <Text style={{ color: '#17221D', fontWeight: '800', fontSize: 17 }}>Batting</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Text style={{ color: '#87928A', fontSize: 10 }}>{match.inningsNumber === 2 ? '2ND INNINGS' : '1ST INNINGS'}</Text>
          <Pressable
            onPress={() => setShowRetireModal(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: '#F3F6F3',
              paddingHorizontal: 7,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#E2E8E4',
            }}
          >
            <Ionicons name="body-outline" size={11} color="#526057" />
            <Text style={{ color: '#526057', fontSize: 10, fontWeight: '700' }}>Retire</Text>
          </Pressable>
          <Pressable
            onPress={() => onUpdate('swapStrike')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#E8F5EF',
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#BFE4D3',
            }}
          >
            <Ionicons name="swap-horizontal" size={12} color="#187B62" />
            <Text style={{ color: '#187B62', fontSize: 10, fontWeight: '700' }}>Rotate strike</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StrikerIndicator size={12} />
            <Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>On strike</Text>
          </View>
        </View>
      </View><View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#EDF0ED', overflow: 'hidden' }}><View style={{ flexDirection: 'row', padding: 12, backgroundColor: '#F4F7F4' }}><Text style={{ flex: 1.6, color: '#78857C', fontSize: 9, fontWeight: '700' }}>BATTER</Text>{['R', 'B', '4s', '6s', 'SR'].map((v) => <Text key={v} style={{ width: 34, textAlign: 'right', color: '#78857C', fontSize: 9, fontWeight: '700' }}>{v}</Text>)}</View>{match.batters.map((batter) => {
      const cardEntry = match.battingCard?.find((b) => b.name === batter.name);
      const fours = cardEntry?.fours ?? batter.fours ?? 0;
      const sixes = cardEntry?.sixes ?? batter.sixes ?? 0;
      const sr = batter.balls ? ((batter.runs || 0) * 100 / batter.balls).toFixed(1) : '0.0';
      return <View key={batter.name} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderColor: '#F0F2F0' }}>
        <View style={{ flex: 1.6, flexDirection: 'row', alignItems: 'center' }}>
          {batter.onStrike && <StrikerIndicator size={13} />}
          <Text numberOfLines={1} style={{ flex: 1, color: '#253129', fontSize: 11, fontWeight: batter.onStrike ? '800' : '600' }}>{batter.name}</Text>
          {batter.runs >= 100 ? (
            <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 4 }}>
              <Text style={{ color: '#B45309', fontSize: 8, fontWeight: '800' }}>👑 100</Text>
            </View>
          ) : batter.runs >= 50 ? (
            <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 4 }}>
              <Text style={{ color: '#065F46', fontSize: 8, fontWeight: '800' }}>⭐ 50</Text>
            </View>
          ) : null}
        </View>
        {[batter.runs, batter.balls, fours, sixes, sr].map((v, i) => <Text key={i} style={{ width: 34, textAlign: 'right', color: i === 0 ? '#253129' : '#6F7B73', fontSize: 10, fontWeight: i === 0 ? '800' : '500' }}>{v}</Text>)}
      </View>;
    })}
    {match.battingCard?.some((b) => b.dismissed || b.howOut) && (
      <View style={{ paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FAFBF9', borderTopWidth: 1, borderTopColor: '#F0F2F0' }}>
        <Text style={{ color: '#87928A', fontSize: 9, fontWeight: '800', letterSpacing: 0.6, marginBottom: 5 }}>FALLEN WICKETS & RETIREMENTS</Text>
        {match.battingCard.filter((b) => b.dismissed || b.howOut).map((b) => (
          <View key={b.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 }}>
            <Text style={{ color: '#253129', fontSize: 10, fontWeight: '700' }}>{b.name}</Text>
            <Text style={{ color: b.howOut === 'retired hurt' ? '#187B62' : '#C6533C', fontSize: 9, fontWeight: '600' }}>{b.howOut || 'Out'} <Text style={{ color: '#87928A' }}>({b.runs}r, {b.balls}b)</Text></Text>
          </View>
        ))}
      </View>
    )}
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 21, marginBottom: 12 }}><Text style={{ color: '#17221D', fontWeight: '800', fontSize: 17 }}>{latestOver && !latestOver.complete ? 'This over' : 'Upcoming over'}</Text><Text style={{ color: '#87928A', fontSize: 11 }}>Bowler  -  {match.bowler.name}</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>{currentOverBalls.length ? currentOverBalls.slice(-6).map((ball, i) => <View key={`${i}-${ball}`} style={{ width: 34, height: 34, borderRadius: 18, borderWidth: 1, borderColor: ball === '4' || ball === '6' ? '#D9EEE4' : '#E8ECE8', backgroundColor: ball === '4' || ball === '6' ? '#E9F4EE' : 'white', alignItems: 'center', justifyContent: 'center' }}><BallResult label={ball} color="#35443B" /></View>) : <Text style={{ color: '#87928A', fontSize: 11 }}>Over about to begin</Text>}<Text style={{ color: '#87928A', fontSize: 10, marginLeft: 3 }}>{match.overs}</Text></View>
    <View style={{ marginTop: 22 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}><Text style={{ color: '#17221D', fontWeight: '800', fontSize: 17 }}>Over history</Text>{history.length > 2 && <Pressable onPress={() => setShowAllOvers((value) => !value)}><Text style={{ color: '#187B62', fontWeight: '700', fontSize: 10 }}>{showAllOvers ? 'Show recent' : 'View all'}</Text></Pressable>}</View>{history.length === 0 ? <View style={{ backgroundColor: '#F3F6F3', borderRadius: 14, padding: 13 }}><Text style={{ color: '#78857C', fontSize: 11 }}>Over-by-over details will appear here as you record balls.</Text></View> : visibleOvers.map((over) => <View key={over.over} style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#EDF0ED', borderRadius: 15, padding: 12, marginBottom: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text numberOfLines={1} style={{ flex: 1, color: '#253129', fontSize: 11, fontWeight: '800' }}>OVER {over.over} ({over.bowler}){over.complete ? '' : '  -  IN PROGRESS'}</Text><Text style={{ color: '#526057', fontSize: 10, fontWeight: '700', marginLeft: 8 }}>{over.runs} runs  -  {over.wickets} wickets</Text></View><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 9 }}>{over.balls.map((ball, index) => <View key={`${over.over}-${index}`} style={{ width: 27, height: 27, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: ball.label === '4' || ball.label === '6' ? '#E9F4EE' : ball.wicket ? '#FCECE8' : '#F2F5F2' }}><BallResult label={ball.label} color={ball.wicket ? '#C6533C' : '#425047'} /></View>)}</View></View>)}</View>    <View style={{ marginTop: 20, borderRadius: 16, padding: 14, backgroundColor: '#F3F6F3', flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#78857C', fontSize: 9, fontWeight: '700' }}>CURRENT BOWLER</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Text style={{ color: '#253129', fontWeight: '700', fontSize: 12 }}>{match.bowler.name}</Text>
          {match.bowler.wickets >= 5 ? (
            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 5 }}>
              <Text style={{ color: '#991B1B', fontSize: 8, fontWeight: '800' }}>💥 5W</Text>
            </View>
          ) : match.bowler.wickets >= 3 ? (
            <View style={{ backgroundColor: '#FFEDD5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 5 }}>
              <Text style={{ color: '#9A3412', fontSize: 8, fontWeight: '800' }}>🔥 3W</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Text style={{ color: '#253129', fontWeight: '800', fontSize: 12 }}>{match.bowler.wickets}/{match.bowler.runs}</Text>
      <Text style={{ color: '#78857C', fontSize: 10, marginLeft: 7 }}>({match.bowler.overs})</Text>
    </View>
    {match.inningsNumber === 2 && match.firstInnings && <View style={{ marginTop: 18, borderRadius: 15, padding: 13, backgroundColor: '#EAF3ED' }}><Text style={{ color: '#187B62', fontSize: 9, fontWeight: '800' }}>FIRST INNINGS</Text><Text style={{ color: '#253129', fontSize: 12, fontWeight: '700', marginTop: 5 }}>{match.firstInnings.team}  -  {match.firstInnings.score}/{match.firstInnings.wickets} ({match.firstInnings.overs} ov)</Text>{(match.status === 'AWAITING_END' || match.status === 'COMPLETED') && <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '800', marginTop: 6 }}>{match.result}</Text>}</View>}
    {match.status === 'INNINGS_BREAK' && <View style={{ marginTop: 19, borderRadius: 17, backgroundColor: '#EAF3ED', padding: 15 }}><Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>FIRST INNINGS COMPLETE</Text><Text style={{ color: '#253129', fontSize: 13, fontWeight: '700', marginTop: 5 }}>{match.home.name} made {match.score}/{match.wickets} in {match.overs} overs.</Text><Text style={{ color: '#536057', fontSize: 11, marginTop: 4 }}>Target for {match.away.name}: {match.target} runs</Text><Pressable onPress={() => setShowSecondInningsSetup(true)} style={{ marginTop: 12, minHeight: 43, borderRadius: 13, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Choose second innings line-up</Text></Pressable></View>}
    </View>
  </ScrollView><View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#E8ECE8' }}>{match.status === 'LIVE' ? <><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: '#17221D', fontWeight: '800', fontSize: 16 }}>Scoring controls</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Pressable onPress={() => onUpdate('swapStrike')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="swap-horizontal" size={14} color="#187B62" /><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Rotate strike</Text></Pressable><Pressable onPress={() => onUpdate('undo')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Ionicons name="arrow-undo" size={14} color="#187B62" /><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Undo</Text></Pressable></View></View><View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>{[0, 1, 2, 3, 4, 6].map((runs) => <Pressable onPress={() => { if (runs === 4 || runs === 6) { setShotPrompt({ runs }); } else { onUpdate(runs); } }} key={runs} style={{ flex: 1, height: 42, borderRadius: 13, backgroundColor: runs === 4 || runs === 6 ? '#187B62' : 'white', borderWidth: runs === 4 || runs === 6 ? 0 : 1, borderColor: '#E6EBE7', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: runs === 4 || runs === 6 ? 'white' : '#253129', fontSize: 15, fontWeight: '800' }}>{runs}</Text></Pressable>)}</View><View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
  {[
    { label: 'Wicket', bg: '#FCECE8', border: '#F4D2C9', text: '#C6533C' },
    { label: 'Wide', bg: '#F2F5F2', border: '#E4ECE5', text: '#3E4E44' },
    { label: 'No ball', bg: '#FEF5E7', border: '#FCE2B6', text: '#B86200' },
    { label: 'Retire', bg: '#EDEFEA', border: '#D5DDD7', text: '#3E4E44' },
  ].map((btn) => (
    <Pressable
      key={btn.label}
      onPress={() => {
        if (btn.label === 'Wicket') setShowWicketModal(true);
        else if (btn.label === 'No ball') setShowNoBallModal(true);
        else if (btn.label === 'Retire') setShowRetireModal(true);
        else onUpdate(btn.label);
      }}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: btn.bg,
        borderWidth: 1,
        borderColor: btn.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 11, color: btn.text, fontWeight: '800' }}>
        {btn.label}
      </Text>
    </Pressable>
  ))}
</View></> : match.status === 'INNINGS_BREAK' ? <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: '#17221D', fontWeight: '800', fontSize: 15 }}>Innings break</Text><Pressable onPress={() => onUpdate('undo')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Ionicons name="arrow-undo" size={14} color="#187B62" /><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Undo last ball</Text></Pressable></View><Pressable onPress={() => setShowSecondInningsSetup(true)} style={{ minHeight: 46, borderRadius: 14, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>Set up second innings</Text></Pressable></View> : match.status === 'AWAITING_END' ? (() => {
  const potmCalc = calculatePlayerOfMatch(match);
  const potmName = match.playerOfMatch || potmCalc?.bestPlayer?.name || 'Player of the match';
  const potmSummary = match.potmSummary || potmCalc?.bestPlayer?.summary || 'Match winning performance';
  const potmPoints = match.potmPoints || potmCalc?.bestPlayer?.points || 0;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: '#17221D', fontWeight: '800', fontSize: 15 }}>Match complete</Text>
        <Pressable onPress={() => onUpdate('undo')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Ionicons name="arrow-undo" size={14} color="#187B62" />
          <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Undo last ball</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => setShowVictoryModal(true)}
        style={{
          minHeight: 46,
          borderRadius: 14,
          backgroundColor: '#B86200',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 16 }}>🎉</Text>
        <Text style={{ color: 'white', fontSize: 13, fontWeight: '900' }}>Pop Victory Celebration 🏆</Text>
        <Text style={{ fontSize: 16 }}>🎉</Text>
      </Pressable>

      <View style={{ backgroundColor: '#103C2E', borderRadius: 16, padding: 13 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFFFFF18', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
            <Ionicons name="trophy" size={17} color="#F5BE47" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#A9C3B8', fontSize: 9, fontWeight: '800', letterSpacing: 0.8 }}>
              PLAYER OF THE MATCH (AUTOMATIC)
            </Text>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '900', marginTop: 1 }}>
              {potmName}
            </Text>
          </View>
          {potmPoints > 0 ? (
            <View style={{ backgroundColor: '#FFFFFF18', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: '#F5BE47', fontSize: 10, fontWeight: '800' }}>{Math.round(potmPoints)} pts</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: '#D6E4DC', fontSize: 11 }}>{potmSummary}</Text>
      </View>

      <Pressable onPress={() => onEndMatch(potmName)} style={{ minHeight: 45, borderRadius: 14, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>Confirm & End Match</Text>
      </Pressable>

      <Pressable onPress={() => setShowPlayerOfMatch(true)} style={{ paddingVertical: 4, alignItems: 'center' }}>
        <Text style={{ color: '#68756C', fontSize: 11, fontWeight: '600', textDecorationLine: 'underline' }}>Or manually choose different player</Text>
      </Pressable>
    </View>
  );
})() : <View style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#187B62', fontSize: 12, fontWeight: '800' }}>{match.result}</Text></View>}</View>
    <WicketModal visible={showWicketModal} match={match} onClose={() => setShowWicketModal(false)} onConfirm={onUpdate} />
    <NoBallModal visible={showNoBallModal} match={match} onClose={() => setShowNoBallModal(false)} onConfirm={onUpdate} />
    <RetireModal visible={showRetireModal} match={match} onClose={() => setShowRetireModal(false)} onConfirm={onUpdate} />
    <ShotDirectionModal visible={Boolean(shotPrompt)} runs={shotPrompt?.runs} onClose={() => setShotPrompt(null)} onSelect={(dir) => { if (dir) { onUpdate({ type: 'Run', runs: shotPrompt.runs, shotDirection: dir }); } else { onUpdate(shotPrompt.runs); } setShotPrompt(null); }} />
    <VictoryCelebrationModal visible={showVictoryModal} match={match} onClose={() => setShowVictoryModal(false)} onEndMatch={(p) => { setShowVictoryModal(false); onEndMatch(p); }} />
    <PlayerPrompt visible={Boolean(match.pendingBatterSelection)} title="Choose next batter" subtitle="Select who will take the striker's end." players={availableBatters} color={batting.color} onSelect={onSelectBatter} />
    <PlayerPrompt visible={Boolean(match.pendingBowlerSelection && !match.pendingBatterSelection)} title="Choose next bowler" subtitle={`Over complete. Select a bowler for ${bowling.name}.`} players={availableBowlers} color={bowling.color} stats={match.bowlingStats} onSelect={onSelectBowler} />
    <PlayerPrompt visible={showPlayerOfMatch} title="Choose Player of the Match" subtitle={match.result || 'Select the standout player.'} players={[...new Set([...(match.battingPlayers || []), ...(match.bowlingPlayers || [])])]} color="#187B62" onSelect={(player) => { setShowPlayerOfMatch(false); onEndMatch(player); }} />
    <SecondInningsPrompt visible={showSecondInningsSetup} battingTeam={bowling} bowlingTeam={batting} battingPlayers={match.bowlingPlayers || []} bowlingPlayers={match.battingPlayers || []} onClose={() => setShowSecondInningsSetup(false)} onStart={(lineup) => { setShowSecondInningsSetup(false); onStartSecondInnings(lineup); }} />
  </View>;
}
