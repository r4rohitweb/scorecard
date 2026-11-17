import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, shareToWhatsApp } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '../theme/native';
import { getTeam } from '../data/mockData';
import { Pill, TeamMark, DeliveryBall } from '../components/UI';
import { calculatePlayerOfMatch, generateWhatsAppSummary } from '../data/statsHelper';
import {
  CommentarySettings,
  loadCommentarySettings,
  saveCommentarySettings,
  playSound,
  generateCommentaryPhrase,
  speakCommentary,
  stopSpeaking,
} from '../services/audioCommentary';

function Stat({ label, value, sub }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 14,
        paddingVertical: 9,
        paddingHorizontal: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        alignItems: 'center',
        marginHorizontal: 3,
      }}
    >
      <Text style={{ color: '#9EC2B4', fontSize: 9, letterSpacing: 0.8, fontWeight: '800' }}>
        {label}
      </Text>
      <Text numberOfLines={1} style={{ color: 'white', fontSize: 15, fontWeight: '900', marginTop: 3 }}>
        {value}
      </Text>
      {sub ? <Text style={{ color: '#C0D5CB', fontSize: 9, marginTop: 1 }}>{sub}</Text> : null}
    </View>
  );
}
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
                { r: 1, label: match.batters?.length === 1 ? '1 (Disabled)' : '1 Run' },
                { r: 2, label: '2 Runs' },
                { r: 3, label: match.batters?.length === 1 ? '3 (Disabled)' : '3 Runs' },
                { r: 4, label: '4 (Four)' },
                { r: 6, label: '6 (Six)' },
              ].map((opt) => {
                const isSolo = match.batters?.length === 1;
                const disabled = isSolo && (opt.r === 1 || opt.r === 3);
                const active = batRuns === opt.r;
                return (
                  <Pressable
                    key={opt.r}
                    disabled={disabled}
                    onPress={() => setBatRuns(opt.r)}
                    style={{
                      flexBasis: '31%',
                      flexGrow: 1,
                      paddingVertical: 12,
                      alignItems: 'center',
                      borderRadius: 13,
                      backgroundColor: disabled ? '#F3F5F4' : active ? '#187B62' : 'white',
                      borderWidth: 1,
                      borderColor: disabled ? '#E2E6E3' : active ? '#187B62' : '#E7ECE7',
                      opacity: disabled ? 0.35 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: disabled ? '#8E9B92' : active ? 'white' : '#253129',
                        fontSize: 12,
                        fontWeight: '800',
                        textDecorationLine: disabled ? 'line-through' : 'none',
                      }}
                    >
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

function CommentaryModal({ visible, onClose, settings, onUpdateSettings }) {
  if (!visible) return null;

  const testVoice = () => {
    playSound('six');
    const sample = settings.language === 'hi'
      ? 'Chakka! Rohit ne mara shaandaar six! Live commentary active hai!'
      : 'Six! Rohit launches it into the stands! Live commentary is active!';
    speakCommentary(sample, { language: settings.language });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '85%' }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#EAF4EF', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="mic" size={22} color="#187B62" />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#17221D' }}>Audio Commentary & SFX</Text>
                <Text style={{ fontSize: 11, color: '#78857C', marginTop: 1 }}>Live voice announcements & match sounds</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: '#F3F5F4', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="#526057" />
            </Pressable>
          </View>

          {/* Voice Commentary Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EDF1EE' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#17221D' }}>🎙️ Voice Commentary</Text>
              <Text style={{ fontSize: 11, color: '#78857C', marginTop: 2 }}>Speaks ball-by-ball score, boundaries & wickets</Text>
            </View>
            <Pressable
              onPress={() => onUpdateSettings({ voiceEnabled: !settings.voiceEnabled })}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: settings.voiceEnabled ? '#187B62' : '#D1D5DB',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'white',
                alignSelf: settings.voiceEnabled ? 'flex-end' : 'flex-start',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2,
              }} />
            </Pressable>
          </View>

          {/* Sound Effects Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EDF1EE' }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#17221D' }}>🔊 Match Sound Effects</Text>
              <Text style={{ fontSize: 11, color: '#78857C', marginTop: 2 }}>Crisp bat crack, crowd cheers & umpire whistles</Text>
            </View>
            <Pressable
              onPress={() => onUpdateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: settings.soundEffectsEnabled ? '#187B62' : '#D1D5DB',
                justifyContent: 'center',
                paddingHorizontal: 3,
              }}
            >
              <View style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'white',
                alignSelf: settings.soundEffectsEnabled ? 'flex-end' : 'flex-start',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2,
              }} />
            </Pressable>
          </View>

          {/* Commentary Language */}
          <View style={{ paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EDF1EE' }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#17221D', marginBottom: 4 }}>
              🌐 Commentary Language
            </Text>
            <Text style={{ fontSize: 11, color: '#78857C', marginBottom: 12 }}>
              Choose your commentary tone & dialect
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={() => onUpdateSettings({ language: 'hi' })}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: settings.language === 'hi' ? '#EAF4EF' : '#F8F9F8',
                  borderWidth: 1.5,
                  borderColor: settings.language === 'hi' ? '#187B62' : '#E2E6E3',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: settings.language === 'hi' ? '#187B62' : '#4B5563' }}>
                  🇮🇳 Hindi / Hinglish
                </Text>
                <Text style={{ fontSize: 10, color: '#78857C', marginTop: 2 }}>"Chauka! Shaandaar shot!"</Text>
              </Pressable>

              <Pressable
                onPress={() => onUpdateSettings({ language: 'en' })}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: 14,
                  backgroundColor: settings.language === 'en' ? '#EAF4EF' : '#F8F9F8',
                  borderWidth: 1.5,
                  borderColor: settings.language === 'en' ? '#187B62' : '#E2E6E3',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: settings.language === 'en' ? '#187B62' : '#4B5563' }}>
                  🇬🇧 English
                </Text>
                <Text style={{ fontSize: 10, color: '#78857C', marginTop: 2 }}>"Four! Driven crisply!"</Text>
              </Pressable>
            </View>
          </View>

          {/* Test Voice & Done Buttons */}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
            <Pressable
              onPress={testVoice}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#F3F5F4',
                borderWidth: 1,
                borderColor: '#D8DDD9',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Ionicons name="volume-high" size={17} color="#17221D" />
              <Text style={{ color: '#17221D', fontSize: 12, fontWeight: '800' }}>Test Voice</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 14,
                backgroundColor: '#187B62',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>Done</Text>
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
  const [commentarySettings, setCommentarySettings] = useState(CommentarySettings);
  const [showCommentaryModal, setShowCommentaryModal] = useState(false);
  const [latestCommentary, setLatestCommentary] = useState('');

  React.useEffect(() => {
    loadCommentarySettings().then(setCommentarySettings);
  }, []);

  const updateSettings = async (partial) => {
    const next = await saveCommentarySettings(partial);
    setCommentarySettings({ ...next });
  };

  React.useEffect(() => {
    if (match.status === 'AWAITING_END') {
      setShowVictoryModal(true);
      playSound('victory');
      const phrase = generateCommentaryPhrase({
        type: 'victory',
        winningTeam: match.result?.split(' won')?.[0] || 'Winner',
        margin: match.result?.split('by ')?.[1] || '',
        language: commentarySettings.language,
      });
      if (phrase) {
        setLatestCommentary(phrase);
        speakCommentary(phrase, { language: commentarySettings.language });
      }
    }
  }, [match.status]);

  const handleScore = (action) => {
    const striker = match.batters?.find((b) => b.onStrike) || match.batters?.[0];
    const strikerName = striker?.name || 'Batter';
    const bowlerName = match.bowler?.name || 'Bowler';
    const strikerRuns = striker?.runs || 0;

    let soundType = 'batHit';
    let commentaryType = 'run';
    let runs = 0;
    let shotDir = null;
    let howOut = null;
    let milestone = null;

    if (typeof action === 'number') {
      runs = action;
      if (runs === 4) soundType = 'four';
      else if (runs === 6) soundType = 'six';
      else soundType = 'batHit';

      if (strikerRuns < 50 && strikerRuns + runs >= 50) milestone = 50;
      else if (strikerRuns < 100 && strikerRuns + runs >= 100) milestone = 100;
    } else if (typeof action === 'object') {
      if (action.type === 'Run') {
        runs = action.runs || 0;
        shotDir = action.shotDirection;
        if (runs === 4) soundType = 'four';
        else if (runs === 6) soundType = 'six';
        else soundType = 'batHit';

        if (strikerRuns < 50 && strikerRuns + runs >= 50) milestone = 50;
        else if (strikerRuns < 100 && strikerRuns + runs >= 100) milestone = 100;
      } else if (action.type === 'Wicket') {
        soundType = 'wicket';
        commentaryType = 'wicket';
        howOut = action.dismissalType || 'out';
      } else if (action.type === 'Retire') {
        soundType = 'batHit';
        commentaryType = 'retire';
      } else if (action.type === 'NoBall') {
        soundType = 'noBall';
        commentaryType = 'noBall';
      }
    } else if (action === 'Wide') {
      soundType = 'wide';
      commentaryType = 'wide';
    } else if (action === 'No ball') {
      soundType = 'noBall';
      commentaryType = 'noBall';
    } else if (action === 'undo') {
      stopSpeaking();
      onUpdate(action);
      return;
    } else if (action === 'swapStrike') {
      onUpdate(action);
      return;
    }

    playSound(soundType);

    let phrase = '';
    if (milestone) {
      phrase = generateCommentaryPhrase({
        type: 'milestone',
        milestone,
        strikerName,
        language: commentarySettings.language,
      });
      setTimeout(() => playSound('fanfare'), 220);
    } else {
      phrase = generateCommentaryPhrase({
        type: commentaryType,
        runs,
        shotDirection: shotDir,
        strikerName,
        bowlerName,
        howOut,
        language: commentarySettings.language,
      });
    }

    if (phrase) {
      setLatestCommentary(phrase);
      speakCommentary(phrase, { language: commentarySettings.language });
    }

    onUpdate(action);
  };
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
    <LinearGradient colors={['#0C382A', '#061F17']} style={{ padding: 20, paddingBottom: 22, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}>
      {/* Top action row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <Pressable
          onPress={onBack}
          style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={18} color="white" />
        </Pressable>
        
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' }}>
          <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: match.status === 'LIVE' ? '#4ADE80' : '#F59E0B' }} />
          <Text style={{ color: 'white', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 }}>
            {match.status === 'INNINGS_BREAK' ? 'INNINGS BREAK' : match.status === 'AWAITING_END' ? 'RESULT' : match.status === 'COMPLETED' ? 'COMPLETED' : 'LIVE SCORING'}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <Pressable
            onPress={() => setShowCommentaryModal(true)}
            style={{
              height: 38,
              paddingHorizontal: 9,
              borderRadius: 14,
              backgroundColor: commentarySettings.voiceEnabled ? 'rgba(74, 222, 128, 0.22)' : 'rgba(255, 255, 255, 0.12)',
              borderWidth: 1,
              borderColor: commentarySettings.voiceEnabled ? '#4ADE80' : 'rgba(255, 255, 255, 0.2)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Ionicons
              name={commentarySettings.voiceEnabled ? 'mic' : commentarySettings.soundEffectsEnabled ? 'volume-medium' : 'volume-mute'}
              size={15}
              color={commentarySettings.voiceEnabled ? '#4ADE80' : '#E2ECE6'}
            />
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '900' }}>
              {commentarySettings.language.toUpperCase()}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => shareToWhatsApp(generateWhatsAppSummary(match))}
            style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(37, 211, 102, 0.2)', borderWidth: 1, borderColor: 'rgba(37, 211, 102, 0.4)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="logo-whatsapp" size={19} color="#25D366" />
          </Pressable>
        </View>
      </View>

      <Text style={{ color: '#8FB4A4', fontSize: 10, letterSpacing: 1.1, fontWeight: '800', textAlign: 'center' }}>
        {match.format?.toUpperCase()} • {match.venue?.toUpperCase()}
      </Text>

      {/* Main Scoreboard Display */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
        <View style={{ alignItems: 'center', width: 76 }}>
          <TeamMark team={batting} size={48} />
          <Text numberOfLines={1} style={{ color: 'white', fontWeight: '800', fontSize: 12, marginTop: 6 }}>
            {batting.short}
          </Text>
          <View style={{ backgroundColor: 'rgba(74, 222, 128, 0.2)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, marginTop: 2 }}>
            <Text style={{ color: '#4ADE80', fontSize: 8, fontWeight: '900' }}>BATTING</Text>
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 44, fontWeight: '900', letterSpacing: -1.5 }}>
            {match.score}
            <Text style={{ color: '#82A897', fontSize: 26, fontWeight: '700' }}>/{match.wickets}</Text>
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, marginTop: 2 }}>
            <Text style={{ color: '#D4E6DC', fontSize: 12, fontWeight: '800' }}>
              {match.overs} <Text style={{ color: '#8FB4A4', fontSize: 11, fontWeight: '600' }}>/ {match.totalOvers || 20} ov</Text>
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'center', width: 76 }}>
          <TeamMark team={bowling} size={48} />
          <Text numberOfLines={1} style={{ color: '#C4D5CC', fontWeight: '800', fontSize: 12, marginTop: 6 }}>
            {bowling.short}
          </Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5, marginTop: 2 }}>
            <Text style={{ color: '#A9C3B8', fontSize: 8, fontWeight: '700' }}>BOWLING</Text>
          </View>
        </View>
      </View>

      {/* Stats Container */}
      <View style={{ flexDirection: 'row', marginTop: 18 }}>
        {match.inningsNumber === 2 ? (
          <>
            <Stat label="CRR" value={currentRunRate} />
            <Stat label="TARGET" value={match.target} />
            <Stat label="NEED" value={`${runsRequired}`} sub={`${ballsRemaining}b left`} />
          </>
        ) : (
          <>
            <Stat label="CRR" value={currentRunRate} />
            <Stat label={match.status === 'INNINGS_BREAK' ? 'TARGET' : 'INNINGS'} value={match.status === 'INNINGS_BREAK' ? match.target : '1ST'} />
            <Stat label="BOWLER" value={match.bowler?.name || '-'} />
          </>
        )}
      </View>
    </LinearGradient>
    <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}>
        <Text style={{ color: '#17221D', fontWeight: '800', fontSize: 17 }}>Batting</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Text style={{ color: '#87928A', fontSize: 10 }}>{match.inningsNumber === 2 ? '2ND INNINGS' : '1ST INNINGS'}</Text>
          <Pressable
            onPress={() => onUpdate({ type: 'setLastManBats', value: !match.lastManBats })}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: match.lastManBats ? '#EBF3FF' : '#F3F5F4',
              paddingHorizontal: 7,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: match.lastManBats ? '#BDD8FA' : '#E2E8E4',
            }}
          >
            <Ionicons name="person" size={11} color={match.lastManBats ? '#1E60BF' : '#738278'} />
            <Text style={{ color: match.lastManBats ? '#1E60BF' : '#738278', fontSize: 10, fontWeight: '700' }}>
              {match.lastManBats ? 'Last Man: ON' : 'Last Man: OFF'}
            </Text>
          </Pressable>
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
          {match.batters.length > 1 && (
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
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <StrikerIndicator size={12} />
            <Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>On strike</Text>
          </View>
        </View>
      </View>
      {match.batters.length === 1 && (
        <View
          style={{
            backgroundColor: '#FEF3C7',
            borderWidth: 1,
            borderColor: '#FCD34D',
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 20 }}>🏏</Text>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '800' }}>
                LAST MAN STANDING (Solo Batter)
              </Text>
              <View style={{ backgroundColor: '#D97706', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ color: 'white', fontSize: 8, fontWeight: '800' }}>GULLY RULE</Text>
              </View>
            </View>
            <Text style={{ color: '#B45309', fontSize: 11, marginTop: 2 }}>
              {match.batters[0]?.name} is batting alone. 1 & 3 runs disabled (no running partner). Innings ends on this wicket!
            </Text>
          </View>
        </View>
      )}
      <View style={{ backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: '#EDF0ED', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
        <View style={{ flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#F4F7F4' }}>
          <Text style={{ flex: 1.6, color: '#68756C', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }}>BATTER</Text>
          {['R', 'B', '4s', '6s', 'SR'].map((v) => (
            <Text key={v} style={{ width: 34, textAlign: 'right', color: '#68756C', fontSize: 10, fontWeight: '800' }}>
              {v}
            </Text>
          ))}
        </View>
        {match.batters.map((batter) => {
          const cardEntry = match.battingCard?.find((b) => b.name === batter.name);
          const fours = cardEntry?.fours ?? batter.fours ?? 0;
          const sixes = cardEntry?.sixes ?? batter.sixes ?? 0;
          const sr = batter.balls ? ((batter.runs || 0) * 100 / batter.balls).toFixed(1) : '0.0';
          const isOnStrike = batter.onStrike;
          return (
            <View
              key={batter.name}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 12,
                borderTopWidth: 1,
                borderColor: '#F0F2F0',
                backgroundColor: isOnStrike ? '#F0F9F5' : 'white',
                borderLeftWidth: isOnStrike ? 3.5 : 0,
                borderLeftColor: '#187B62',
              }}
            >
              <View style={{ flex: 1.6, flexDirection: 'row', alignItems: 'center' }}>
                {isOnStrike && (
                  <View style={{ backgroundColor: '#187B62', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, marginRight: 6 }}>
                    <Text style={{ color: 'white', fontSize: 8, fontWeight: '900' }}>STRIKE</Text>
                  </View>
                )}
                <Text numberOfLines={1} style={{ flex: 1, color: '#1B2921', fontSize: 12, fontWeight: isOnStrike ? '900' : '700' }}>
                  {batter.name}
                </Text>
                {(batter.solo || match.batters.length === 1) && (
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, marginLeft: 4 }}>
                    <Text style={{ color: '#B45309', fontSize: 8, fontWeight: '900' }}>SOLO</Text>
                  </View>
                )}
                {batter.runs >= 100 ? (
                  <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, marginLeft: 4 }}>
                    <Text style={{ color: '#B45309', fontSize: 8, fontWeight: '900' }}>👑 100</Text>
                  </View>
                ) : batter.runs >= 50 ? (
                  <View style={{ backgroundColor: '#D1FAE5', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, marginLeft: 4 }}>
                    <Text style={{ color: '#065F46', fontSize: 8, fontWeight: '900' }}>⭐ 50</Text>
                  </View>
                ) : null}
              </View>
              {[batter.runs, batter.balls, fours, sixes, sr].map((v, i) => (
                <Text
                  key={i}
                  style={{
                    width: 34,
                    textAlign: 'right',
                    color: i === 0 ? '#103C2E' : '#6F7B73',
                    fontSize: i === 0 ? 12 : 11,
                    fontWeight: i === 0 ? '900' : '600',
                  }}
                >
                  {v}
                </Text>
              ))}
            </View>
          );
        })}
        {match.battingCard?.some((b) => b.dismissed || b.howOut) && (
          <View style={{ paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#FAFBF9', borderTopWidth: 1, borderTopColor: '#F0F2F0' }}>
            <Text style={{ color: '#78857C', fontSize: 10, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6 }}>
              FALLEN WICKETS & RETIREMENTS
            </Text>
            {match.battingCard.filter((b) => b.dismissed || b.howOut).map((b) => (
              <View key={b.name} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 }}>
                <Text style={{ color: '#253129', fontSize: 11, fontWeight: '700' }}>{b.name}</Text>
                <Text style={{ color: b.howOut === 'retired hurt' ? '#187B62' : '#DC2626', fontSize: 10, fontWeight: '700' }}>
                  {b.howOut || 'Out'} <Text style={{ color: '#87928A', fontWeight: '500' }}>({b.runs}r, {b.balls}b)</Text>
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 12 }}>
        <View>
          <Text style={{ color: '#17221D', fontWeight: '900', fontSize: 17, letterSpacing: -0.3 }}>
            {latestOver && !latestOver.complete ? 'This Over' : 'Upcoming Over'}
          </Text>
          <Text style={{ color: '#78857C', fontSize: 11, marginTop: 1 }}>Bowler • {match.bowler.name}</Text>
        </View>
        <View style={{ backgroundColor: '#F3F5F3', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 }}>
          <Text style={{ color: '#526057', fontSize: 11, fontWeight: '800' }}>{match.overs} ov</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
        {currentOverBalls.length ? (
          currentOverBalls.slice(-6).map((ball, i) => (
            <DeliveryBall key={`${i}-${ball}`} label={ball} size={36} />
          ))
        ) : (
          <View style={{ backgroundColor: '#F3F5F3', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14 }}>
            <Text style={{ color: '#78857C', fontSize: 11, fontWeight: '600' }}>Over about to begin</Text>
          </View>
        )}
      </View>
      <View style={{ marginTop: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
          <Text style={{ color: '#17221D', fontWeight: '900', fontSize: 17, letterSpacing: -0.3 }}>Over History</Text>
          {history.length > 2 && (
            <Pressable onPress={() => setShowAllOvers((value) => !value)} style={{ paddingVertical: 4, paddingHorizontal: 6 }}>
              <Text style={{ color: '#187B62', fontWeight: '800', fontSize: 11 }}>
                {showAllOvers ? 'Show recent' : 'View all'}
              </Text>
            </Pressable>
          )}
        </View>
        {history.length === 0 ? (
          <View style={{ backgroundColor: '#F3F6F3', borderRadius: 16, padding: 14 }}>
            <Text style={{ color: '#78857C', fontSize: 11 }}>Over-by-over details will appear here as you record balls.</Text>
          </View>
        ) : (
          visibleOvers.map((over) => (
            <View
              key={over.over}
              style={{
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#EDF0ED',
                borderRadius: 16,
                padding: 13,
                marginBottom: 9,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 3,
                elevation: 1,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ flex: 1, color: '#253129', fontSize: 12, fontWeight: '800' }}>
                  OVER {over.over} ({over.bowler})
                  {over.complete ? '' : ' • IN PROGRESS'}
                </Text>
                <Text style={{ color: '#526057', fontSize: 11, fontWeight: '800', marginLeft: 8 }}>
                  {over.runs} runs • {over.wickets} wkts
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 }}>
                {over.balls.map((ball, index) => (
                  <DeliveryBall key={`${over.over}-${index}`} label={ball.label} size={28} />
                ))}
              </View>
            </View>
          ))
        )}
      </View>
      <View style={{ marginTop: 20, borderRadius: 18, padding: 15, backgroundColor: 'white', borderWidth: 1, borderColor: '#EDF0ED', flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
        <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: '#EAF4EF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Ionicons name="baseball-outline" size={20} color="#187B62" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#78857C', fontSize: 9, fontWeight: '800', letterSpacing: 0.6 }}>CURRENT BOWLER</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Text style={{ color: '#253129', fontWeight: '800', fontSize: 13 }}>{match.bowler.name}</Text>
            {match.bowler.wickets >= 5 ? (
              <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                <Text style={{ color: '#991B1B', fontSize: 8, fontWeight: '900' }}>💥 5W</Text>
              </View>
            ) : match.bowler.wickets >= 3 ? (
              <View style={{ backgroundColor: '#FFEDD5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 6 }}>
                <Text style={{ color: '#9A3412', fontSize: 8, fontWeight: '900' }}>🔥 3W</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#253129', fontWeight: '900', fontSize: 14 }}>
            {match.bowler.wickets}/{match.bowler.runs}
          </Text>
          <Text style={{ color: '#78857C', fontSize: 10, marginTop: 1, fontWeight: '600' }}>
            ({match.bowler.overs} ov)
          </Text>
        </View>
      </View>
    {match.inningsNumber === 2 && match.firstInnings && <View style={{ marginTop: 18, borderRadius: 15, padding: 13, backgroundColor: '#EAF3ED' }}><Text style={{ color: '#187B62', fontSize: 9, fontWeight: '800' }}>FIRST INNINGS</Text><Text style={{ color: '#253129', fontSize: 12, fontWeight: '700', marginTop: 5 }}>{match.firstInnings.team}  -  {match.firstInnings.score}/{match.firstInnings.wickets} ({match.firstInnings.overs} ov)</Text>{(match.status === 'AWAITING_END' || match.status === 'COMPLETED') && <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '800', marginTop: 6 }}>{match.result}</Text>}</View>}
    {match.status === 'INNINGS_BREAK' && <View style={{ marginTop: 19, borderRadius: 17, backgroundColor: '#EAF3ED', padding: 15 }}><Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>FIRST INNINGS COMPLETE</Text><Text style={{ color: '#253129', fontSize: 13, fontWeight: '700', marginTop: 5 }}>{match.home.name} made {match.score}/{match.wickets} in {match.overs} overs.</Text><Text style={{ color: '#536057', fontSize: 11, marginTop: 4 }}>Target for {match.away.name}: {match.target} runs</Text><Pressable onPress={() => setShowSecondInningsSetup(true)} style={{ marginTop: 12, minHeight: 43, borderRadius: 13, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Choose second innings line-up</Text></Pressable></View>}
    </View>
  </ScrollView>
  <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 24 : 14, borderTopWidth: 1, borderTopColor: '#E8ECE8', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 8 }}>
    {match.status === 'LIVE' ? (
      <>
        {/* Live Commentary Ticker Banner */}
        {latestCommentary ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F0F9F5',
              borderWidth: 1,
              borderColor: '#C6E7D8',
              borderRadius: 12,
              paddingHorizontal: 10,
              paddingVertical: 7,
              marginBottom: 10,
              gap: 8,
            }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="mic" size={12} color="white" />
            </View>
            <Text numberOfLines={1} style={{ flex: 1, color: '#134E3F', fontSize: 11, fontWeight: '700' }}>
              {latestCommentary}
            </Text>
            <Pressable
              onPress={() => {
                stopSpeaking();
                speakCommentary(latestCommentary, { language: commentarySettings.language });
              }}
              style={{ padding: 2 }}
            >
              <Ionicons name="volume-medium" size={16} color="#187B62" />
            </Pressable>
          </View>
        ) : null}

        {/* Controls Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#187B62' }} />
            <Text style={{ color: '#17221D', fontWeight: '900', fontSize: 14, letterSpacing: -0.2 }}>
              Scoring Keypad
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {match.batters.length > 1 && (
              <Pressable
                onPress={() => handleScore('swapStrike')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF4EF', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#D0E6DB' }}
              >
                <Ionicons name="swap-horizontal" size={13} color="#187B62" />
                <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '800' }}>Rotate strike</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => handleScore('undo')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F5F4', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E2E6E3' }}
            >
              <Ionicons name="arrow-undo" size={13} color="#526057" />
              <Text style={{ color: '#526057', fontSize: 11, fontWeight: '800' }}>Undo</Text>
            </Pressable>
          </View>
        </View>

        {/* Runs Numbers Row */}
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {[0, 1, 2, 3, 4, 6].map((runs) => {
            const isSolo = match.batters?.length === 1;
            const disabled = isSolo && (runs === 1 || runs === 3);
            const isFour = runs === 4;
            const isSix = runs === 6;
            return (
              <Pressable
                key={runs}
                disabled={disabled}
                onPress={() => {
                  if (runs === 4 || runs === 6) {
                    setShotPrompt({ runs });
                  } else {
                    handleScore(runs);
                  }
                }}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 14,
                  backgroundColor: disabled
                    ? '#F3F5F4'
                    : isFour
                    ? '#10B981'
                    : isSix
                    ? '#6366F1'
                    : 'white',
                  borderWidth: disabled ? 1 : isFour || isSix ? 0 : 1.5,
                  borderColor: disabled ? '#E2E6E3' : '#E6EBE7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: disabled ? 0.35 : 1,
                  shadowColor: isFour ? '#10B981' : isSix ? '#6366F1' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isFour || isSix ? 0.3 : 0.05,
                  shadowRadius: 3,
                  elevation: isFour || isSix ? 3 : 1,
                }}
              >
                <Text
                  style={{
                    color: disabled
                      ? '#8E9B92'
                      : isFour || isSix
                      ? 'white'
                      : '#1F2937',
                    fontSize: 17,
                    fontWeight: '900',
                    textDecorationLine: disabled ? 'line-through' : 'none',
                  }}
                >
                  {runs}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Solo Batter Hint */}
        {match.batters?.length === 1 && (
          <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#FEF3C7', paddingVertical: 4, borderRadius: 8 }}>
            <Ionicons name="information-circle" size={13} color="#92400E" />
            <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '800' }}>
              1 & 3 runs disabled for solo batter (Gully Cricket)
            </Text>
          </View>
        )}

        {/* Actions Row */}
        <View style={{ flexDirection: 'row', gap: 7, marginTop: 8 }}>
          {[
            { label: 'Wicket', icon: 'flash', bg: '#FEE2E2', border: '#FCA5A5', text: '#DC2626' },
            { label: 'Wide', icon: 'swap-horizontal', bg: '#FEF3C7', border: '#FCD34D', text: '#B45309' },
            { label: 'No ball', icon: 'alert-circle', bg: '#FFEDD5', border: '#FDBA74', text: '#C2410C' },
            { label: 'Retire', icon: 'exit-outline', bg: '#F3F4F6', border: '#E5E7EB', text: '#4B5563' },
          ].map((btn) => (
            <Pressable
              key={btn.label}
              onPress={() => {
                if (btn.label === 'Wicket') setShowWicketModal(true);
                else if (btn.label === 'No ball') setShowNoBallModal(true);
                else if (btn.label === 'Retire') setShowRetireModal(true);
                else handleScore(btn.label);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 13,
                backgroundColor: btn.bg,
                borderWidth: 1.5,
                borderColor: btn.border,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <Ionicons name={btn.icon} size={13} color={btn.text} />
              <Text style={{ color: btn.text, fontWeight: '900', fontSize: 11 }}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>
      </>
    ) : match.status === 'INNINGS_BREAK' ? <View style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ color: '#17221D', fontWeight: '800', fontSize: 15 }}>Innings break</Text><Pressable onPress={() => onUpdate('undo')} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Ionicons name="arrow-undo" size={14} color="#187B62" /><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Undo last ball</Text></Pressable></View><Pressable onPress={() => setShowSecondInningsSetup(true)} style={{ minHeight: 46, borderRadius: 14, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontSize: 12, fontWeight: '800' }}>Set up second innings</Text></Pressable></View> : match.status === 'AWAITING_END' ? (() => {
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
    <WicketModal visible={showWicketModal} match={match} onClose={() => setShowWicketModal(false)} onConfirm={handleScore} />
    <NoBallModal visible={showNoBallModal} match={match} onClose={() => setShowNoBallModal(false)} onConfirm={handleScore} />
    <RetireModal visible={showRetireModal} match={match} onClose={() => setShowRetireModal(false)} onConfirm={handleScore} />
    <ShotDirectionModal visible={Boolean(shotPrompt)} runs={shotPrompt?.runs} onClose={() => setShotPrompt(null)} onSelect={(dir) => { if (dir) { handleScore({ type: 'Run', runs: shotPrompt.runs, shotDirection: dir }); } else { handleScore(shotPrompt.runs); } setShotPrompt(null); }} />
    <VictoryCelebrationModal visible={showVictoryModal} match={match} onClose={() => setShowVictoryModal(false)} onEndMatch={(p) => { setShowVictoryModal(false); onEndMatch(p); }} />
    <CommentaryModal visible={showCommentaryModal} onClose={() => setShowCommentaryModal(false)} settings={commentarySettings} onUpdateSettings={updateSettings} />
    <PlayerPrompt visible={Boolean(match.pendingBatterSelection)} title="Choose next batter" subtitle="Select who will take the striker's end." players={availableBatters} color={batting.color} onSelect={onSelectBatter} />
    <PlayerPrompt visible={Boolean(match.pendingBowlerSelection && !match.pendingBatterSelection)} title="Choose next bowler" subtitle={`Over complete. Select a bowler for ${bowling.name}.`} players={availableBowlers} color={bowling.color} stats={match.bowlingStats} onSelect={onSelectBowler} />
    <PlayerPrompt visible={showPlayerOfMatch} title="Choose Player of the Match" subtitle={match.result || 'Select the standout player.'} players={[...new Set([...(match.battingPlayers || []), ...(match.bowlingPlayers || [])])]} color="#187B62" onSelect={(player) => { setShowPlayerOfMatch(false); onEndMatch(player); }} />
    <SecondInningsPrompt visible={showSecondInningsSetup} battingTeam={bowling} bowlingTeam={batting} battingPlayers={match.bowlingPlayers || []} bowlingPlayers={match.battingPlayers || []} onClose={() => setShowSecondInningsSetup(false)} onStart={(lineup) => { setShowSecondInningsSetup(false); onStartSecondInnings(lineup); }} />
  </View>;
}
