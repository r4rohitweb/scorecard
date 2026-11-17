import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { players as initialPlayers, teams, getPlayerInitials, playerColors } from '../data/mockData';
import { SectionTitle, TeamMark } from '../components/UI';
import { computePlayerCareerStats } from '../data/statsHelper';

const roles = ['Batter', 'Bowler', 'All-rounder', 'Wicketkeeper'];

function PlayerModal({ visible, title, initialName = '', initialRole = 'Batter', onClose, onSave }) {
  const [name, setName] = useState(initialName);
  const [role, setRole] = useState(initialRole);

  React.useEffect(() => {
    if (visible) {
      setName(initialName);
      setRole(initialRole);
    }
  }, [visible, initialName, initialRole]);

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter the player name.');
      return;
    }
    onSave({ name: trimmed, role });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#F8F9F6', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, paddingBottom: 30 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <View>
              <Text style={{ color: '#17221D', fontSize: 20, fontWeight: '800' }}>{title}</Text>
              <Text style={{ color: '#818C84', fontSize: 11, marginTop: 3 }}>Permanent player directory</Text>
            </View>
            <Pressable onPress={onClose} style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="#526057" />
            </Pressable>
          </View>

          <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 }}>PLAYER NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Rohit Sharma"
            placeholderTextColor="#A3ACA6"
            style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#E7ECE7', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: '#26332C', fontSize: 14, marginBottom: 18 }}
          />

          <Text style={{ color: '#738078', fontSize: 10, fontWeight: '800', letterSpacing: 0.8, marginBottom: 8 }}>ROLE</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {roles.map((r) => {
              const active = role === r;
              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={{ paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: active ? '#E2EFE8' : 'white', borderWidth: 1, borderColor: active ? '#187B62' : '#E7ECE7' }}
                >
                  <Text style={{ color: active ? '#187B62' : '#536057', fontSize: 11, fontWeight: '700' }}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable onPress={handleSave} style={{ backgroundColor: '#187B62', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Save player</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DeleteModal({ visible, player, onClose, onConfirm }) {
  if (!player) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#F8F9F6', borderRadius: 24, padding: 22, width: '100%', maxWidth: 360, borderWidth: 1, borderColor: '#E7ECE7' }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#FDF1EE', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
            <Ionicons name="trash-outline" size={24} color="#BD5942" />
          </View>
          <Text style={{ color: '#17221D', fontSize: 18, fontWeight: '800', marginBottom: 6 }}>Delete player?</Text>
          <Text style={{ color: '#68756C', fontSize: 13, lineHeight: 19, marginBottom: 20 }}>
            Are you sure you want to permanently remove <Text style={{ fontWeight: '800', color: '#17221D' }}>"{player.name}"</Text> from the clubhouse player directory?
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              onPress={onClose}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EDEFEA', alignItems: 'center' }}
            >
              <Text style={{ color: '#526057', fontWeight: '700', fontSize: 13 }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onConfirm(player);
                onClose();
              }}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#BD5942', alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PlayerStatsModal({ visible, player, stats, onClose }) {
  if (!visible || !player || !stats) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#101A1680', justifyContent: 'flex-end' }}>
        <View style={{ maxHeight: '92%', borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: '#F8F9F6', padding: 22, paddingBottom: 28 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{ width: 48, height: 48, borderRadius: 18, backgroundColor: player.color || '#E5F0EB', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ color: '#253129', fontSize: 16, fontWeight: '800' }}>
                  {player.initials || getPlayerInitials(player.name)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={{ color: '#17221D', fontSize: 18, fontWeight: '900' }}>
                  {player.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                  <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>{player.role || 'Player'}</Text>
                  {stats.potmCount > 0 ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBF2E3', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 }}>
                      <Ionicons name="trophy" size={11} color="#B68236" />
                      <Text style={{ color: '#8F5E15', fontSize: 10, fontWeight: '800', marginLeft: 4 }}>
                        {stats.potmCount} POTM
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ width: 34, height: 34, borderRadius: 12, backgroundColor: '#EDEFEA', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={18} color="#526057" />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* 4-Tile Quick Overview */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'MATCHES', val: stats.matches, color: '#187B62' },
                { label: 'RUNS', val: stats.runs, color: '#17221D' },
                { label: 'STRIKE RATE', val: stats.strikeRate, color: '#C66A3F' },
                { label: 'WICKETS', val: stats.wickets, color: '#32527B' },
              ].map((tile) => (
                <View key={tile.label} style={{ flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#E7ECE7', alignItems: 'center' }}>
                  <Text style={{ color: '#818C84', fontSize: 8, fontWeight: '800', letterSpacing: 0.5 }}>{tile.label}</Text>
                  <Text style={{ color: tile.color, fontSize: 16, fontWeight: '900', marginTop: 4 }}>{tile.val}</Text>
                </View>
              ))}
            </View>

            {/* BATTING CAREER STATS */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E7ECE7', padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="baseball-outline" size={16} color="#187B62" />
                <Text style={{ color: '#17221D', fontSize: 13, fontWeight: '800', marginLeft: 6 }}>Batting statistics</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'Innings batted', val: stats.innings },
                  { label: 'Highest score', val: stats.highestScore },
                  { label: 'Batting average', val: stats.average },
                  { label: 'Balls faced', val: stats.balls },
                  { label: 'Fours (4s)', val: stats.fours },
                  { label: 'Sixes (6s)', val: stats.sixes },
                  { label: '50s / 100s', val: `${stats.fifties} / ${stats.hundreds}` },
                  { label: 'Not outs', val: stats.notOuts },
                ].map((item) => (
                  <View key={item.label} style={{ width: '47%', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F4F7F4' }}>
                    <Text style={{ color: '#87928A', fontSize: 10 }}>{item.label}</Text>
                    <Text style={{ color: '#253129', fontSize: 14, fontWeight: '800', marginTop: 2 }}>{item.val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* BOWLING CAREER STATS */}
            <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E7ECE7', padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="speedometer-outline" size={16} color="#C66A3F" />
                <Text style={{ color: '#17221D', fontSize: 13, fontWeight: '800', marginLeft: 6 }}>Bowling statistics</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {[
                  { label: 'Overs bowled', val: stats.overs },
                  { label: 'Wickets taken', val: stats.wickets },
                  { label: 'Runs conceded', val: stats.runsConceded },
                  { label: 'Economy rate', val: stats.economy },
                  { label: 'Best bowling', val: stats.bestBowling },
                  { label: 'Bowling avg', val: stats.bowlingAverage },
                ].map((item) => (
                  <View key={item.label} style={{ width: '47%', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F4F7F4' }}>
                    <Text style={{ color: '#87928A', fontSize: 10 }}>{item.label}</Text>
                    <Text style={{ color: '#253129', fontSize: 14, fontWeight: '800', marginTop: 2 }}>{item.val}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* MATCH LOG */}
            {stats.recentPerformances?.length > 0 ? (
              <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#E7ECE7', padding: 14, marginBottom: 10 }}>
                <Text style={{ color: '#17221D', fontSize: 13, fontWeight: '800', marginBottom: 10 }}>Match log</Text>
                {stats.recentPerformances.map((perf, idx) => (
                  <View key={idx} style={{ paddingVertical: 8, borderTopWidth: idx > 0 ? 1 : 0, borderTopColor: '#F2F5F2' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#253129', fontSize: 11, fontWeight: '700' }}>{perf.matchName}</Text>
                      {perf.isPotm ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBF2E3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Ionicons name="trophy" size={10} color="#B68236" />
                          <Text style={{ color: '#8F5E15', fontSize: 9, fontWeight: '800', marginLeft: 3 }}>POTM</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={{ color: '#68756C', fontSize: 10, marginTop: 3 }}>
                      {perf.runs > 0 || perf.balls > 0 ? `${perf.runs} runs (${perf.balls}b)` : ''}
                      {perf.wickets > 0 || perf.overs !== '0.0' ? `${perf.runs ? ' • ' : ''}${perf.wickets}/${perf.runsConceded} (${perf.overs} ov)` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>

          <Pressable onPress={onClose} style={{ backgroundColor: '#187B62', paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function Teams({ players = initialPlayers, matches = [], onAddPlayer, onEditPlayer, onDeletePlayer }) {
  const [addVisible, setAddVisible] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedStatsPlayer, setSelectedStatsPlayer] = useState(null);
  const [sortFilter, setSortFilter] = useState('all');

  const primaryClub = teams[0];
  const winRate = primaryClub.played ? Math.round((primaryClub.won / primaryClub.played) * 100) : 0;

  // Enrich each player with comprehensive career stats
  const enrichedPlayers = players.map((player) => ({
    ...player,
    stats: computePlayerCareerStats(player, matches),
  }));

  // Identify Club Leaders
  const topRunScorer = [...enrichedPlayers].sort((a, b) => (b.stats?.runs || 0) - (a.stats?.runs || 0))[0];
  const topWicketTaker = [...enrichedPlayers].sort((a, b) => (b.stats?.wickets || 0) - (a.stats?.wickets || 0))[0];
  const topStrikeRate = [...enrichedPlayers].filter((p) => (p.stats?.balls || 0) >= 10).sort((a, b) => Number(b.stats?.strikeRate || 0) - Number(a.stats?.strikeRate || 0))[0];
  const topPotm = [...enrichedPlayers].sort((a, b) => (b.stats?.potmCount || 0) - (a.stats?.potmCount || 0))[0];

  // Filter/Sort list
  const displayPlayers = [...enrichedPlayers].sort((a, b) => {
    if (sortFilter === 'runs') return (b.stats?.runs || 0) - (a.stats?.runs || 0);
    if (sortFilter === 'wickets') return (b.stats?.wickets || 0) - (a.stats?.wickets || 0);
    if (sortFilter === 'sr') return Number(b.stats?.strikeRate || 0) - Number(a.stats?.strikeRate || 0);
    if (sortFilter === 'potm') return (b.stats?.potmCount || 0) - (a.stats?.potmCount || 0);
    return 0; // 'all' keeps default order
  });

  const confirmDelete = (player) => {
    setDeleteTarget(player);
  };

  const handlePerformDelete = (player) => {
    if (onDeletePlayer && player) {
      onDeletePlayer(player.id || player.name);
    }
  };

  const handleAdd = ({ name, role }) => {
    if (onAddPlayer) onAddPlayer({ name, role });
  };

  const handleEdit = ({ name, role }) => {
    if (editTarget && onEditPlayer) {
      onEditPlayer(editTarget.id || editTarget.name, { name, role });
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 30 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 21 }}>
        <View>
          <Text style={{ fontSize: 25, fontWeight: '800', color: '#17221D' }}>Clubhouse</Text>
          <Text style={{ color: '#818C84', fontSize: 12, marginTop: 5 }}>Manage permanent club roster & player stats</Text>
        </View>
        <Pressable
          onPress={() => setAddVisible(true)}
          style={{ backgroundColor: '#187B62', paddingHorizontal: 14, height: 41, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}
        >
          <Ionicons name="person-add" size={18} color="white" />
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 12 }}>Add player</Text>
        </Pressable>
      </View>

      {/* Club Banner */}
      <View style={{ backgroundColor: '#103C2E', borderRadius: 21, padding: 18, marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#FFFFFF18', borderRadius: 24, padding: 5 }}>
            <TeamMark team={primaryClub} size={46} />
          </View>
          <View style={{ flex: 1, marginLeft: 13 }}>
            <Text style={{ color: '#B9CEC4', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>YOUR CLUB</Text>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', marginTop: 3 }}>{primaryClub.name}</Text>
          </View>
          <Ionicons name="shield-checkmark-outline" color="#B9CEC4" size={19} />
        </View>
        <View style={{ height: 1, backgroundColor: '#FFFFFF24', marginVertical: 15 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#A9C3B8', fontSize: 10 }}>PLAYED</Text>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18, marginTop: 3 }}>{primaryClub.played}</Text>
          </View>
          <View>
            <Text style={{ color: '#A9C3B8', fontSize: 10 }}>WON</Text>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18, marginTop: 3 }}>{primaryClub.won}</Text>
          </View>
          <View>
            <Text style={{ color: '#A9C3B8', fontSize: 10 }}>WIN RATE</Text>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18, marginTop: 3 }}>{winRate}%</Text>
          </View>
          <View>
            <Text style={{ color: '#A9C3B8', fontSize: 10 }}>PLAYERS</Text>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 18, marginTop: 3 }}>{players.length}</Text>
          </View>
        </View>
      </View>

      {/* Club Leaders Showcase */}
      {topRunScorer && (
        <View style={{ backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: '#EEF1EE', padding: 14, marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="trophy-outline" size={17} color="#B68236" />
            <Text style={{ color: '#17221D', fontSize: 12, fontWeight: '800', marginLeft: 6, letterSpacing: 0.5 }}>CLUB STAT LEADERS</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <View style={{ flex: 1, minWidth: '47%', backgroundColor: '#F8F9F6', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: '#818C84', fontSize: 9, fontWeight: '700' }}>🏏 TOP RUNS</Text>
              <Text numberOfLines={1} style={{ color: '#17221D', fontSize: 12, fontWeight: '800', marginTop: 3 }}>{topRunScorer.name}</Text>
              <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '800', marginTop: 1 }}>{topRunScorer.stats?.runs || 0} runs</Text>
            </View>
            <View style={{ flex: 1, minWidth: '47%', backgroundColor: '#F8F9F6', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: '#818C84', fontSize: 9, fontWeight: '700' }}>🎯 TOP WICKETS</Text>
              <Text numberOfLines={1} style={{ color: '#17221D', fontSize: 12, fontWeight: '800', marginTop: 3 }}>{topWicketTaker?.name || '-'}</Text>
              <Text style={{ color: '#32527B', fontSize: 11, fontWeight: '800', marginTop: 1 }}>{topWicketTaker?.stats?.wickets || 0} wickets</Text>
            </View>
            {topStrikeRate && (
              <View style={{ flex: 1, minWidth: '47%', backgroundColor: '#F8F9F6', borderRadius: 12, padding: 10 }}>
                <Text style={{ color: '#818C84', fontSize: 9, fontWeight: '700' }}>⚡ BEST STRIKE RATE</Text>
                <Text numberOfLines={1} style={{ color: '#17221D', fontSize: 12, fontWeight: '800', marginTop: 3 }}>{topStrikeRate.name}</Text>
                <Text style={{ color: '#C66A3F', fontSize: 11, fontWeight: '800', marginTop: 1 }}>{topStrikeRate.stats?.strikeRate} SR</Text>
              </View>
            )}
            {topPotm && (
              <View style={{ flex: 1, minWidth: '47%', backgroundColor: '#F8F9F6', borderRadius: 12, padding: 10 }}>
                <Text style={{ color: '#818C84', fontSize: 9, fontWeight: '700' }}>🏆 MOST POTM AWARDS</Text>
                <Text numberOfLines={1} style={{ color: '#17221D', fontSize: 12, fontWeight: '800', marginTop: 3 }}>{topPotm.name}</Text>
                <Text style={{ color: '#B68236', fontSize: 11, fontWeight: '800', marginTop: 1 }}>{topPotm.stats?.potmCount || 0} awards</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Permanent Player Directory Header & Filter Sort */}
      <SectionTitle
        title="Player Directory & Statistics"
        action="+ New player"
        onPress={() => setAddVisible(true)}
      />

      {/* Filter / Sort pills */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {[
          { key: 'all', label: 'All players' },
          { key: 'runs', label: 'Top runs' },
          { key: 'wickets', label: 'Top wickets' },
          { key: 'sr', label: 'Best strike rate' },
          { key: 'potm', label: 'POTM awards' },
        ].map((tab) => {
          const active = sortFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setSortFilter(tab.key)}
              style={{
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 14,
                backgroundColor: active ? '#187B62' : 'white',
                borderWidth: 1,
                borderColor: active ? '#187B62' : '#E7ECE7',
              }}
            >
              <Text style={{ color: active ? 'white' : '#526057', fontSize: 10, fontWeight: '700' }}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: '#EEF1EE', paddingHorizontal: 14, marginBottom: 24 }}>
        {displayPlayers.length === 0 ? (
          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
            <Text style={{ color: '#818C84', fontSize: 12 }}>No players registered yet.</Text>
            <Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700', marginTop: 6 }}>Tap "+ Add player" to register your first squad member.</Text>
          </View>
        ) : (
          displayPlayers.map((player, i) => {
            const stats = player.stats;
            return (
              <View
                key={player.id || player.name}
                style={{
                  paddingVertical: 12,
                  borderBottomWidth: i < displayPlayers.length - 1 ? 1 : 0,
                  borderBottomColor: '#F0F2F0',
                }}
              >
                {/* Main player row */}
                <Pressable
                  onPress={() => setSelectedStatsPlayer(player)}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                >
                  <View style={{ height: 42, width: 42, borderRadius: 15, backgroundColor: player.color || '#E5F0EB', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#35443B', fontSize: 12, fontWeight: '800' }}>{player.initials || getPlayerInitials(player.name)}</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 11 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text numberOfLines={1} style={{ color: '#253129', fontSize: 13, fontWeight: '700' }}>{player.name}</Text>
                      {stats?.potmCount > 0 ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FBF2E3', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 6 }}>
                          <Ionicons name="trophy" size={9} color="#B68236" />
                          <Text style={{ color: '#8F5E15', fontSize: 8, fontWeight: '800', marginLeft: 2 }}>{stats.potmCount}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text numberOfLines={1} style={{ color: '#8A948D', fontSize: 10, marginTop: 2 }}>{player.role || 'Player'}</Text>
                  </View>

                  {/* Actions: View stats, Edit, Delete */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Pressable
                      onPress={() => setSelectedStatsPlayer(player)}
                      accessibilityLabel={`View stats for ${player.name}`}
                      style={{ paddingHorizontal: 8, height: 30, borderRadius: 8, backgroundColor: '#EAF4EF', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>Stats</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setEditTarget(player)}
                      accessibilityLabel={`Edit ${player.name}`}
                      style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#F0F4F1', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="pencil" size={13} color="#187B62" />
                    </Pressable>

                    <Pressable
                      onPress={() => confirmDelete(player)}
                      accessibilityLabel={`Delete ${player.name}`}
                      style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#FDF1EE', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Ionicons name="trash-outline" size={13} color="#BD5942" />
                    </Pressable>
                  </View>
                </Pressable>

                {/* Sub-row: 4 mini stat badges */}
                <Pressable
                  onPress={() => setSelectedStatsPlayer(player)}
                  style={{ flexDirection: 'row', gap: 6, marginTop: 8, marginLeft: 53 }}
                >
                  <View style={{ backgroundColor: '#F4F7F4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#526057', fontSize: 9, fontWeight: '700' }}>{stats?.matches || 0} <Text style={{ color: '#8A948D' }}>Mat</Text></Text>
                  </View>
                  <View style={{ backgroundColor: '#F4F7F4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#17221D', fontSize: 9, fontWeight: '800' }}>{stats?.runs || 0} <Text style={{ color: '#8A948D' }}>Runs</Text></Text>
                  </View>
                  <View style={{ backgroundColor: '#F4F7F4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#C66A3F', fontSize: 9, fontWeight: '700' }}>SR {stats?.strikeRate || '0.0'}</Text>
                  </View>
                  <View style={{ backgroundColor: '#F4F7F4', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ color: '#32527B', fontSize: 9, fontWeight: '700' }}>{stats?.wickets || 0} <Text style={{ color: '#8A948D' }}>Wkts</Text></Text>
                  </View>
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      {/* League table */}
      <SectionTitle title="League table" />
      <View style={{ backgroundColor: 'white', paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#EEF1EE' }}>
        {teams.map((team, i) => (
          <View key={team.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: i < teams.length - 1 ? 1 : 0, borderBottomColor: '#F0F2F0' }}>
            <Text style={{ width: 22, color: '#8A948D', fontWeight: '700', fontSize: 12 }}>{i + 1}</Text>
            <TeamMark team={team} size={30} />
            <Text style={{ flex: 1, marginLeft: 9, color: '#26332C', fontSize: 12, fontWeight: '700' }}>{team.name}</Text>
            <Text style={{ width: 35, textAlign: 'center', color: '#818C84', fontSize: 11 }}>{team.played}</Text>
            <Text style={{ width: 35, textAlign: 'center', color: '#187B62', fontSize: 12, fontWeight: '800' }}>{team.won}</Text>
          </View>
        ))}
      </View>

      {/* Modals */}
      <PlayerModal
        visible={addVisible}
        title="Add new player"
        onClose={() => setAddVisible(false)}
        onSave={handleAdd}
      />

      <PlayerModal
        visible={Boolean(editTarget)}
        title="Edit player"
        initialName={editTarget?.name || ''}
        initialRole={editTarget?.role || 'Batter'}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
      />

      <DeleteModal
        visible={Boolean(deleteTarget)}
        player={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handlePerformDelete}
      />

      <PlayerStatsModal
        visible={Boolean(selectedStatsPlayer)}
        player={selectedStatsPlayer}
        stats={selectedStatsPlayer?.stats}
        onClose={() => setSelectedStatsPlayer(null)}
      />
    </ScrollView>
  );
}
