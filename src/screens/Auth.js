import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from '../theme/native';
import { Ionicons } from '@expo/vector-icons';

const field = { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5EAE5', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, color: '#26332C', fontSize: 13, marginTop: 9 };
export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const signup = mode === 'signup'; const recover = mode === 'recover';
  const submit = () => {
    if (signup && !name.trim()) { Alert.alert('Enter your name', 'Please provide your full name to create an account.'); return; }
    if (!email.includes('@') || (!recover && password.length < 6)) { Alert.alert('Check your details', recover ? 'Enter a valid email address.' : 'Enter an email and a password with at least 6 characters.'); return; }
    if (recover) { Alert.alert('Check your inbox', `Password reset instructions are ready for ${email}.`); setMode('login'); return; }
    onSuccess();
  };
  return <View style={{ flex: 1, backgroundColor: '#F8F9F6', paddingHorizontal: 25, justifyContent: 'center' }}><View style={{ alignItems: 'center', marginBottom: 30 }}><View style={{ width: 55, height: 55, borderRadius: 19, backgroundColor: '#187B62', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><Ionicons name="radio-button-on" size={27} color="white" /></View><Text style={{ color: '#18362B', fontSize: 29, fontWeight: '900', letterSpacing: -1 }}>pitch<Text style={{ color: '#187B62' }}>.</Text></Text><Text style={{ color: '#849087', fontSize: 12, marginTop: 5 }}>Your cricket, all in one place.</Text></View>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 22, borderWidth: 1, borderColor: '#EDF0ED' }}><Text style={{ color: '#17221D', fontSize: 20, fontWeight: '800' }}>{recover ? 'Reset password' : signup ? 'Create your account' : 'Welcome back'}</Text><Text style={{ color: '#849087', fontSize: 11, marginTop: 5 }}>{recover ? "We will send you a link to get back in." : signup ? 'Join your club and follow the game.' : 'Sign in to continue to your clubhouse.'}</Text>
      {signup && <TextInput placeholder="Full name" placeholderTextColor="#A3ACA6" autoCapitalize="words" value={name} onChangeText={setName} style={field} />}<TextInput placeholder="Email address" placeholderTextColor="#A3ACA6" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} style={field} />{!recover && <TextInput placeholder="Password" placeholderTextColor="#A3ACA6" secureTextEntry value={password} onChangeText={setPassword} style={field} />}
      {!signup && !recover && <Pressable onPress={() => setMode('recover')} style={{ alignSelf: 'flex-end', paddingTop: 11 }}><Text style={{ color: '#187B62', fontSize: 11, fontWeight: '700' }}>Forgot password?</Text></Pressable>}<Pressable onPress={submit} style={{ backgroundColor: '#187B62', padding: 15, borderRadius: 14, alignItems: 'center', marginTop: 18 }}><Text style={{ color: 'white', fontWeight: '800', fontSize: 13 }}>{recover ? 'Send reset link' : signup ? 'Create account' : 'Sign in'}</Text></Pressable>
      <Pressable onPress={() => setMode(recover || signup ? 'login' : 'signup')} style={{ alignItems: 'center', paddingTop: 17 }}><Text style={{ color: '#738078', fontSize: 11 }}>{recover ? 'Back to sign in' : signup ? 'Already have an account? ' : 'New to Pitch? '}<Text style={{ color: '#187B62', fontWeight: '800' }}>{recover ? '' : signup ? 'Sign in' : 'Create account'}</Text></Text></Pressable>
    </View><Pressable onPress={onSuccess} style={{ alignItems: 'center', padding: 18, marginTop: 6 }}><Text style={{ color: '#88938B', fontSize: 11 }}>Explore the demo as a scorer</Text></Pressable><Text style={{ color: '#A6AEA8', fontSize: 9, textAlign: 'center', marginTop: 10 }}>Authentication is a frontend demo. Connect Supabase to enable accounts.</Text>
  </View>;
}
