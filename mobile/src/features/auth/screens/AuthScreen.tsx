import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { authService } from '../api/auth.service';
import { colors, radius, spacing, typography } from '../../../theme';

export function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!email.trim() || password.length < 6) { Alert.alert('Eksik bilgi', 'Geçerli bir e-posta ve en az 6 karakterli şifre girin.'); return; }
    setBusy(true);
    try { if (register) await authService.signUp(email.trim(), password); else await authService.signIn(email.trim(), password); }
    catch { Alert.alert('Giriş başarısız', register ? 'Hesap oluşturulamadı.' : 'E-posta veya şifre hatalı.'); }
    finally { setBusy(false); }
  };
  return <View style={styles.page}><Text style={styles.eyebrow}>EATWELL</Text><Text style={styles.title}>{register ? 'Hesabını oluştur' : 'Tekrar hoş geldin'}</Text><Text style={styles.subtitle}>Günlük beslenme takibine devam etmek için giriş yap.</Text><TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="E-posta" placeholderTextColor={colors.textMuted} style={styles.input} /><TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Şifre" placeholderTextColor={colors.textMuted} style={styles.input} /><Pressable style={styles.primary} onPress={() => void submit()} disabled={busy}><Text style={styles.primaryText}>{busy ? 'Bekleyin…' : register ? 'Hesap oluştur' : 'Giriş yap'}</Text></Pressable><Pressable onPress={() => setRegister(!register)}><Text style={styles.switch}>{register ? 'Zaten hesabım var' : 'Yeni hesap oluştur'}</Text></Pressable></View>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: spacing.lg }, eyebrow: { ...typography.label, color: colors.coral, letterSpacing: 1.5 }, title: { ...typography.title, color: colors.text, marginTop: spacing.sm }, subtitle: { ...typography.body, color: colors.textMuted, marginTop: spacing.sm, marginBottom: spacing.xl }, input: { height: 54, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, color: colors.text, marginTop: spacing.md, ...typography.body }, primary: { height: 54, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.coral, marginTop: spacing.lg }, primaryText: { ...typography.label, color: colors.white }, switch: { ...typography.label, color: colors.cobalt, textAlign: 'center', marginTop: spacing.lg } });
