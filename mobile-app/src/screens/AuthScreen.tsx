import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, type } from "../theme";
import {
  firebaseConfigured,
  loginWithEmail,
  registerWithEmail,
  resetPassword,
} from "../auth/firebase";
import { firebaseAuth } from "../auth/firebase";

type Props = {
  onAuthenticated: (displayName: string, isNewUser: boolean) => void;
};

export function AuthScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert(
        "Bilgileri kontrol et",
        "Geçerli bir e-posta ve en az 6 karakterli bir şifre gir.",
      );
      return;
    }
    setBusy(true);
    try {
      if (firebaseConfigured) {
        if (mode === "login") await loginWithEmail(email.trim(), password);
        else await registerWithEmail(email.trim(), password);
        // Ensure the Firebase user and token are ready before onboarding starts.
        await firebaseAuth?.currentUser?.getIdToken();
      }
      onAuthenticated(
        email.split("@")[0] || "EatWell kullanıcısı",
        mode === "register",
      );
    } catch {
      Alert.alert(
        "Giriş yapılamadı",
        "E-posta veya şifreni kontrol edip tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("E-posta gerekli", "Önce e-posta adresini yaz.");
      return;
    }
    if (!firebaseConfigured) {
      Alert.alert(
        "Firebase bağlantısı gerekli",
        "Şifre sıfırlama için Firebase yapılandırmasını tamamla.",
      );
      return;
    }
    await resetPassword(email.trim());
    Alert.alert(
      "E-posta gönderildi",
      "Şifre yenileme bağlantısını kontrol et.",
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.hero}>
          <View style={s.logoCircle}>
            <Text style={s.logoStar}>✦</Text>
          </View>
          <Text style={s.logo}>
            EAT<Text style={s.logoAccent}>WELL</Text>
          </Text>
          <Text style={s.kicker}>Gününü iyi besle.</Text>
          <Text style={s.heroCopy}>Tabağını takip et, hedefini yakala.</Text>
        </View>
        <View style={s.sheet}>
          <View style={s.tabs}>
            <Pressable
              onPress={() => setMode("login")}
              style={[s.tab, mode === "login" && s.activeTab]}
            >
              <Text style={[s.tabText, mode === "login" && s.activeTabText]}>
                Giriş yap
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode("register")}
              style={[s.tab, mode === "register" && s.activeTab]}
            >
              <Text style={[s.tabText, mode === "register" && s.activeTabText]}>
                Kayıt ol
              </Text>
            </Pressable>
          </View>
          <Text style={s.title}>
            {mode === "login" ? "Tekrar hoş geldin." : "EatWell’e katıl."}
          </Text>
          <Text style={s.subtitle}>
            {mode === "login"
              ? "Bugünkü tabağın seni bekliyor."
              : "Kendi beslenme hikâyeni başlat."}
          </Text>
          <Text style={s.label}>E-POSTA</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="sen@ornek.com"
            placeholderTextColor="rgba(43,33,28,.42)"
            style={s.input}
          />
          <Text style={s.label}>ŞİFRE</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="En az 6 karakter"
            placeholderTextColor="rgba(43,33,28,.42)"
            style={s.input}
          />
          <Pressable style={s.primary} onPress={submit} disabled={busy}>
            {busy ? (
              <ActivityIndicator color={colors.cream} />
            ) : (
              <Text style={s.primaryText}>
                {mode === "login" ? "Giriş yap  →" : "Hesap oluştur  →"}
              </Text>
            )}
          </Pressable>
          {mode === "login" && (
            <Pressable onPress={forgotPassword}>
              <Text style={s.forgot}>Şifremi unuttum</Text>
            </Pressable>
          )}
          <Text style={s.note}>
            {firebaseConfigured
              ? "Firebase Authentication ile güvenli giriş."
              : "Firebase yapılandırması bekleniyor."}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  hero: {
    flex: 1,
    backgroundColor: colors.orange,
    paddingHorizontal: 28,
    paddingTop: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.mustard,
    borderWidth: 2,
    borderColor: colors.espresso,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.espresso,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  logoStar: { fontSize: 38, color: colors.espresso },
  logo: {
    fontFamily: type.display,
    fontSize: 30,
    letterSpacing: 2,
    color: colors.cream,
    marginTop: 18,
  },
  logoAccent: { color: colors.mustard },
  kicker: {
    fontFamily: type.display,
    fontSize: 23,
    color: colors.cream,
    marginTop: 32,
  },
  heroCopy: { fontSize: 14, color: colors.cream, opacity: 0.82, marginTop: 8 },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingTop: 16,
    marginTop: -24,
  },
  tabs: { flexDirection: "row", gap: 8, marginBottom: 22 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  activeTab: {
    backgroundColor: colors.mustard,
    borderWidth: 2,
    borderColor: colors.espresso,
  },
  tabText: { fontSize: 13, fontWeight: "800", color: "rgba(43,33,28,.55)" },
  activeTabText: { color: colors.espresso },
  title: { fontFamily: type.display, fontSize: 25, color: colors.espresso },
  subtitle: {
    fontSize: 13,
    color: "rgba(43,33,28,.65)",
    marginTop: 6,
    marginBottom: 22,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.3,
    fontWeight: "800",
    color: colors.orange,
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: colors.espresso,
  },
  primary: {
    marginTop: 20,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 14,
    backgroundColor: colors.orange,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: colors.espresso,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  primaryText: { fontSize: 14, fontWeight: "800", color: colors.cream },
  forgot: {
    textAlign: "center",
    marginTop: 18,
    color: colors.plum,
    fontSize: 13,
    fontWeight: "700",
  },
  note: {
    textAlign: "center",
    fontSize: 11,
    color: "rgba(43,33,28,.52)",
    marginTop: 18,
    lineHeight: 16,
  },
});
