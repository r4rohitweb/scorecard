import React from 'react';
import { Pressable, ScrollView, Text, View, shareToWhatsApp } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { getTeam } from '../data/mockData';
import { TeamMark } from '../components/UI';
import { calculateShotBreakdown, generateWhatsAppSummary } from '../data/statsHelper';

const colors = { ink: '#253129', muted: '#78857C', line: '#EDF0ED', green: '#187B62' };

function BattingCard({ innings }) {
  const batters = innings.battingCard?.length ? innings.battingCard : innings.batters || [];
  return <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginTop: 10 }}>
    <View style={{ padding: 13, backgroundColor: '#F3F6F3' }}><Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>Batting</Text></View>
    <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FAFBF9' }}><Text style={{ flex: 1, color: colors.muted, fontSize: 9, fontWeight: '800' }}>BATTER</Text>{['R', 'B', '4s', '6s', 'SR'].map((label) => <Text key={label} style={{ width: 34, textAlign: 'right', color: colors.muted, fontSize: 9, fontWeight: '800' }}>{label}</Text>)}</View>
    {batters.length ? batters.map((batter) => <View key={batter.name} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 11, borderTopWidth: 1, borderColor: '#F0F2F0' }}>
      <View style={{ flex: 1, paddingRight: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 10, fontWeight: '700' }}>{batter.name}</Text>
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
        <Text numberOfLines={1} style={{ color: batter.howOut === 'retired hurt' ? '#187B62' : batter.dismissed ? '#C6533C' : colors.muted, fontSize: 8, marginTop: 3, fontWeight: batter.dismissed ? '600' : '400' }}>{batter.howOut ? batter.howOut : batter.dismissed === true ? 'Out' : batter.dismissed === false ? 'Not out' : 'Status unavailable'}</Text>
      </View>
      {[batter.runs ?? 0, batter.balls ?? 0, batter.fours ?? '-', batter.sixes ?? '-', batter.balls ? ((batter.runs || 0) * 100 / batter.balls).toFixed(1) : '0.0'].map((value, index) => <Text key={index} style={{ width: 34, textAlign: 'right', color: index === 0 ? colors.ink : '#68756C', fontSize: 9, fontWeight: index === 0 ? '800' : '500' }}>{value}</Text>)}
    </View>) : <Text style={{ padding: 14, color: colors.muted, fontSize: 10 }}>Player-by-player batting figures were not recorded for this older match.</Text>}
  </View>;
}

function BowlingCard({ innings }) {
  const bowlers = innings.bowlingStats || {};
  const rows = Object.entries(bowlers);
  return <View style={{ backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: 'hidden', marginTop: 10, marginBottom: 18 }}>
    <View style={{ padding: 13, backgroundColor: '#F3F6F3' }}><Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>Bowling</Text></View>
    <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#FAFBF9' }}><Text style={{ flex: 1, color: colors.muted, fontSize: 9, fontWeight: '800' }}>BOWLER</Text>{['O', 'R', 'W', 'ECON'].map((label) => <Text key={label} style={{ width: 39, textAlign: 'right', color: colors.muted, fontSize: 9, fontWeight: '800' }}>{label}</Text>)}</View>
    {rows.length ? rows.map(([name, stats]) => {
      const legalBalls = stats.legalBalls || 0;
      const wkts = stats.wickets || 0;
      return <View key={name} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderTopWidth: 1, borderColor: '#F0F2F0' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <Text numberOfLines={1} style={{ color: colors.ink, fontSize: 10, fontWeight: '700' }}>{name}</Text>
          {wkts >= 5 ? (
            <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 4 }}>
              <Text style={{ color: '#991B1B', fontSize: 8, fontWeight: '800' }}>💥 5W</Text>
            </View>
          ) : wkts >= 3 ? (
            <View style={{ backgroundColor: '#FFEDD5', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, marginLeft: 4 }}>
              <Text style={{ color: '#9A3412', fontSize: 8, fontWeight: '800' }}>🔥 3W</Text>
            </View>
          ) : null}
        </View>
        {[`${Math.floor(legalBalls / 6)}.${legalBalls % 6}`, stats.runs || 0, stats.wickets || 0, legalBalls ? ((stats.runs || 0) * 6 / legalBalls).toFixed(1) : '0.0'].map((value, index) => <Text key={index} style={{ width: 39, textAlign: 'right', color: index === 2 ? colors.ink : '#68756C', fontSize: 9, fontWeight: index === 2 ? '800' : '500' }}>{value}</Text>)}
      </View>;
    }) : <Text style={{ padding: 14, color: colors.muted, fontSize: 10 }}>Bowling figures were not recorded for this older match.</Text>}
  </View>;
}

function WagonWheelCard({ match }) {
  const { counts, total } = calculateShotBreakdown(match);
  const dirs = [
    { label: 'Off Side', key: 'Off side', icon: 'arrow-up-forward', color: '#187B62', sub: 'Cover / Point' },
    { label: 'Straight', key: 'Straight', icon: 'arrow-up', color: '#2563EB', sub: 'Long Off / Long On' },
    { label: 'Leg Side', key: 'Leg side', icon: 'arrow-up-back', color: '#D97706', sub: 'Mid-Wicket / Leg' },
    { label: 'Behind', key: 'Behind', icon: 'refresh', color: '#DC2626', sub: 'Fine Leg / Third Man' },
  ];

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, marginTop: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#E8F5EF', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
            <Ionicons name="compass-outline" size={18} color="#187B62" />
          </View>
          <View>
            <Text style={{ color: colors.ink, fontWeight: '800', fontSize: 13 }}>Wagon Wheel & Shot Zones</Text>
            <Text style={{ color: colors.muted, fontSize: 9, marginTop: 1 }}>Boundary & shot distribution</Text>
          </View>
        </View>
        {total > 0 && (
          <View style={{ backgroundColor: '#E8F5EF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 }}>
            <Text style={{ color: '#187B62', fontSize: 10, fontWeight: '800' }}>{total} Tagged</Text>
          </View>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {dirs.map((d) => {
          const count = counts[d.key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <View key={d.key} style={{ flexBasis: '47%', flexGrow: 1, backgroundColor: '#F8F9F6', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: '#EDF0ED' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Ionicons name={d.icon} size={15} color={d.color} />
                  <Text style={{ color: colors.ink, fontSize: 11, fontWeight: '700' }}>{d.label}</Text>
                </View>
                <Text style={{ color: d.color, fontSize: 11, fontWeight: '800' }}>{count}</Text>
              </View>
              <Text style={{ color: colors.muted, fontSize: 8, marginTop: 2 }}>{d.sub}</Text>
              <View style={{ height: 5, backgroundColor: '#E5E7EB', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                <View style={{ width: `${pct}%`, height: '100%', backgroundColor: d.color }} />
              </View>
              <Text style={{ color: colors.muted, fontSize: 8, fontWeight: '700', marginTop: 3, textAlign: 'right' }}>{pct}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
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

  const handleShare = () => {
    const summary = generateWhatsAppSummary(match);
    shareToWhatsApp(summary);
  };

  return <View style={{ flex: 1, backgroundColor: '#F8F9F6' }}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Pressable onPress={onBack} style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="arrow-back" size={18} color={colors.ink} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.ink, fontSize: 20, fontWeight: '900' }}>{upcoming ? 'Match details' : 'Match scorecard'}</Text>
            <Text style={{ color: colors.muted, fontSize: 10, marginTop: 3 }}>{match.home?.name || match.home} vs {match.away?.name || match.away}</Text>
          </View>
        </View>

        {!upcoming && (
          <Pressable
            onPress={handleShare}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#25D366',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              gap: 5,
            }}
          >
            <Ionicons name="logo-whatsapp" size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 11 }}>Share</Text>
          </Pressable>
        )}
      </View>

      <View style={{ padding: 16, borderRadius: 18, backgroundColor: 'white', borderWidth: 1, borderColor: colors.line }}>
        <Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>{upcoming ? match.time || 'Match has not started' : match.result || 'Match details'}</Text>
        {upcoming && <Text style={{ color: colors.muted, fontSize: 10, marginTop: 8 }}>Scorecard details will appear here after the match begins.</Text>}
        {match.playerOfMatch && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 11 }}>
            <Ionicons name="trophy" size={15} color="#B68236" />
            <Text style={{ marginLeft: 7, color: colors.muted, fontSize: 10 }}>Player of the Match</Text>
            <Text style={{ flex: 1, textAlign: 'right', color: colors.ink, fontSize: 10, fontWeight: '800' }}>{match.playerOfMatch}</Text>
          </View>
        )}
      </View>

      {!upcoming && <WagonWheelCard match={match} />}

      {!upcoming && innings.map((item, index) => {
        const team = index === 0 ? initialFirstTeam : initialSecondTeam;
        return <Innings key={`${item.label}-${index}`} innings={item} team={getTeam(team)} />;
      })}
    </ScrollView>
  </View>;
}
