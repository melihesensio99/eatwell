import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiConfigured, apiFetch } from "../api/client";
import { colors, type } from "../theme";
type Props = { onComplete: () => void };
type Rec = {
  dailyCalories: number;
  proteinGrams: number;
  carbohydratesGrams: number;
  fatGrams: number;
  waterGoalMilliliters: number;
};
const opts = [
  ["🥛", "Süt", "milk"],
  ["🥚", "Yumurta", "eggs"],
  ["🌾", "Gluten", "gluten"],
  ["🥜", "Yer fıstığı", "peanuts"],
  ["🌰", "Kuruyemiş", "tree nuts"],
  ["🫘", "Soya", "soy"],
  ["🐟", "Balık", "fish"],
  ["🦐", "Kabuklu deniz ürünleri", "shellfish"],
  ["🌿", "Susam", "sesame"],
  ["🍯", "Bal", "honey"],
];
export function OnboardingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(1),
    [name, setName] = useState(""),
    [age, setAge] = useState(""),
    [weight, setWeight] = useState(""),
    [height, setHeight] = useState(""),
    [gender, setGender] = useState("male"),
    [mode, setMode] = useState<"manual" | "ai">("manual"),
    [cal, setCal] = useState(""),
    [pro, setPro] = useState(""),
    [carb, setCarb] = useState(""),
    [fat, setFat] = useState(""),
    [water, setWater] = useState(""),
    [activity, setActivity] = useState("moderate"),
    [goal, setGoal] = useState("lose_weight"),
    [target, setTarget] = useState(""),
    [rec, setRec] = useState<Rec | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [busy, setBusy] = useState(false);
  const valid = () => {
    if (!name.trim() || +age < 13 || +weight < 20 || +height < 80) {
      Alert.alert(
        "Bilgileri kontrol et",
        "Ad, yaş, kilo ve boy alanlarını doldur.",
      );
      return false;
    }
    return true;
  };
  const profile = () =>
    apiFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        displayName: name.trim(),
        age: +age,
        weightKg: +weight,
        heightCm: +height,
        gender,
      }),
    });
  const calc = async () => {
    if (!valid()) return;
    if (!apiConfigured()) {
      Alert.alert("Backend bağlantısı yok");
      return;
    }
    setBusy(true);
    try {
      await profile();
      setRec(
        await apiFetch<Rec>("/api/nutrition-goals/calculate-with-ai", {
          method: "POST",
          body: JSON.stringify({
            activityLevel: activity,
            goal,
            targetWeightKg: target.trim() ? +target : null,
          }),
        }),
      );
    } catch (error) {
      Alert.alert(
        "AI önerisi alınamadı",
        error instanceof Error
          ? error.message
          : "Backend bağlantısını ve Mistral ayarını kontrol et.",
      );
    } finally {
      setBusy(false);
    }
  };
  const next = async () => {
    if (!valid()) return;
    if (!apiConfigured()) {
      Alert.alert(
        "Backend bağlantısı yok",
        "Telefonun aynı Wi‑Fi ağında olduğundan ve backend’in çalıştığından emin ol.",
      );
      return;
    }
    if (
      mode === "manual" &&
      (!cal.trim() ||
        !pro.trim() ||
        !carb.trim() ||
        !fat.trim() ||
        !water.trim())
    ) {
      Alert.alert(
        "Hedef değerleri eksik",
        "Kalori, makrolar ve su hedefini doldur.",
      );
      return;
    }
    if (mode === "ai" && !rec) {
      await calc();
      return;
    }
    setBusy(true);
    try {
      await profile();
      if (rec)
        await apiFetch("/api/nutrition-goals/confirm-ai", {
          method: "PUT",
          body: JSON.stringify({
            dailyCalories: rec.dailyCalories,
            proteinGrams: rec.proteinGrams,
            carbohydratesGrams: rec.carbohydratesGrams,
            fatGrams: rec.fatGrams,
            waterGoalMilliliters: rec.waterGoalMilliliters,
            activityLevel: activity,
            goal,
            targetWeightKg: target.trim() ? +target : null,
          }),
        });
      else
        await apiFetch("/api/nutrition-goals/manual", {
          method: "PUT",
          body: JSON.stringify({
            dailyCalories: +cal,
            proteinGrams: +pro,
            carbohydratesGrams: +carb,
            fatGrams: +fat,
            waterGoalMilliliters: +water,
          }),
        });
      setStep(3);
    } catch (error) {
      Alert.alert(
        "Kaydetme sorunu",
        error instanceof Error
          ? error.message
          : "Profil veya hedef kaydedilemedi.",
      );
    } finally {
      setBusy(false);
    }
  };
  const skipTarget = () => {
    if (mode === "ai" && rec) {
      Alert.alert(
        "AI hedefi hazır",
        "Kalori, makro ve su hedefinin ana sayfaya taşınması için önce ‘Pasaportumu oluştur’ ile onayla.",
      );
      return;
    }
    setStep(3);
  };
  const choose = (v: string, c: string, l: string, f: () => void) => (
    <Pressable onPress={f} style={[s.choice, c === v && s.active]}>
      <Text style={s.choiceText}>
        {c === v ? "● " : "○ "}
        {l}
      </Text>
    </Pressable>
  );
  if (step === 3)
    return (
      <Allergens
        selected={selected}
        setSelected={setSelected}
        onBack={() => setStep(2)}
        onComplete={async () => {
          try {
            if (!apiConfigured()) {
              Alert.alert(
                "Backend bağlantısı yok",
                "Alerjenleri kaydetmek için backend bağlantısı gerekli.",
              );
              return;
            }
            await apiFetch("/api/profile/allergens", {
              method: "PUT",
              body: JSON.stringify({ allergens: selected }),
            });
            onComplete();
          } catch (error) {
            Alert.alert(
              "Alerjenler kaydedilemedi",
              error instanceof Error ? error.message : "Tekrar dene.",
            );
          }
        }}
        onSkip={onComplete}
        busy={busy}
      />
    );
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={s.header}>
          <Text style={s.eyebrow}>İlk adım · {step}/3</Text>
          <Text style={s.title}>
            {step === 1 ? "Beslenme pasaportun." : "Hedefini birlikte seçelim."}
          </Text>
          <Text style={s.copy}>
            {step === 1
              ? "Sana özel takip için birkaç temel bilgi yeterli."
              : "Değerleri kendin gir veya AI önerisini al."}
          </Text>
        </View>
        <ScrollView style={s.sheet}>
          <>
            {step === 1 ? (
              <>
                <Field l="AD SOYAD" v={name} f={setName} p="Örn. Melih Esen" />
                <View style={s.row}>
                  <Field l="YAŞ" v={age} f={setAge} k="number-pad" />
                  <Field
                    l="KİLO (KG)"
                    v={weight}
                    f={setWeight}
                    k="number-pad"
                  />
                  <Field l="BOY (CM)" v={height} f={setHeight} k="number-pad" />
                </View>
                <Text style={s.label}>CİNSİYET</Text>
                <View style={s.row}>
                  {choose("male", gender, "Erkek", () => setGender("male"))}
                  {choose("female", gender, "Kadın", () => setGender("female"))}
                  {choose("other", gender, "Diğer", () => setGender("other"))}
                </View>
                <Pressable style={s.primary} onPress={() => setStep(2)}>
                  <Text style={s.primaryText}>Hedef ayarlarına geç →</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={s.label}>HEDEF YÖNTEMİ</Text>
                <View style={s.row}>
                  {choose("manual", mode, "Manuel gir", () => {
                    setMode("manual");
                    setRec(null);
                  })}
                  {choose("ai", mode, "AI ile belirle", () => {
                    setMode("ai");
                    setRec(null);
                  })}
                </View>
                {mode === "manual" ? (
                  <>
                    <Field
                      l="GÜNLÜK KALORİ"
                      v={cal}
                      f={setCal}
                      k="number-pad"
                    />
                    <View style={s.row}>
                      <Field
                        l="PROTEİN (G)"
                        v={pro}
                        f={setPro}
                        k="number-pad"
                      />
                      <Field
                        l="KARB. (G)"
                        v={carb}
                        f={setCarb}
                        k="number-pad"
                      />
                      <Field l="YAĞ (G)" v={fat} f={setFat} k="number-pad" />
                    </View>
                    <Field
                      l="GÜNLÜK SU HEDEFİ (ML)"
                      v={water}
                      f={setWater}
                      k="number-pad"
                    />
                  </>
                ) : (
                  <>
                    <Text style={s.helper}>
                      AI önerisi için aktivite seviyeni ve hedefini seç.
                    </Text>
                    <Text style={s.label}>AKTİVİTE</Text>
                    <View style={s.row}>
                      {choose("sedentary", activity, "Düşük", () =>
                        setActivity("sedentary"),
                      )}
                      {choose("moderate", activity, "Orta", () =>
                        setActivity("moderate"),
                      )}
                      {choose("active", activity, "Yüksek", () =>
                        setActivity("active"),
                      )}
                    </View>
                    <Text style={s.label}>HEDEFİN</Text>
                    <View style={s.row}>
                      {choose("lose_weight", goal, "Kilo vermek", () =>
                        setGoal("lose_weight"),
                      )}
                      {choose("maintain_weight", goal, "Korumak", () =>
                        setGoal("maintain_weight"),
                      )}
                      {choose("gain_weight", goal, "Kilo almak", () =>
                        setGoal("gain_weight"),
                      )}
                    </View>
                    <Field
                      l="HEDEF KİLO (KG)"
                      v={target}
                      f={setTarget}
                      k="number-pad"
                    />
                    {rec && (
                      <View style={s.rec}>
                        <Text style={s.recTitle}>
                          {rec.dailyCalories} kcal / gün
                        </Text>
                        <Text style={s.recText}>
                          Protein {rec.proteinGrams}g · Karb.{" "}
                          {rec.carbohydratesGrams}g · Yağ {rec.fatGrams}g · Su{" "}
                          {rec.waterGoalMilliliters} ml
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
            {step > 1 && (
              <Pressable style={s.primary} onPress={next} disabled={busy}>
                {busy ? (
                  <ActivityIndicator color={colors.cream} />
                ) : (
                  <Text style={s.primaryText}>
                    {mode === "ai" && !rec
                      ? "✦ AI ile hedefi hesapla"
                      : "Pasaportumu oluştur →"}
                  </Text>
                )}
              </Pressable>
            )}
            {step > 1 && (
              <>
                <Pressable onPress={() => setStep(1)}>
                  <Text style={s.link}>← Profil bilgilerine dön</Text>
                </Pressable>
                <Pressable onPress={skipTarget}>
                  <Text style={s.link}>Şimdilik atla</Text>
                </Pressable>
              </>
            )}
          </>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function Field({
  l,
  v,
  f,
  p,
  k,
}: {
  l: string;
  v: string;
  f: (v: string) => void;
  p?: string;
  k?: "number-pad" | "default";
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{l}</Text>
      <TextInput
        value={v}
        onChangeText={f}
        placeholder={p}
        keyboardType={k ?? "default"}
        style={s.input}
      />
    </View>
  );
}
function Allergens({
  selected,
  setSelected,
  onBack,
  onComplete,
  onSkip,
  busy,
}: {
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
  busy: boolean;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [a]);
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.ahead}>
        <Text style={s.eyebrow}>Son adım · 3/3</Text>
        <Text style={s.title}>Alerjenlerini seç.</Text>
        <Text style={s.copy}>
          Sana dokunan alerjenleri işaretle. İstersen atlayıp ana sayfaya
          geçebilirsin.
        </Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {opts.map(([e, l, t], i) => {
          const on = selected.includes(t);
          return (
            <Animated.View
              key={t}
              style={{
                opacity: a,
                transform: [
                  {
                    translateY: a.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12 - i, 0],
                    }),
                  },
                ],
              }}
            >
              <Pressable
                onPress={() =>
                  setSelected((x) =>
                    on ? x.filter((y) => y !== t) : [...x, t],
                  )
                }
                style={[s.card, on && s.cardOn]}
              >
                <Text style={s.emoji}>{e}</Text>
                <Text style={s.cardText}>{l}</Text>
                <Text>{on ? "✓" : ""}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
        <Pressable style={s.primary} onPress={onComplete} disabled={busy}>
          {busy ? (
            <ActivityIndicator color={colors.cream} />
          ) : (
            <Text style={s.primaryText}>Devam et →</Text>
          )}
        </Pressable>
        <Pressable onPress={onSkip}>
          <Text style={s.link}>Şimdilik atla</Text>
        </Pressable>
        <Pressable onPress={onBack}>
          <Text style={s.link}>← Hedef ayarlarına dön</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
  header: {
    backgroundColor: colors.orange,
    padding: 24,
    paddingTop: 42,
    paddingBottom: 48,
  },
  ahead: {
    backgroundColor: colors.plum,
    padding: 24,
    paddingTop: 42,
    paddingBottom: 48,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: colors.mustard,
  },
  title: {
    fontFamily: type.display,
    fontSize: 29,
    color: colors.cream,
    marginTop: 8,
  },
  copy: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.cream,
    marginTop: 9,
    opacity: 0.85,
  },
  sheet: {
    padding: 22,
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.cream,
  },
  content: { padding: 22 },
  label: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "800",
    color: colors.orange,
    marginTop: 15,
    marginBottom: 7,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    backgroundColor: colors.paper,
    padding: 12,
    color: colors.espresso,
  },
  row: { flexDirection: "row", gap: 8 },
  choice: {
    flex: 1,
    padding: 11,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "rgba(43,33,28,.25)",
    backgroundColor: colors.paper,
  },
  active: { backgroundColor: colors.mustard, borderColor: colors.espresso },
  choiceText: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    color: colors.espresso,
  },
  helper: { fontSize: 13, color: "rgba(43,33,28,.65)", marginTop: 10 },
  primary: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 14,
    backgroundColor: colors.orange,
    padding: 14,
    alignItems: "center",
  },
  primaryText: { fontWeight: "800", color: colors.cream },
  link: {
    textAlign: "center",
    marginTop: 16,
    color: colors.plum,
    fontWeight: "700",
  },
  rec: {
    marginTop: 16,
    padding: 15,
    borderRadius: 16,
    backgroundColor: colors.teal,
  },
  recTitle: { fontFamily: type.display, fontSize: 23, color: colors.cream },
  recText: { color: colors.cream, marginTop: 5 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 16,
    backgroundColor: colors.paper,
    marginBottom: 10,
  },
  cardOn: { backgroundColor: colors.coral },
  emoji: { fontSize: 25, width: 40 },
  cardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: colors.espresso,
  },
});
