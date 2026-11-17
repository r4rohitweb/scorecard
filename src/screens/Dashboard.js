import React from 'react';
import { Pressable, ScrollView, Text, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from '../theme/native';
import { matches as initialMatches, getTeam } from '../data/mockData';
import { Pill, SectionTitle, TeamMark } from '../components/UI';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getFormattedDate() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

function LiveCard({ match, onPress }) {
  const batting = getTeam(match.home);
  const bowling = getTeam(match.away);
  const [completedOvers, ballsInOver] = (match.overs || '0.0').split('.').map(Number);
  const totalBalls = completedOvers * 6 + ballsInOver;
  const currentRunRate = totalBalls ? (match.score / (totalBalls / 6)).toFixed(2) : '0.00';

  return (
    <Pressable
      onPress={() => onPress(match)}
      style={{
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#103C2E',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 12,
        elevation: 6,
      }}
    >
      <LinearGradient colors={['#0F3E30', '#07241C']} style={{ padding: 20 }}>
        {/* Top Badges */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(230, 109, 81, 0.2)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(230, 109, 81, 0.4)' }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#FF6B4A' }} />
            <Text style={{ color: '#FFB4A2', fontSize: 10, letterSpacing: 1.2, fontWeight: '900' }}>
              LIVE SCORING
            </Text>
          </View>
          <Text style={{ color: '#A9C3B8', fontSize: 11, fontWeight: '700' }}>
            {match.format} • {match.venue}
          </Text>
        </View>

        {/* Teams and Score */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TeamMark team={batting} size={44} />
              <View>
                <Text style={{ color: '#E4EFE8', fontSize: 14, fontWeight: '800' }}>{batting.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 2 }}>
                  <Text style={{ color: 'white', fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>
                    {match.score}
                    <Text style={{ fontSize: 20, color: '#C0D3C9' }}>/{match.wickets}</Text>
                  </Text>
                  <Text style={{ color: '#A9C3B8', fontSize: 12, fontWeight: '700' }}>
                    ({match.overs} ov)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{ alignItems: 'center', paddingLeft: 12 }}>
            <TeamMark team={bowling} size={38} />
            <Text style={{ color: '#CBD8D0', marginTop: 4, fontSize: 11, fontWeight: '700' }}>
              {bowling.short}
            </Text>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginVertical: 14 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View>
              <Text style={{ color: '#8EAFA0', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }}>RUN RATE</Text>
              <Text style={{ color: 'white', fontSize: 13, fontWeight: '800', marginTop: 1 }}>{currentRunRate}</Text>
            </View>
            {match.target && (
              <View>
                <Text style={{ color: '#8EAFA0', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }}>TARGET</Text>
                <Text style={{ color: '#FFD79E', fontSize: 13, fontWeight: '800', marginTop: 1 }}>{match.target}</Text>
              </View>
            )}
            <View>
              <Text style={{ color: '#8EAFA0', fontSize: 9, fontWeight: '700', letterSpacing: 0.6 }}>BOWLER</Text>
              <Text numberOfLines={1} style={{ color: 'white', fontSize: 13, fontWeight: '800', marginTop: 1, maxWidth: 90 }}>
                {match.bowler?.name || 'Opening'}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#187B62', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 }}>
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Score live</Text>
            <Ionicons name="arrow-forward" size={13} color="white" />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function EmptyLiveCard({ onCreateMatch }) {
  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 22,
        padding: 22,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8ECE8',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#EAF4EF', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 26 }}>🏏</Text>
      </View>
      <Text style={{ color: '#17221D', fontSize: 16, fontWeight: '800' }}>Ready for Match Day?</Text>
      <Text style={{ color: '#78857C', fontSize: 12, textAlign: 'center', marginTop: 4, marginBottom: 16, paddingHorizontal: 16 }}>
        Start scoring ball-by-ball with live wagon wheels, gully rules, and automated match reports.
      </Text>
      <Pressable
        onPress={onCreateMatch}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          backgroundColor: '#187B62',
          paddingHorizontal: 18,
          paddingVertical: 11,
          borderRadius: 14,
          shadowColor: '#187B62',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
          elevation: 3,
        }}
      >
        <Ionicons name="add-circle" size={16} color="white" />
        <Text style={{ color: 'white', fontSize: 13, fontWeight: '800' }}>Start New Match</Text>
      </Pressable>
    </View>
  );
}

function UpcomingCard({ match, onPress }) {
  const home = getTeam(match.home);
  const away = getTeam(match.away);
  return (
    <Pressable
      onPress={() => onPress(match)}
      style={{
        backgroundColor: 'white',
        borderRadius: 18,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#EEF1EE',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Pill color="#B45309" bg="#FEF3C7" icon="calendar-outline">
          UPCOMING
        </Pill>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#78857C' }}>{match.time}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 }}>
        <TeamMark team={home} size={38} />
        <Text numberOfLines={1} style={{ flex: 1, color: '#26332C', fontSize: 13, fontWeight: '800', marginLeft: 10 }}>
          {home.name}
        </Text>
        <View style={{ backgroundColor: '#F3F5F3', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginHorizontal: 6 }}>
          <Text style={{ color: '#78857C', fontSize: 10, fontWeight: '800' }}>VS</Text>
        </View>
        <Text numberOfLines={1} style={{ flex: 1, color: '#26332C', fontSize: 13, fontWeight: '800', textAlign: 'right', marginRight: 10 }}>
          {away.name}
        </Text>
        <TeamMark team={away} size={38} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F3F5F3' }}>
        <Text style={{ fontSize: 11, color: '#78857C', fontWeight: '600' }}>
          {match.format} • {match.venue}
        </Text>
        <Ionicons name="chevron-forward" size={14} color="#A3ACA6" />
      </View>
    </Pressable>
  );
}

function Shortcut({ title, detail, icon, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        minHeight: 82,
        backgroundColor: 'white',
        borderRadius: 18,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: '#EEF1EE',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          backgroundColor: `${color}16`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 11,
          borderWidth: 1,
          borderColor: `${color}25`,
        }}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#1B2921', fontSize: 13, fontWeight: '800' }}>{title}</Text>
        <Text numberOfLines={1} style={{ color: '#78857C', fontSize: 10, marginTop: 2, fontWeight: '500' }}>
          {detail}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={14} color="#B5BEB8" />
    </Pressable>
  );
}

export default function Dashboard({ matches = initialMatches, onOpenMatch, onCreateMatch, onLiveScore, onNavigate }) {
  const live = matches.find((match) => match.status === 'LIVE' || match.status === 'INNINGS_BREAK');
  const upcoming = matches.filter((match) => match.status === 'UPCOMING');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 }}>
      {/* Dynamic Greeting Hero */}
      <LinearGradient
        colors={['#EBF5EF', '#F5F9F6']}
        style={{
          borderRadius: 22,
          padding: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 18,
          borderWidth: 1,
          borderColor: '#DDEAE2',
        }}
      >
        <View>
          <Text style={{ color: '#5A6E63', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            {getFormattedDate()}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#102E23', marginTop: 3 }}>
            {getGreeting()}, Scorer 🏏
          </Text>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#187B62', shadowOpacity: 0.15, shadowRadius: 4, elevation: 2 }}>
          <Ionicons name="sunny" size={22} color="#D97706" />
        </View>
      </LinearGradient>

      {/* Quick Action Grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Shortcut
          title="New Match"
          detail="Create & score"
          icon="add-circle"
          color="#187B62"
          onPress={onCreateMatch}
        />
        <Shortcut
          title="Live Center"
          detail={live ? 'Active scoring' : 'No active match'}
          icon="radio"
          color="#DC2626"
          onPress={() => (live ? onOpenMatch(live) : onLiveScore())}
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <Shortcut
          title="Squads"
          detail="Player directory"
          icon="people"
          color="#4F46E5"
          onPress={() => onNavigate('Teams')}
        />
        <Shortcut
          title="History"
          detail="Past scorecards"
          icon="time"
          color="#D97706"
          onPress={() => onNavigate('Matches')}
        />
      </View>

      {/* Live Match Section */}
      <SectionTitle
        title="Live Match"
        subtitle={live ? 'Ball-by-ball in progress' : 'No active game'}
        action="All matches"
        onPress={() => onNavigate('Matches')}
      />
      {live ? <LiveCard match={live} onPress={onOpenMatch} /> : <EmptyLiveCard onCreateMatch={onCreateMatch} />}

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <SectionTitle
            title="Coming Up"
            subtitle="Scheduled fixtures"
            action="View all"
            onPress={() => onNavigate('Matches')}
          />
          {upcoming.map((match) => (
            <UpcomingCard key={match.id} match={match} onPress={onOpenMatch} />
          ))}
        </View>
      )}

      {/* Harbor Cricket League banner */}
      <Pressable
        onPress={() => onNavigate('Teams')}
        style={{
          backgroundColor: '#EAF3ED',
          borderRadius: 20,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          borderWidth: 1,
          borderColor: '#D4E6DC',
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 15, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 }}>
          <Ionicons name="trophy" size={22} color="#187B62" />
        </View>
        <View style={{ flex: 1, marginLeft: 13 }}>
          <Text style={{ color: '#1B2921', fontWeight: '900', fontSize: 14 }}>Harbor Cricket League</Text>
          <Text style={{ color: '#68756C', fontSize: 11, marginTop: 2 }}>Season 2025 • 8 teams competing</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#748078" />
      </Pressable>
    </ScrollView>
  );
}
