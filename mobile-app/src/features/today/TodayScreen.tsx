import React, { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiConfigured, apiFetch, apiRoutes } from "../../api/client";
import { colors, type } from "../../theme";
import { Screen } from "../../components/RetroUI";
import { BarcodeScannerModal } from "../barcode/BarcodeScannerModal";
import { FoodAnalysisModal } from "../food-analysis/FoodAnalysisModal";
type Summary = {
  consumedCalories: number;
  targetCalories: number | null;
  remainingCalories: number | null;
  calorieCompletionPercentage: number | null;
  consumedProteinGrams: number;
  targetProteinGrams: number | null;
  consumedCarbohydratesGrams: number;
  targetCarbohydratesGrams: number | null;
  consumedFatGrams: number;
  targetFatGrams: number | null;
};
type Goal = {
  dailyCalories: number;
  proteinGrams?: number | null;
  carbohydratesGrams?: number | null;
  fatGrams?: number | null;
};
type Profile = { displayName?: string };
type Food = {
  id: string;
  foodName: string;
  calories?: number;
  mealType: string;
};
const today = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const n = (v: number | null | undefined) =>
  Math.round(v ?? 0).toLocaleString("tr-TR");
const formatName = (v: string) =>
  v
    .trim()
    .split(/\s+/)
    .map(
      (x) =>
        x.charAt(0).toLocaleUpperCase("tr-TR") +
        x.slice(1).toLocaleLowerCase("tr-TR"),
    )
    .join(" ");
export function TodayScreen() {
  const [data, setData] = useState<Summary | null>(null);
  const [profile, setProfile] = useState<Profile>({});
  const [foods, setFoods] = useState<Food[]>([]);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!apiConfigured()) return;
      apiFetch<Goal>("/api/nutrition-goals")
        .then((goal) => {
          setData((current) => ({
            ...(current ?? {
              consumedCalories: 0,
              remainingCalories: goal.dailyCalories,
              calorieCompletionPercentage: 0,
              consumedProteinGrams: 0,
              consumedCarbohydratesGrams: 0,
              consumedFatGrams: 0,
            }),
            targetCalories: goal.dailyCalories,
            targetProteinGrams: goal.proteinGrams ?? null,
            targetCarbohydratesGrams: goal.carbohydratesGrams ?? null,
            targetFatGrams: goal.fatGrams ?? null,
          }));
        })
        .catch(() => {});
      Promise.all([
        apiFetch<Summary>(apiRoutes.summary(today())),
        apiFetch<Profile>("/api/profile"),
        apiFetch<any>(apiRoutes.dailyLog(today())),
        apiFetch<Goal>("/api/nutrition-goals"),
      ])
        .then(([summary, p, log, goal]) => {
          setData({
            ...summary,
            targetCalories:
              summary.targetCalories && summary.targetCalories > 0
                ? summary.targetCalories
                : goal.dailyCalories,
            targetProteinGrams:
              summary.targetProteinGrams && summary.targetProteinGrams > 0
                ? summary.targetProteinGrams
                : (goal.proteinGrams ?? null),
            targetCarbohydratesGrams:
              summary.targetCarbohydratesGrams &&
              summary.targetCarbohydratesGrams > 0
                ? summary.targetCarbohydratesGrams
                : (goal.carbohydratesGrams ?? null),
            targetFatGrams:
              summary.targetFatGrams && summary.targetFatGrams > 0
                ? summary.targetFatGrams
                : (goal.fatGrams ?? null),
          });
          setProfile(p);
          setFoods((log.items ?? []).slice(0, 3));
        })
        .catch(() => {});
    }, []),
  );
  const name = formatName(profile.displayName || "Kullanıcı");
  const consumed = data?.consumedCalories ?? 0;
  const target = data?.targetCalories ?? 0;
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Text style={s.time}>
          {new Intl.DateTimeFormat("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date())}
        </Text>
        <Text style={s.date}>● 20 EYLÜL PAZAR</Text>
        <View style={s.topRow}>
          <View>
            <Text style={s.greeting}>Merhaba, {name}!</Text>
            <Text style={s.subGreeting}>
              Bugün hedefine bir adım daha yakınsın ✦
            </Text>
          </View>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{name.charAt(0)}</Text>
            <View style={s.avatarBadge}>
              <Text style={s.avatarBadgeText}>✦ 5</Text>
            </View>
          </View>
        </View>
        <View style={s.summary}>
          <View style={s.summaryHead}>
            <View style={s.pill}>
              <Text style={s.pillText}>Günlük Özet</Text>
            </View>
            <Text style={s.summaryCalories}>
              {n(consumed)}
              <Text style={s.summaryUnit}> / {n(target)} kcal</Text>
            </Text>
          </View>
          <Text style={s.summaryTitle}>Tabağını kolayca takip et.</Text>
          <Text style={s.summaryCopy}>
            Barkod okutarak veya fotoğraf çekerek öğünlerini saniyeler içinde
            günlüğüne ekle.
          </Text>
          <View style={s.divider} />
          <View style={s.macroRow}>
            {[
              ["Protein", n(data?.targetProteinGrams) + "g", colors.teal],
              ["Karb", n(data?.targetCarbohydratesGrams) + "g", colors.mustard],
              ["Yağ", n(data?.targetFatGrams) + "g", colors.coral],
            ].map((x) => (
              <View style={s.macro} key={x[0]}>
                <View style={s.macroLabel}>
                  <Text style={s.macroName}>{x[0]}</Text>
                  <Text style={s.macroValue}>{x[1]}</Text>
                </View>
                <View style={s.track}>
                  <View
                    style={[
                      s.trackFill,
                      { backgroundColor: x[2], width: "70%" },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={s.sectionTitle}>
          <Text style={s.sectionText}>Hızlı Analiz & Tarama</Text>
          <Text style={s.link}>Rehber</Text>
        </View>
        <Pressable
          style={[s.actionCard, s.mintCard]}
          onPress={() => setAnalysisOpen(true)}
        >
          <View style={s.actionIcon}>
            <Text style={s.actionIconText}>▣</Text>
          </View>
          <View style={s.actionBody}>
            <Text style={s.actionTitle}>AI ile Yemek Analizi</Text>
            <Text style={s.actionText}>
              Tabağının fotoğrafını çek; kalori, porsiyonu ve besin değerlerini
              anında öğren.
            </Text>
            <View style={s.tags}>
              <Text style={s.tag}>Backend analizi</Text>
              <Text style={s.tag}>Tek Çekim</Text>
            </View>
          </View>
          <Text style={s.chevron}>›</Text>
        </Pressable>
        <Pressable
          style={[s.actionCard, s.orangeCard]}
          onPress={() => setBarcodeOpen(true)}
        >
          <View style={s.actionIcon}>
            <Text style={s.actionIconText}>▦</Text>
          </View>
          <View style={s.actionBody}>
            <Text style={s.actionTitle}>Barkod Tarayıcı</Text>
            <Text style={s.actionText}>
              Paketi ürünlerin barkodunu kameraya tut, katkı maddeleri ve besin
              değerlerini gör.
            </Text>
            <View style={s.tags}>
              <Text style={s.tag}>Anında Tarama</Text>
              <Text style={s.tag}>Nutri-Score</Text>
            </View>
          </View>
          <Text style={s.chevron}>›</Text>
        </Pressable>
        <View style={s.sectionTitle}>
          <Text style={s.sectionText}>Bugünkü Öğünler</Text>
          <Text style={s.link}>Tümünü Gör</Text>
        </View>
        {foods.length ? (
          foods.map((f) => (
            <View style={s.food} key={f.id}>
              <Text style={s.foodEmoji}>🍽️</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.foodName}>{f.foodName}</Text>
                <Text style={s.foodMeta}>
                  {Math.round(f.calories ?? 0)} kcal
                </Text>
              </View>
              <Text style={s.chevron}>›</Text>
            </View>
          ))
        ) : (
          <View style={s.empty}>
            <Text style={s.emptyText}>Bugün henüz öğün eklemedin.</Text>
          </View>
        )}
      </ScrollView>
      <BarcodeScannerModal
        visible={barcodeOpen}
        onClose={() => setBarcodeOpen(false)}
      />
      <FoodAnalysisModal
        visible={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />
    </Screen>
  );
}
const s = StyleSheet.create({
  content: { paddingBottom: 26 },
  time: { fontSize: 11, color: colors.espresso, marginBottom: 7 },
  date: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: colors.orange,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 18,
  },
  greeting: { fontFamily: type.display, fontSize: 25, color: colors.espresso },
  subGreeting: { fontSize: 12, color: "rgba(43,33,28,.62)", marginTop: 3 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#f3dbe5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.coral,
    marginRight: 4,
  },
  avatarText: { fontFamily: type.display, fontSize: 20, color: colors.plum },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -5,
    backgroundColor: colors.mustard,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  avatarBadgeText: { fontSize: 10, fontWeight: "800", color: colors.espresso },
  summary: {
    backgroundColor: colors.plum,
    borderRadius: 22,
    padding: 17,
    marginBottom: 22,
  },
  summaryHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pill: {
    backgroundColor: "rgba(246,235,216,.18)",
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pillText: { fontSize: 10, fontWeight: "800", color: colors.cream },
  summaryCalories: { fontSize: 23, fontWeight: "900", color: colors.cream },
  summaryUnit: { fontSize: 10, fontWeight: "500" },
  summaryTitle: {
    fontFamily: type.display,
    fontSize: 18,
    color: colors.cream,
    marginTop: 5,
  },
  summaryCopy: {
    fontSize: 11,
    lineHeight: 16,
    color: colors.cream,
    opacity: 0.88,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(246,235,216,.25)",
    marginVertical: 14,
  },
  macroRow: { flexDirection: "row", gap: 9 },
  macro: { flex: 1 },
  macroLabel: { flexDirection: "row", justifyContent: "space-between" },
  macroName: { fontSize: 9, color: colors.cream, opacity: 0.8 },
  macroValue: { fontSize: 10, fontWeight: "800", color: colors.cream },
  track: {
    height: 5,
    backgroundColor: "rgba(246,235,216,.25)",
    borderRadius: 3,
    marginTop: 5,
  },
  trackFill: { height: 5, borderRadius: 3 },
  sectionTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 3,
  },
  sectionText: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.espresso,
  },
  link: { fontSize: 11, color: colors.orange, fontWeight: "800" },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 17,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderTopWidth: 3,
    marginBottom: 12,
  },
  mintCard: { borderTopColor: "#0bbba1" },
  orangeCard: { borderTopColor: colors.orange },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#d9f8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconText: {
    fontSize: 24,
    color: colors.teal,
  },
  actionBody: { flex: 1, marginLeft: 12 },
  actionTitle: { fontSize: 15, fontWeight: "900", color: colors.espresso },
  actionText: {
    fontSize: 11,
    lineHeight: 15,
    color: "rgba(43,33,28,.62)",
    marginTop: 4,
  },
  tags: { flexDirection: "row", gap: 7, marginTop: 8 },
  tag: {
    fontSize: 9,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "rgba(43,33,28,.06)",
    color: colors.espresso,
  },
  chevron: { fontSize: 25, color: "rgba(43,33,28,.35)", marginLeft: 6 },
  food: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(43,33,28,.12)",
    borderRadius: 14,
    backgroundColor: colors.paper,
    marginBottom: 8,
  },
  foodEmoji: { fontSize: 24, marginRight: 10 },
  foodName: { fontSize: 13, fontWeight: "800", color: colors.espresso },
  foodMeta: { fontSize: 11, color: "rgba(43,33,28,.6)", marginTop: 3 },
  empty: { padding: 18, borderRadius: 14, backgroundColor: colors.paper },
  emptyText: { fontSize: 12, color: "rgba(43,33,28,.6)" },
});
