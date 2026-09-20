import React, { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch, apiRoutes } from "../../api/client";
import { colors, type } from "../../theme";
import { Eyebrow, Screen, Section } from "../../components/RetroUI";

type Day = {
  date: string; consumedCalories: number; targetCalories?: number | null;
  consumedProteinGrams: number; targetProteinGrams?: number | null;
  consumedCarbohydratesGrams: number; targetCarbohydratesGrams?: number | null;
  consumedFatGrams: number; targetFatGrams?: number | null;
  calorieCompletionPercentage?: number | null; hasLog: boolean;
};
type Weekly = {
  weekStart: string; weekEnd: string; dailyCaloriesTarget?: number | null;
  dailyProteinTarget?: number | null; dailyCarbohydratesTarget?: number | null;
  dailyFatTarget?: number | null; averageCalories: number; averageProteinGrams: number;
  averageCarbohydratesGrams: number; averageFatGrams: number;
  averageCalorieCompletionPercentage?: number | null; days: Day[];
};
const number = (value?: number | null) => Math.round(value ?? 0).toLocaleString("tr-TR");
const monday = () => {
  const now = new Date();
  const day = now.getDay() || 7;
  now.setDate(now.getDate() - day + 1);
  const pad = (x: number) => String(x).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export function AnalyticsScreen() {
  const [data, setData] = useState<Weekly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await apiFetch<Weekly>(apiRoutes.weekly(monday()))); }
    catch (e) { setError(e instanceof Error ? e.message : "Analiz verileri alınamadı."); }
    finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return <Screen>
    <Eyebrow>Haftalık bakış</Eyebrow>
    <Text style={s.title}>Ritmini gör.</Text>
    <Text style={s.intro}>Son 7 gündeki beslenme verilerini ve hedeflerine uyumunu gerçek kayıtların üzerinden incele.</Text>
    {loading && <View style={s.center}><ActivityIndicator color={colors.orange} /><Text style={s.muted}>Analiz hazırlanıyor...</Text></View>}
    {!loading && error && <View style={s.message}><Text style={s.messageTitle}>Analiz yüklenemedi</Text><Text style={s.muted}>{error}</Text><Pressable style={s.retry} onPress={() => void load()}><Text style={s.retryText}>Tekrar dene</Text></Pressable></View>}
    {!loading && !error && data && <>
      <View style={s.chart}>
        <Section title="Kalori günlüğü" />
        <View style={s.bars}>
          {data.days.map((day) => {
            const max = Math.max(data.dailyCaloriesTarget ?? 0, ...data.days.map((item) => item.consumedCalories), 1);
            const height = Math.max(day.consumedCalories > 0 ? 7 : 2, (day.consumedCalories / max) * 145);
            return <View style={s.col} key={day.date}><View style={[s.bar, { height, backgroundColor: day.hasLog ? colors.orange : "#ded3c3" }]} /><Text style={s.day}>{new Date(`${day.date}T12:00:00`).toLocaleDateString("tr-TR", { weekday: "short" }).slice(0, 2)}</Text><Text style={s.dayValue}>{day.consumedCalories ? number(day.consumedCalories) : "—"}</Text></View>;
          })}
        </View>
        <View style={s.foot}><Text style={s.muted}>Hedef: {number(data.dailyCaloriesTarget)} kcal</Text><Text style={s.muted}>Hafta: {data.weekStart} – {data.weekEnd}</Text></View>
      </View>
      <View style={s.stats}>
        <Stat color={colors.teal} label="ORTALAMA" value={number(data.averageCalories)} small="kcal / gün" />
        <Stat color={colors.plum} label="HEDEFE UYUM" value={`%${number(data.averageCalorieCompletionPercentage)}`} small="kayıtlı günler" />
      </View>
      <Section title="Makro ortalamaları" />
      <View style={s.macroGrid}>
        <Macro label="Protein" value={data.averageProteinGrams} target={data.dailyProteinTarget} color={colors.teal} />
        <Macro label="Karbonhidrat" value={data.averageCarbohydratesGrams} target={data.dailyCarbohydratesTarget} color={colors.mustard} />
        <Macro label="Yağ" value={data.averageFatGrams} target={data.dailyFatTarget} color={colors.coral} />
      </View>
    </>}
  </Screen>;
}
function Stat({ color, label, value, small }: { color: string; label: string; value: string; small: string }) { return <View style={[s.stat, { backgroundColor: color }]}><Text style={s.label}>{label}</Text><Text style={s.value}>{value}</Text><Text style={s.small}>{small}</Text></View>; }
function Macro({ label, value, target, color }: { label: string; value: number; target?: number | null; color: string }) { const width = `${Math.min(100, target ? (value / target) * 100 : 0)}%` as `${number}%`; return <View style={s.macro}><Text style={s.macroLabel}>{label.toUpperCase()}</Text><Text style={s.macroValue}>{number(value)} <Text style={s.macroTarget}>/ {number(target)} g</Text></Text><View style={s.track}><View style={[s.trackFill, { width, backgroundColor: color }]} /></View></View>; }
const s = StyleSheet.create({
  title: { fontFamily: type.display, fontSize: 33, color: colors.espresso, marginTop: 5 }, intro: { fontSize: 13, lineHeight: 19, color: "rgba(43,33,28,.68)", marginVertical: 10 }, center: { alignItems: "center", paddingVertical: 70, gap: 10 }, chart: { padding: 15, borderWidth: 2, borderColor: colors.espresso, borderRadius: 17, backgroundColor: colors.paper, marginTop: 12 }, bars: { height: 185, flexDirection: "row", alignItems: "flex-end", gap: 6, borderBottomWidth: 2, borderBottomColor: colors.espresso }, col: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 4 }, bar: { width: "75%", maxWidth: 30, minHeight: 2, borderWidth: 1, borderColor: colors.espresso, borderBottomWidth: 0, borderTopLeftRadius: 7, borderTopRightRadius: 7 }, day: { fontSize: 9, fontWeight: "800", color: colors.espresso }, dayValue: { fontSize: 7, color: "rgba(43,33,28,.55)" }, foot: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, gap: 8 }, muted: { fontSize: 11, color: "rgba(43,33,28,.62)" }, stats: { flexDirection: "row", gap: 10, marginTop: 14 }, stat: { flex: 1, padding: 14, borderRadius: 15, borderWidth: 2, borderColor: colors.espresso }, label: { fontSize: 10, letterSpacing: 1, color: colors.cream, fontWeight: "800" }, value: { fontSize: 26, color: colors.cream, fontWeight: "800", marginTop: 4 }, small: { fontSize: 11, color: colors.cream }, macroGrid: { flexDirection: "row", gap: 8 }, macro: { flex: 1, minHeight: 92, borderRadius: 13, borderWidth: 2, borderColor: colors.espresso, backgroundColor: colors.paper, padding: 10 }, macroLabel: { fontSize: 8, color: "rgba(43,33,28,.6)", fontWeight: "900" }, macroValue: { fontSize: 13, color: colors.espresso, fontWeight: "900", marginTop: 10 }, macroTarget: { fontSize: 9, fontWeight: "500" }, track: { height: 7, backgroundColor: "rgba(43,33,28,.16)", borderRadius: 4, overflow: "hidden", marginTop: 12 }, trackFill: { height: "100%", borderRadius: 4 }, message: { marginTop: 20, padding: 18, borderRadius: 15, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.espresso }, messageTitle: { fontFamily: type.display, color: colors.plum, fontSize: 20 }, retry: { marginTop: 14, padding: 11, borderRadius: 10, backgroundColor: colors.orange, alignItems: "center" }, retryText: { color: colors.cream, fontWeight: "900" },
});
