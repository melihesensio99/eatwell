import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
} from "react-native";
import { apiConfigured, apiFetch } from "../../api/client";
import { colors, type } from "../../theme";
import { Screen, Eyebrow } from "../../components/RetroUI";
import { firebaseAuth } from "../../auth/firebase";

type Profile = {
  displayName?: string;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  waterGoalMilliliters?: number;
  gender?: string;
};
type Goal = {
  dailyCalories: number;
  proteinGrams?: number;
  carbohydratesGrams?: number;
  fatGrams?: number;
  activityLevel?: string;
  goalType?: string;
  targetWeightKg?: number;
  waterGoalMilliliters?: number;
  source?: number | string;
};
const allergenOptions = [
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
const formatName = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .map(
      (part) =>
        part.charAt(0).toLocaleUpperCase("tr-TR") +
        part.slice(1).toLocaleLowerCase("tr-TR"),
    )
    .join(" ");
const activityLabel = (value: string) =>
  ({
    sedentary: "Düşük",
    light: "Hafif",
    moderate: "Orta",
    active: "Yüksek",
    very_active: "Çok yüksek",
  })[value] ?? value;
const goalLabel = (value: string) =>
  ({
    lose_weight: "Kilo vermek",
    maintain_weight: "Korumak",
    gain_weight: "Kilo almak",
  })[value] ?? value;

export function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<Profile>({});
  const [goal, setGoal] = useState<Goal | null>(null);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [modal, setModal] = useState<"profile" | "allergens" | "goal" | null>(
    null,
  );
  const load = () => {
    if (!apiConfigured()) return;
    Promise.all([
      apiFetch<Profile>("/api/profile"),
      apiFetch<Goal>("/api/nutrition-goals"),
      apiFetch<string[]>("/api/profile/allergens"),
    ])
      .then(([p, g, a]) => {
        setProfile(p);
        setGoal(g);
        setAllergens(a);
      })
      .catch(() => {});
  };
  useEffect(load, []);
  const name = formatName(profile.displayName || "EatWell kullanıcısı");
  const email = firebaseAuth?.currentUser?.email || "Mail adresi bulunamadı";
  const menu: [string, string, string, () => void][] = [
    [
      "✎",
      "Profil bilgileri",
      `${profile.age ?? "-"} yaş · ${profile.weightKg ?? "-"} kg · ${profile.heightCm ?? "-"} cm`,
      () => setModal("profile"),
    ],
    [
      "!",
      "Alerjenlerim",
      allergens.length
        ? allergens
            .map((x) => allergenOptions.find((a) => a[2] === x)?.[1] ?? x)
            .join(", ")
        : "Seçilmedi",
      () => setModal("allergens"),
    ],
    [
      "◎",
      "Beslenme hedefim",
      goal
        ? `${Math.round(goal.dailyCalories)} kcal · ${Math.round(goal.proteinGrams ?? 0)}g protein`
        : "Henüz belirlenmedi",
      () => setModal("goal"),
    ],
  ];
  return (
    <Screen>
      <Eyebrow>Beslenme pasaportu</Eyebrow>
      <Text style={s.title}>Kendin için.</Text>
      <View style={s.profile}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.sub}>{email}</Text>
          <Text style={s.sub}>
            Yaş: {profile.age ?? "-"} Kilo: {profile.weightKg ?? "-"}kg Boy:{" "}
            {profile.heightCm ?? "-"}cm
          </Text>
        </View>
      </View>
      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>Hesap ve hedeflerin</Text>
      </View>
      {menu.map((x) => (
        <Pressable key={x[1]} style={s.menu} onPress={x[3]}>
          <Text style={s.icon}>{x[0]}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.item}>{x[1]}</Text>
          </View>
          <Text style={s.arrow}>›</Text>
        </Pressable>
      ))}
      <Pressable style={s.logout} onPress={onLogout}>
        <Text style={s.logoutText}>Çıkış yap</Text>
      </Pressable>
      <ProfileModal
        visible={modal === "profile"}
        profile={profile}
        onClose={() => setModal(null)}
        onSaved={() => {
          setModal(null);
          load();
        }}
      />
      <AllergenModal
        visible={modal === "allergens"}
        values={allergens}
        onClose={() => setModal(null)}
        onSaved={() => {
          setModal(null);
          load();
        }}
      />
      <GoalModal
        visible={modal === "goal"}
        goal={goal}
        waterGoalMilliliters={profile.waterGoalMilliliters}
        onClose={() => setModal(null)}
        onSaved={() => {
          setModal(null);
          load();
        }}
      />
    </Screen>
  );
}

function ProfileModal({
  visible,
  profile,
  onClose,
  onSaved,
}: {
  visible: boolean;
  profile: Profile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile.displayName ?? ""),
    [age, setAge] = useState(String(profile.age ?? "")),
    [weight, setWeight] = useState(String(profile.weightKg ?? "")),
    [height, setHeight] = useState(String(profile.heightCm ?? "")),
    [waterGoal, setWaterGoal] = useState(
      String(profile.waterGoalMilliliters ?? ""),
    );
  useEffect(() => {
    setName(profile.displayName ?? "");
    setAge(String(profile.age ?? ""));
    setWeight(String(profile.weightKg ?? ""));
    setHeight(String(profile.heightCm ?? ""));
    setWaterGoal(String(profile.waterGoalMilliliters ?? ""));
  }, [profile, visible]);
  const save = async () => {
    try {
      await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          displayName: name,
          age: +age,
          weightKg: +weight,
          heightCm: +height,
          waterGoalMilliliters: +waterGoal,
          gender: profile.gender ?? "other",
        }),
      });
      onSaved();
    } catch {
      Alert.alert(
        "Kaydedilemedi",
        "Profil bilgilerini kontrol edip tekrar dene.",
      );
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <ScrollView
          style={s.modalScroller}
          contentContainerStyle={s.modalScroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={s.modal}>
            <ModalHeader title="Profil bilgileri" onClose={onClose} />
            <Field label="AD SOYAD" value={name} onChangeText={setName} />
            <View style={s.row}>
              <Field
                label="YAŞ"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
              <Field
                label="KİLO (KG)"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
              />
              <Field
                label="BOY (CM)"
                value={height}
                onChangeText={setHeight}
                keyboardType="number-pad"
              />
            </View>
            <Field
              label="GÜNLÜK SU HEDEFİ (ML)"
              value={waterGoal}
              onChangeText={setWaterGoal}
              keyboardType="number-pad"
            />
            <Actions onClose={onClose} onSave={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function AllergenModal({
  visible,
  values,
  onClose,
  onSaved,
}: {
  visible: boolean;
  values: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState(values);
  useEffect(() => setSelected(values), [values, visible]);
  const save = async () => {
    try {
      await apiFetch("/api/profile/allergens", {
        method: "PUT",
        body: JSON.stringify({ allergens: selected }),
      });
      onSaved();
    } catch {
      Alert.alert("Kaydedilemedi", "Alerjenler kaydedilemedi.");
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={s.overlay}>
        <View style={s.modal}>
          <ModalHeader title="Alerjenlerim" onClose={onClose} />
          <ScrollView>
            {allergenOptions.map(([emoji, label, tag]) => {
              const on = selected.includes(tag);
              return (
                <Pressable
                  key={tag}
                  style={[s.allergen, on && s.allergenOn]}
                  onPress={() =>
                    setSelected((x) =>
                      on ? x.filter((y) => y !== tag) : [...x, tag],
                    )
                  }
                >
                  <Text style={s.emoji}>{emoji}</Text>
                  <Text style={s.allergenText}>{label}</Text>
                  <Text>{on ? "✓" : ""}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <Actions onClose={onClose} onSave={save} />
        </View>
      </View>
    </Modal>
  );
}
function GoalModal({
  visible,
  goal,
  waterGoalMilliliters,
  onClose,
  onSaved,
}: {
  visible: boolean;
  goal: Goal | null;
  waterGoalMilliliters?: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [cal, setCal] = useState(""),
    [pro, setPro] = useState(""),
    [carb, setCarb] = useState(""),
    [fat, setFat] = useState(""),
    [activity, setActivity] = useState("moderate"),
    [goalType, setGoalType] = useState("maintain_weight"),
    [target, setTarget] = useState(""),
    [waterGoal, setWaterGoal] = useState(""),
    [aiResult, setAiResult] = useState<Goal | null>(null),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    const isAi =
      goal?.source === 2 || goal?.source === "Ai" || goal?.source === "AI";
    setAiResult(isAi ? goal : null);
    setCal(isAi ? "" : String(goal?.dailyCalories ?? ""));
    setPro(isAi ? "" : String(goal?.proteinGrams ?? ""));
    setCarb(isAi ? "" : String(goal?.carbohydratesGrams ?? ""));
    setFat(isAi ? "" : String(goal?.fatGrams ?? ""));
    setActivity(goal?.activityLevel ?? "moderate");
    setGoalType(goal?.goalType ?? "maintain_weight");
    setTarget(goal?.targetWeightKg != null ? String(goal.targetWeightKg) : "");
    setWaterGoal(String(waterGoalMilliliters ?? ""));
  }, [goal, visible, waterGoalMilliliters]);
  const calculate = async () => {
    setBusy(true);
    try {
      const result = await apiFetch<Goal>(
        "/api/nutrition-goals/calculate-with-ai",
        {
          method: "POST",
          body: JSON.stringify({
            activityLevel: activity,
            goal: goalType,
            targetWeightKg: target.trim() ? +target : null,
          }),
        },
      );
      setAiResult(result);
      setCal("");
      setPro("");
      setCarb("");
      setFat("");
      setWaterGoal(String(result.waterGoalMilliliters ?? ""));
      Alert.alert("AI önerisi hazır", "Onaylamak için Kaydet’e bas.");
    } catch (error) {
      Alert.alert(
        "AI hesaplanamadı",
        error instanceof Error
          ? error.message
          : "Profil bilgilerin ve backend bağlantısını kontrol et.",
      );
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    if (aiResult) {
      try {
        await apiFetch("/api/nutrition-goals/confirm-ai", {
          method: "PUT",
          body: JSON.stringify({
            dailyCalories: aiResult.dailyCalories,
            proteinGrams: aiResult.proteinGrams,
            carbohydratesGrams: aiResult.carbohydratesGrams,
            fatGrams: aiResult.fatGrams,
            activityLevel: activity,
            goal: goalType,
            targetWeightKg: target.trim() ? +target : null,
            waterGoalMilliliters: aiResult.waterGoalMilliliters ?? +waterGoal,
          }),
        });
        onSaved();
      } catch {
        Alert.alert("Kaydedilemedi", "AI hedefi onaylanamadı.");
      }
      return;
    }
    if (
      !cal.trim() ||
      !pro.trim() ||
      !carb.trim() ||
      !fat.trim() ||
      !waterGoal.trim()
    ) {
      Alert.alert(
        "Hedef değerleri eksik",
        "Kalori, makrolar ve su hedefini doldur.",
      );
      return;
    }
    try {
      await apiFetch("/api/nutrition-goals/manual", {
        method: "PUT",
        body: JSON.stringify({
          dailyCalories: +cal,
          proteinGrams: +pro,
          carbohydratesGrams: +carb,
          fatGrams: +fat,
          waterGoalMilliliters: +waterGoal,
        }),
      });
      onSaved();
    } catch {
      Alert.alert(
        "Kaydedilemedi",
        "Hedef değerlerini kontrol edip tekrar dene.",
      );
    }
  };
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={s.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
      >
        <ScrollView
          style={s.modalScroller}
          contentContainerStyle={s.modalScroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
        >
          <View style={s.modal}>
            <ModalHeader title="Beslenme hedefim" onClose={onClose} />
            {goal?.activityLevel && goal?.goalType && (
              <View style={s.preferenceSummary}>
                <Text style={s.preferenceText}>
                  Aktivite: {activityLabel(goal.activityLevel)} · Hedef:{" "}
                  {goalLabel(goal.goalType)}
                </Text>
                {goal.targetWeightKg != null && (
                  <Text style={s.preferenceSubtext}>
                    Hedef kilo: {goal.targetWeightKg} kg
                  </Text>
                )}
              </View>
            )}
            <Text style={s.label}>AKTİVİTE SEVİYESİ</Text>
            <View style={s.row}>
              <Pressable
                style={[
                  s.goalChoice,
                  activity === "sedentary" && s.goalChoiceOn,
                ]}
                onPress={() => setActivity("sedentary")}
              >
                <Text>Düşük</Text>
              </Pressable>
              <Pressable
                style={[
                  s.goalChoice,
                  activity === "moderate" && s.goalChoiceOn,
                ]}
                onPress={() => setActivity("moderate")}
              >
                <Text>Orta</Text>
              </Pressable>
              <Pressable
                style={[s.goalChoice, activity === "active" && s.goalChoiceOn]}
                onPress={() => setActivity("active")}
              >
                <Text>Yüksek</Text>
              </Pressable>
            </View>
            <Text style={s.label}>HEDEFİN</Text>
            <View style={s.row}>
              <Pressable
                style={[
                  s.goalChoice,
                  goalType === "lose_weight" && s.goalChoiceOn,
                ]}
                onPress={() => setGoalType("lose_weight")}
              >
                <Text>Kilo ver</Text>
              </Pressable>
              <Pressable
                style={[
                  s.goalChoice,
                  goalType === "maintain_weight" && s.goalChoiceOn,
                ]}
                onPress={() => setGoalType("maintain_weight")}
              >
                <Text>Koru</Text>
              </Pressable>
              <Pressable
                style={[
                  s.goalChoice,
                  goalType === "gain_weight" && s.goalChoiceOn,
                ]}
                onPress={() => setGoalType("gain_weight")}
              >
                <Text>Kilo al</Text>
              </Pressable>
            </View>
            <Field
              label="HEDEF KİLO (KG) - İSTEĞE BAĞLI"
              value={target}
              onChangeText={setTarget}
              keyboardType="decimal-pad"
            />
            <Pressable style={s.aiButton} onPress={calculate} disabled={busy}>
              <Text style={s.aiButtonText}>
                {busy ? "Hesaplanıyor…" : "✦ AI ile hesapla"}
              </Text>
            </Pressable>
            {aiResult && (
              <View style={s.aiResult}>
                <Text style={s.aiResultTitle}>AI HEDEFİ</Text>
                <Text style={s.aiResultText}>
                  {Math.round(aiResult.dailyCalories)} kcal · Protein{" "}
                  {Math.round(aiResult.proteinGrams ?? 0)}g · Karb.{" "}
                  {Math.round(aiResult.carbohydratesGrams ?? 0)}g · Yağ{" "}
                  {Math.round(aiResult.fatGrams ?? 0)}g · Su{" "}
                  {Math.round(aiResult.waterGoalMilliliters ?? +waterGoal)} ml
                </Text>
              </View>
            )}
            <Text style={s.helper}>
              Manuel hedef girmek istersen aşağıdaki alanları doldurabilirsin.
            </Text>
            <Field
              label="GÜNLÜK KALORİ"
              value={cal}
              onChangeText={(value) => {
                setAiResult(null);
                setCal(value);
              }}
              keyboardType="number-pad"
            />
            <View style={s.row}>
              <Field
                label="PROTEİN (G)"
                value={pro}
                onChangeText={(value) => {
                  setAiResult(null);
                  setPro(value);
                }}
                keyboardType="number-pad"
              />
              <Field
                label="KARB. (G)"
                value={carb}
                onChangeText={(value) => {
                  setAiResult(null);
                  setCarb(value);
                }}
                keyboardType="number-pad"
              />
              <Field
                label="YAĞ (G)"
                value={fat}
                onChangeText={(value) => {
                  setAiResult(null);
                  setFat(value);
                }}
                keyboardType="number-pad"
              />
            </View>
            <Field
              label="GÜNLÜK SU HEDEFİ (ML)"
              value={waterGoal}
              onChangeText={(value) => {
                setAiResult(null);
                setWaterGoal(value);
              }}
              keyboardType="number-pad"
            />
            <Actions onClose={onClose} onSave={save} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: "number-pad" | "decimal-pad";
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  );
}
function Actions({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <View style={s.actions}>
      <Pressable onPress={onClose}>
        <Text style={s.cancel}>Vazgeç</Text>
      </Pressable>
      <Pressable style={s.save} onPress={onSave}>
        <Text style={s.saveText}>Kaydet</Text>
      </Pressable>
    </View>
  );
}
function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <View style={s.modalHeader}>
      <Text style={s.modalTitle}>{title}</Text>
      <Pressable
        style={s.modalClose}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel={`${title} ekranını kapat`}
        onPress={onClose}
      >
        <Text style={s.modalCloseText}>×</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  title: {
    fontFamily: type.display,
    fontSize: 27,
    color: colors.espresso,
    marginTop: 5,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 15,
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.plum,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.mustard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.espresso,
  },
  avatarText: { fontSize: 24, fontWeight: "800", color: colors.espresso },
  name: { fontFamily: type.display, fontSize: 21, color: colors.cream },
  sub: { fontSize: 12, color: colors.cream, opacity: 0.75, marginTop: 4 },
  menu: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 13,
    marginTop: 10,
    borderWidth: 1,
    borderTopWidth: 3,
    borderTopColor: colors.orange,
    borderColor: colors.line,
    borderRadius: 15,
    backgroundColor: colors.paper,
  },
  icon: { fontSize: 22, width: 24, color: colors.orange },
  item: { fontSize: 14, fontWeight: "800", color: colors.espresso },
  muted: { fontSize: 12, color: "rgba(43,33,28,.62)", marginTop: 2 },
  arrow: { fontSize: 23, color: colors.espresso },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.espresso,
  },
  logout: {
    marginTop: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#d8bbb7",
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#fff2ef",
  },
  logoutText: { color: "#a83c35", fontWeight: "800" },
  goalChoice: {
    flex: 1,
    padding: 10,
    borderWidth: 2,
    borderColor: "rgba(43,33,28,.3)",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.paper,
  },
  goalChoiceOn: {
    backgroundColor: colors.mustard,
    borderColor: colors.espresso,
  },
  aiButton: {
    marginTop: 16,
    padding: 13,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    backgroundColor: colors.teal,
    alignItems: "center",
  },
  aiButtonText: { color: colors.cream, fontWeight: "800" },
  helper: { fontSize: 12, color: "rgba(43,33,28,.65)", marginTop: 10 },
  aiResult: {
    marginTop: 14,
    padding: 13,
    borderRadius: 12,
    backgroundColor: colors.teal,
    borderWidth: 2,
    borderColor: colors.espresso,
  },
  aiResultTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.mustard,
  },
  aiResultText: { marginTop: 5, color: colors.cream, fontWeight: "800" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,.35)",
    paddingHorizontal: 16,
  },
  modalScroller: { flex: 1 },
  modalScroll: { flexGrow: 1, justifyContent: "center", paddingVertical: 20 },
  modal: {
    backgroundColor: colors.cream,
    borderRadius: 24,
    padding: 22,
  },
  modalTitle: {
    fontFamily: type.display,
    fontSize: 27,
    color: colors.espresso,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  modalClose: {
    width: 44,
    height: 44,
    marginTop: -8,
    marginRight: -8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  modalCloseText: { fontSize: 27, lineHeight: 29, color: colors.espresso },
  preferenceSummary: {
    marginBottom: 4,
    padding: 11,
    borderRadius: 12,
    backgroundColor: "#d9f5ee",
    borderWidth: 1,
    borderColor: colors.teal,
  },
  preferenceText: { fontSize: 11, fontWeight: "800", color: colors.espresso },
  preferenceSubtext: {
    fontSize: 10,
    color: "rgba(43,33,28,.65)",
    marginTop: 4,
  },
  label: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontWeight: "800",
    color: colors.orange,
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 11,
    backgroundColor: colors.paper,
    padding: 11,
    color: colors.espresso,
  },
  row: { flexDirection: "row", gap: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
    marginTop: 20,
  },
  cancel: { color: colors.plum, fontWeight: "800" },
  save: {
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  saveText: { color: colors.cream, fontWeight: "800" },
  allergen: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: colors.paper,
  },
  allergenOn: { backgroundColor: colors.coral },
  emoji: { fontSize: 22, width: 35 },
  allergenText: { flex: 1, fontWeight: "800", color: colors.espresso },
});
