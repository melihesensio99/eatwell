import React, { useCallback, useEffect, useState } from "react";
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
import { apiConfigured, apiFetch, apiRoutes } from "../../api/client";
import { colors, type } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import {
  Eyebrow,
  MacroCard,
  Screen,
  Section,
  Sticker,
  ui,
} from "../../components/RetroUI";
type Food = {
  id: string;
  meal: string;
  mealType: string;
  name: string;
  emoji: string;
  qty: string;
  quantityGrams: number;
  kcal: number;
  protein: number;
  caloriesPer100Grams?: number | null;
  proteinPer100Grams?: number | null;
  carbohydratesPer100Grams?: number | null;
  fatPer100Grams?: number | null;
};
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
  waterConsumedMilliliters: number;
};
type Goal = {
  dailyCalories: number;
  proteinGrams?: number | null;
  carbohydratesGrams?: number | null;
  fatGrams?: number | null;
};
const meals = ["Kahvaltı", "Öğle", "Akşam", "Atıştırmalık"];
const date = () => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
const n = (v: number | null | undefined) =>
  Math.round(v ?? 0).toLocaleString("tr-TR");
function LegacyDailyLogScreen() {
  const [data, setData] = useState<Summary>({
    consumedCalories: 0,
    targetCalories: null,
    remainingCalories: null,
    calorieCompletionPercentage: null,
    consumedProteinGrams: 0,
    targetProteinGrams: null,
    consumedCarbohydratesGrams: 0,
    targetCarbohydratesGrams: null,
    consumedFatGrams: 0,
    targetFatGrams: null,
    waterConsumedMilliliters: 0,
  });
  const [foods, setFoods] = useState<Food[]>([]);
  const [waterGoal, setWaterGoal] = useState(0);
  const [searchMeal, setSearchMeal] = useState<string | null>(null);
  const load = () => {
    if (!apiConfigured()) return;
    Promise.all([
      apiFetch<Summary>(apiRoutes.summary(date())),
      apiFetch<any>(apiRoutes.dailyLog(date())),
      apiFetch<{ waterGoalMilliliters?: number }>("/api/profile"),
    ])
      .then(([summary, log, profile]) => {
        setData(summary);
        setWaterGoal(profile.waterGoalMilliliters ?? 0);
        setFoods(
          (log.items ?? []).map((x: any) => ({
            id: x.id,
            mealType: x.mealType,
            meal:
              x.mealType === "breakfast"
                ? "Kahvaltı"
                : x.mealType === "lunch"
                  ? "Öğle"
                  : x.mealType === "dinner"
                    ? "Akşam"
                    : "Atıştırmalık",
            name: x.foodName,
            emoji: "🍽️",
            qty: `${x.quantityGrams} g`,
            quantityGrams: Number(x.quantityGrams ?? 0),
            kcal: Math.round(x.calories ?? 0),
            protein: Math.round(x.proteinGrams ?? 0),
            caloriesPer100Grams: x.quantityGrams
              ? ((x.calories ?? 0) * 100) / x.quantityGrams
              : null,
            proteinPer100Grams: x.quantityGrams
              ? ((x.proteinGrams ?? 0) * 100) / x.quantityGrams
              : null,
            carbohydratesPer100Grams: x.quantityGrams
              ? ((x.carbohydratesGrams ?? 0) * 100) / x.quantityGrams
              : null,
            fatPer100Grams: x.quantityGrams
              ? ((x.fatGrams ?? 0) * 100) / x.quantityGrams
              : null,
          })),
        );
      })
      .catch(() => {});
  };
  useEffect(load, []);
  const add = (_meal: string) => {};
  return (
    <Screen>
      <Eyebrow>Günlük takip</Eyebrow>
      <Text style={s.title}>Bugünün tabağı</Text>
      <View style={s.dateRow}>
        <Text style={s.dateText}>
          {new Intl.DateTimeFormat("tr-TR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }).format(new Date())}
        </Text>
        <Text style={s.today}>Bugün</Text>
      </View>
      <View style={s.hero}>
        <View style={s.heroTop}>
          <View style={s.gauge}>
            <View style={s.gaugeInner}>
              <Text style={s.gaugeNumber}>{n(data.consumedCalories)}</Text>
              <Text style={s.gaugeUnit}>/ {n(data.targetCalories)} kcal</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Sticker color={colors.mustard}>
              %{n(data.calorieCompletionPercentage)}
            </Sticker>
            <Text style={s.heroCopy}>
              Kalan{" "}
              <Text style={{ fontWeight: "800" }}>
                {n(data.remainingCalories)} kcal
              </Text>{" "}
              alanın var.
            </Text>
          </View>
        </View>
        <View style={s.heroStats}>
          {[
            ["Tüketilen", n(data.consumedCalories)],
            ["Kalan", n(data.remainingCalories)],
            ["Oran", `%${n(data.calorieCompletionPercentage)}`],
          ].map((x) => (
            <View key={x[0]}>
              <Text style={s.statLabel}>{x[0]}</Text>
              <Text style={s.statValue}>{x[1]}</Text>
            </View>
          ))}
        </View>
      </View>
      <Section title="Makroların" action="Detaylı analiz →" />
      <View style={ui.macroGrid}>
        <MacroCard
          label="PROTEİN"
          value={`${n(data.consumedProteinGrams)} / ${n(data.targetProteinGrams)}g`}
          background={colors.mustard}
        />
        <MacroCard
          label="KARBONHİDRAT"
          value={`${n(data.consumedCarbohydratesGrams)} / ${n(data.targetCarbohydratesGrams)}g`}
          background={colors.teal}
          color={colors.cream}
        />
        <MacroCard
          label="YAĞ"
          value={`${n(data.consumedFatGrams)} / ${n(data.targetFatGrams)}g`}
          background={colors.coral}
        />
      </View>
      <Section title="Su sayacı" />
      <View style={s.water}>
        <Text style={s.waterEmoji}>💧</Text>
        <View>
          <Text style={s.waterValue}>
            {n(data.waterConsumedMilliliters)} ml
          </Text>
          <Text style={ui.muted}>
            Günlük hedefin {waterGoal.toLocaleString("tr-TR")} ml
          </Text>
        </View>
        <Pressable
          style={s.add}
          onPress={async () => {
            if (apiConfigured())
              await apiFetch(apiRoutes.water, {
                method: "POST",
                body: JSON.stringify({ milliliters: 250, logDate: date() }),
              });
            setData((v) => ({
              ...v,
              waterConsumedMilliliters: v.waterConsumedMilliliters + 250,
            }));
          }}
        >
          <Text style={s.addText}>+</Text>
        </Pressable>
      </View>
      <Section title="Öğünlerin" />
      {meals.map((meal) => (
        <View style={s.meal} key={meal}>
          <View style={s.mealHead}>
            <Text style={s.mealTitle}>{meal}</Text>
            <Pressable onPress={() => add(meal)}>
              <Text style={s.plus}>+</Text>
            </Pressable>
          </View>
          {foods
            .filter((f) => f.meal === meal)
            .map((f) => (
              <View style={s.item} key={f.id}>
                <Text style={s.emoji}>{f.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{f.name}</Text>
                  <Text style={ui.muted}>
                    {f.qty} · {f.kcal} kcal · {f.protein}g protein
                  </Text>
                </View>
                <Text style={s.delete}>×</Text>
              </View>
            ))}
        </View>
      ))}
    </Screen>
  );
}
const s = StyleSheet.create({
  title: {
    fontFamily: type.display,
    fontSize: 33,
    color: colors.espresso,
    marginTop: 5,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: { fontSize: 14, fontWeight: "700", color: colors.espresso },
  today: { fontSize: 12, fontWeight: "800", color: colors.orange },
  hero: {
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 24,
    padding: 18,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 18,
  },
  gauge: {
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: colors.mustard,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeInner: {
    width: 109,
    height: 109,
    borderRadius: 55,
    backgroundColor: colors.orange,
    borderWidth: 2,
    borderColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeNumber: { fontSize: 28, fontWeight: "800", color: colors.cream },
  gaugeUnit: { fontSize: 11, color: colors.cream },
  heroCopy: {
    color: colors.cream,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  heroStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(246,235,216,.45)",
    paddingTop: 11,
  },
  statLabel: { fontSize: 10, color: colors.cream, opacity: 0.75 },
  statValue: { fontSize: 18, color: colors.cream, fontWeight: "800" },
  water: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 16,
    backgroundColor: colors.paper,
  },
  waterEmoji: { fontSize: 30, marginRight: 12 },
  waterValue: { fontSize: 22, fontWeight: "800", color: colors.espresso },
  add: {
    marginLeft: "auto",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { fontSize: 25, color: colors.cream },
  meal: {
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 17,
    backgroundColor: colors.paper,
    overflow: "hidden",
    marginBottom: 13,
  },
  mealHead: {
    padding: 13,
    backgroundColor: colors.mustard,
    borderBottomWidth: 2,
    borderBottomColor: colors.espresso,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTitle: { fontFamily: type.display, fontSize: 17, color: colors.espresso },
  plus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.espresso,
    color: colors.cream,
    textAlign: "center",
    fontSize: 22,
    lineHeight: 25,
  },
  item: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  emoji: {
    fontSize: 23,
    width: 40,
    height: 40,
    textAlign: "center",
    textAlignVertical: "center",
    backgroundColor: colors.mustard,
    borderRadius: 11,
  },
  name: { fontSize: 14, fontWeight: "800", color: colors.espresso },
  delete: { fontSize: 22, color: colors.plum },
});

export function DailyLogScreen() {
  const [data, setData] = useState<Summary>({
    consumedCalories: 0,
    targetCalories: null,
    remainingCalories: null,
    calorieCompletionPercentage: null,
    consumedProteinGrams: 0,
    targetProteinGrams: null,
    consumedCarbohydratesGrams: 0,
    targetCarbohydratesGrams: null,
    consumedFatGrams: 0,
    targetFatGrams: null,
    waterConsumedMilliliters: 0,
  });
  const [foods, setFoods] = useState<Food[]>([]);
  const [waterGoal, setWaterGoal] = useState(0);
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState("250");
  const [waterBusy, setWaterBusy] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editBusy, setEditBusy] = useState(false);
  const [searchMeal, setSearchMeal] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(date());
  const load = async (day: string) => {
    if (!apiConfigured()) return;
    try {
      const [summary, log, profile, goal] = await Promise.all([
        apiFetch<Summary>(apiRoutes.summary(day)),
        apiFetch<any>(apiRoutes.dailyLog(day)),
        apiFetch<{ waterGoalMilliliters?: number }>("/api/profile"),
        apiFetch<Goal>("/api/nutrition-goals"),
      ]);
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
        setWaterGoal(profile.waterGoalMilliliters ?? 0);
        setFoods(
          (log.items ?? []).map((x: any) => ({
            id: x.id,
            meal:
              x.mealType === "breakfast"
                ? "Kahvaltı"
                : x.mealType === "lunch"
                  ? "Öğle"
                  : x.mealType === "dinner"
                    ? "Akşam"
                    : "Atıştırmalık",
            name: x.foodName,
            emoji: "🍽️",
            qty: `${x.quantityGrams} g`,
            kcal: Math.round(x.calories ?? 0),
            protein: Math.round(x.proteinGrams ?? 0),
            quantityGrams: Number(x.quantityGrams ?? 0),
            caloriesPer100Grams: x.quantityGrams
              ? ((x.calories ?? 0) * 100) / x.quantityGrams
              : null,
            proteinPer100Grams: x.quantityGrams
              ? ((x.proteinGrams ?? 0) * 100) / x.quantityGrams
              : null,
            carbohydratesPer100Grams: x.quantityGrams
              ? ((x.carbohydratesGrams ?? 0) * 100) / x.quantityGrams
              : null,
            fatPer100Grams: x.quantityGrams
              ? ((x.fatGrams ?? 0) * 100) / x.quantityGrams
              : null,
          })),
        );
    } catch {
      // Keep the current values if a refresh briefly fails.
    }
  };
  useEffect(() => {
    void load(selectedDate);
  }, [selectedDate]);
  useFocusEffect(
    useCallback(() => {
      void load(selectedDate);
    }, [selectedDate]),
  );
  const changeDate = (offset: number) => {
    const next = new Date(`${selectedDate}T00:00:00`);
    next.setDate(next.getDate() + offset);
    const pad = (value: number) => String(value).padStart(2, "0");
    setSelectedDate(
      `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
    );
  };
  const add = async (meal: string, selected: SearchFood) => {
    const food: Food = {
      id: Date.now().toString(),
      meal,
      name: selected.name,
      emoji: selected.name.toLocaleLowerCase("tr-TR").includes("muz")
        ? "🍌"
        : "🍽️",
      qty: "100 g",
      kcal: Math.round(selected.caloriesPer100Grams ?? 0),
      protein: Math.round(selected.proteinPer100Grams ?? 0),
      mealType:
        meal === "Kahvaltı"
          ? "breakfast"
          : meal === "Öğle"
            ? "lunch"
            : meal === "Akşam"
              ? "dinner"
              : "snack",
      quantityGrams: 100,
      caloriesPer100Grams: selected.caloriesPer100Grams ?? 0,
      proteinPer100Grams: selected.proteinPer100Grams ?? 0,
      carbohydratesPer100Grams: selected.carbohydratesPer100Grams ?? 0,
      fatPer100Grams: selected.fatPer100Grams ?? 0,
    };
    setFoods((current) => [...current, food]);
    if (apiConfigured())
      await apiFetch(apiRoutes.items, {
        method: "POST",
        body: JSON.stringify({
          foodExternalId: selected.externalId,
          foodName: selected.name,
          quantityGrams: 100,
          mealType:
            meal === "Kahvaltı"
              ? "breakfast"
              : meal === "Öğle"
                ? "lunch"
                : meal === "Akşam"
                  ? "dinner"
                  : "snack",
          logDate: selectedDate,
          caloriesPer100Grams: selected.caloriesPer100Grams ?? 0,
          proteinPer100Grams: selected.proteinPer100Grams ?? 0,
          carbohydratesPer100Grams: selected.carbohydratesPer100Grams ?? 0,
          fatPer100Grams: selected.fatPer100Grams ?? 0,
          brand: null,
          barcode: null,
        }),
      });
      await load(selectedDate);
  };
  const openEdit = (food: Food) => {
    setEditingFood(food);
    setEditQuantity(String(food.quantityGrams));
  };
  const updateFood = async () => {
    if (!editingFood) return;
    const quantity = Number(editQuantity.replace(",", "."));
    if (!Number.isFinite(quantity) || quantity <= 0) {
      Alert.alert("Gram miktarını kontrol et", "0’dan büyük bir değer gir.");
      return;
    }
    setEditBusy(true);
    try {
      if (!apiConfigured()) throw new Error("Backend bağlantısı yok.");
      await apiFetch(apiRoutes.dailyLogItem(editingFood.id), {
        method: "PUT",
        body: JSON.stringify({
          itemId: editingFood.id,
          quantityGrams: quantity,
          caloriesPer100Grams: editingFood.caloriesPer100Grams,
          proteinPer100Grams: editingFood.proteinPer100Grams,
          carbohydratesPer100Grams: editingFood.carbohydratesPer100Grams,
          fatPer100Grams: editingFood.fatPer100Grams,
        }),
      });
      setEditingFood(null);
      await load(selectedDate);
    } catch (error) {
      Alert.alert(
        "Besin güncellenemedi",
        error instanceof Error ? error.message : "Tekrar dene.",
      );
    } finally {
      setEditBusy(false);
    }
  };
  const deleteFood = (food: Food) => {
    Alert.alert("Besini sil", `${food.name} günlükten silinsin mi?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await apiFetch(apiRoutes.dailyLogItem(food.id), {
              method: "DELETE",
            });
            setFoods((current) =>
              current.filter((item) => item.id !== food.id),
            );
            await load(selectedDate);
          } catch (error) {
            Alert.alert(
              "Besin silinemedi",
              error instanceof Error ? error.message : "Tekrar dene.",
            );
          }
        },
      },
    ]);
  };
  const addWater = async () => {
    const amount = Number(waterAmount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
      Alert.alert(
        "Su miktarını kontrol et",
        "1 ile 5000 ml arasında bir değer gir.",
      );
      return;
    }
    setWaterBusy(true);
    try {
      if (!apiConfigured())
        throw new Error("Backend bağlantısı yapılandırılmamış.");
      await apiFetch(apiRoutes.water, {
        method: "POST",
        body: JSON.stringify({ milliliters: amount, logDate: selectedDate }),
      });
      setData((v) => ({
        ...v,
        waterConsumedMilliliters: v.waterConsumedMilliliters + amount,
      }));
      setWaterModalOpen(false);
      setWaterAmount("250");
    } catch (error) {
      Alert.alert(
        "Su kaydedilemedi",
        error instanceof Error ? error.message : "Tekrar dene.",
      );
    } finally {
      setWaterBusy(false);
    }
  };
  const percent = Math.min(
    100,
    Math.max(0, data.calorieCompletionPercentage ?? 0),
  );
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={d.content}
      >
        <Text style={d.eyebrow}>● GÜNLÜK TAKİP</Text>
        <View style={d.titleRow}>
          <Text style={d.title}>Bugünün Tabağı</Text>
        </View>
        <View style={d.dateNav}>
          <Pressable onPress={() => changeDate(-1)}>
            <Text style={d.arrow}>‹</Text>
          </Pressable>
          <Text style={d.date}>
            {new Intl.DateTimeFormat("tr-TR", {
              day: "2-digit",
              month: "long",
            }).format(new Date(`${selectedDate}T00:00:00`))}
          </Text>
          <Text style={d.today}>
            {selectedDate === date() ? "BUGÜN" : "GÜN"}
          </Text>
          <Pressable onPress={() => changeDate(1)}>
            <Text style={d.arrow}>›</Text>
          </Pressable>
        </View>
        <View style={d.hero}>
          <View style={d.heroTop}>
            <View style={d.ring}>
              <View style={d.ringInner}>
                <Text style={d.ringNumber}>{n(data.consumedCalories)}</Text>
                <Text style={d.ringUnit}>/ {n(data.targetCalories)}</Text>
                <Text style={d.kcal}>KCAL</Text>
              </View>
            </View>
            <View style={d.heroCopy}>
              <Text style={d.badge}>✦ Hedefin %{Math.round(percent)}’i</Text>
              <Text style={d.heroTitle}>Harika bir başlangıç!</Text>
              <Text style={d.heroText}>
                Bugün tüketebileceğin {n(data.remainingCalories)} kcal alanın
                var.
              </Text>
            </View>
          </View>
          <View style={d.heroStats}>
            {[
              ["TÜKETİLEN", n(data.consumedCalories)],
              ["KALAN", n(data.remainingCalories)],
              ["ORAN", `%${Math.round(percent)}`],
            ].map((x) => (
              <View key={x[0]}>
                <Text style={d.statLabel}>{x[0]}</Text>
                <Text style={d.statValue}>
                  {x[1]}
                  <Text style={d.statUnit}> kcal</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View style={d.sectionHead}>
          <Text style={d.sectionTitle}>Makroların</Text>
          <Text style={d.detail}>Detaylı Analiz ›</Text>
        </View>
        <View style={d.macroRow}>
          {[
            [
              "PROTEİN",
              data.consumedProteinGrams,
              data.targetProteinGrams,
              colors.teal,
            ],
            [
              "KARB",
              data.consumedCarbohydratesGrams,
              data.targetCarbohydratesGrams,
              colors.mustard,
            ],
            ["YAĞ", data.consumedFatGrams, data.targetFatGrams, colors.coral],
          ].map((x) => (
            <View style={d.macro} key={x[0]}>
              <Text style={d.macroName}>{x[0]}</Text>
              <Text style={d.macroValue}>
                {n(x[1] as number)}
                <Text style={d.macroTarget}> / {n(x[2] as number)}g</Text>
              </Text>
              <View style={d.track}>
                <View
                  style={[
                    d.fill,
                    {
                      backgroundColor: x[3] as string,
                      width: `${Math.min(100, ((x[1] as number) / ((x[2] as number) || 1)) * 100)}%`,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
        <Pressable style={d.water} onPress={() => setWaterModalOpen(true)}>
          <Text style={d.waterIcon}>💧</Text>
          <View style={{ flex: 1 }}>
            <Text style={d.waterTitle}>Su kaydı</Text>
            <Text style={d.waterValue}>
              {n(data.waterConsumedMilliliters)} ml{" "}
              <Text style={d.waterTarget}>/ {n(waterGoal)} ml</Text>
            </Text>
            <Text style={d.waterCaption}>Günlük hedefin {n(waterGoal)} ml</Text>
          </View>
          <View style={d.waterAction}>
            <Text style={d.waterActionText}>+ Su ekle</Text>
          </View>
        </Pressable>
        <View style={d.sectionHead}>
          <Text style={d.sectionTitle}>Öğünlerin</Text>
          <Text style={d.detail}>{foods.length} / 4 Kayıtlı</Text>
        </View>
        {meals.map((meal) => (
          <View style={d.meal} key={meal}>
            <View style={d.mealHead}>
              <View>
                <Text style={d.mealTitle}>{meal}</Text>
                <Text style={d.mealMeta}>
                  {foods
                    .filter((f) => f.meal === meal)
                    .reduce((a, f) => a + f.kcal, 0)}{" "}
                  kcal
                </Text>
              </View>
              <Pressable style={d.mealPlus} onPress={() => setSearchMeal(meal)}>
                <Text style={d.mealPlusText}>+</Text>
              </Pressable>
            </View>
            {foods
              .filter((f) => f.meal === meal)
              .map((f) => (
                <Pressable
                  style={d.food}
                  key={f.id}
                  onPress={() => openEdit(f)}
                >
                  <Text style={d.foodEmoji}>{f.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={d.foodName}>{f.name}</Text>
                    <Text style={d.foodMeta}>
                      {f.qty} · {f.kcal} kcal · {f.protein}g protein
                    </Text>
                  </View>
                  <Pressable hitSlop={10} onPress={() => deleteFood(f)}>
                    <Text style={d.remove}>×</Text>
                  </Pressable>
                </Pressable>
              ))}
          </View>
        ))}
      </ScrollView>
      <FoodSearchModal
        meal={searchMeal}
        onClose={() => setSearchMeal(null)}
        onAdd={(food) => {
          void add(searchMeal ?? "Kahvaltı", food);
          setSearchMeal(null);
        }}
      />
      <Modal
        visible={Boolean(editingFood)}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingFood(null)}
      >
        <KeyboardAvoidingView
          style={d.editOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={d.editModal}>
            <View style={d.editHeader}>
              <Text style={d.editTitle}>Besini düzenle</Text>
              <Pressable hitSlop={12} onPress={() => setEditingFood(null)}>
                <Text style={d.editClose}>×</Text>
              </Pressable>
            </View>
            <Text style={d.editFoodName}>{editingFood?.name}</Text>
            <Text style={d.editLabel}>MİKTAR (GRAM)</Text>
            <TextInput
              value={editQuantity}
              onChangeText={setEditQuantity}
              keyboardType="decimal-pad"
              style={d.editInput}
              autoFocus
            />
            <View style={d.editActions}>
              <Pressable
                style={d.deleteButton}
                onPress={() => editingFood && deleteFood(editingFood)}
              >
                <Text style={d.deleteButtonText}>Sil</Text>
              </Pressable>
              <Pressable
                style={d.editSave}
                onPress={updateFood}
                disabled={editBusy}
              >
                <Text style={d.editSaveText}>
                  {editBusy ? "Kaydediliyor…" : "Kaydet"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={waterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setWaterModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={d.waterOverlay}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={d.waterModal}>
            <View style={d.waterModalHeader}>
              <Text style={d.waterModalTitle}>💧 Su ekle</Text>
              <Pressable
                style={d.waterClose}
                hitSlop={12}
                onPress={() => setWaterModalOpen(false)}
              >
                <Text style={d.waterCloseText}>×</Text>
              </Pressable>
            </View>
            <Text style={d.waterModalHint}>
              İçtiğin su miktarını ml olarak gir.
            </Text>
            <TextInput
              value={waterAmount}
              onChangeText={setWaterAmount}
              keyboardType="number-pad"
              placeholder="250"
              placeholderTextColor="#8f837b"
              style={d.waterInput}
              returnKeyType="done"
            />
            <View style={d.waterModalActions}>
              <Pressable hitSlop={8} onPress={() => setWaterModalOpen(false)}>
                <Text style={d.waterCancel}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={d.waterSave}
                onPress={addWater}
                disabled={waterBusy}
              >
                <Text style={d.waterSaveText}>
                  {waterBusy ? "Kaydediliyor…" : "Kaydet"}
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

type SearchFood = {
  externalId: string;
  name: string;
  brand?: string;
  caloriesPer100Grams?: number;
  proteinPer100Grams?: number;
  carbohydratesPer100Grams?: number;
  fatPer100Grams?: number;
  imageUrl?: string | null;
};

function FoodSearchModal({
  meal,
  onClose,
  onAdd,
}: {
  meal: string | null;
  onClose: () => void;
  onAdd: (food: SearchFood) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "favorites">("all");
  useEffect(() => {
    if (!meal) return;
    setQuery("");
    setResults([]);
    setError("");
    setFilter("all");
  }, [meal]);
  const loadSaved = async (nextFilter: "recent" | "favorites") => {
    if (!apiConfigured()) {
      setError("Backend bağlantısı yapılandırılmamış.");
      return;
    }
    setFilter(nextFilter);
    setQuery("");
    setLoading(true);
    setError("");
    try {
      const saved = await apiFetch<any[]>(
        nextFilter === "recent"
          ? apiRoutes.foodsRecent
          : apiRoutes.foodsFavorites,
      );
      setResults(
        saved.map((x) => ({
          externalId: x.externalId ?? x.foodExternalId,
          name: x.name ?? x.foodName,
          brand: x.brand,
          barcode: x.barcode,
          caloriesPer100Grams: x.caloriesPer100Grams,
          proteinPer100Grams: x.proteinPer100Grams,
          carbohydratesPer100Grams: x.carbohydratesPer100Grams,
          fatPer100Grams: x.fatPer100Grams,
          imageUrl: x.imageUrl,
        })),
      );
    } catch {
      setResults([]);
      setError("Kayıtlı besinler backend’den alınamadı.");
    } finally {
      setLoading(false);
    }
  };
  const selectFilter = (nextFilter: "all" | "recent" | "favorites") => {
    if (nextFilter === "all") {
      setFilter("all");
      setResults([]);
      setQuery("");
      setError("");
    } else void loadSaved(nextFilter);
  };
  const search = async (value: string) => {
    setQuery(value);
    setError("");
    if (!value.trim()) {
      setResults([]);
      return;
    }
    if (!apiConfigured()) {
      setError("Backend bağlantısı yapılandırılmamış.");
      return;
    }
    setLoading(true);
    try {
      setResults(
        await apiFetch<SearchFood[]>(
          `/api/foods/search?query=${encodeURIComponent(value)}`,
        ),
      );
    } catch {
      setResults([]);
      setError(
        "Besinler backend’den alınamadı. Backend bağlantısını kontrol et.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      visible={Boolean(meal)}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={fs.screen} edges={["top", "bottom"]}>
        <View style={fs.header}>
          <Pressable
            style={fs.closeButton}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Besin aramayı kapat"
            onPress={onClose}
          >
            <Text style={fs.closeIcon}>×</Text>
          </Pressable>
          <Text style={fs.headerTitle}>Besin Ara</Text>
          <View style={fs.headerBadge}>
            <Text style={fs.headerBadgeIcon}>⌕</Text>
          </View>
        </View>
        <View style={fs.chips}>
          {["🍳 Kahvaltı", "☼ Öğle", "☾ Akşam", "⌁ Ara Öğün"].map((x, i) => (
            <Text key={x} style={[fs.chip, i === 0 && fs.chipActive]}>
              {x}
            </Text>
          ))}
        </View>
        <View style={fs.searchBox}>
          <Text style={fs.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={search}
            placeholder="Yulaf"
            placeholderTextColor="#9f958d"
            style={fs.input}
          />
          <Text style={fs.clear}>⊗</Text>
        </View>
        <View style={fs.filters}>
          {[
            ["Tümü", "all"],
            ["Son Eklenenler", "recent"],
            ["Favorilerim ♡", "favorites"],
          ].map(([label, key]) => (
            <Pressable
              key={key}
              onPress={() =>
                selectFilter(key as "all" | "recent" | "favorites")
              }
              style={[fs.filter, filter === key && fs.filterActive]}
            >
              <Text
                style={filter === key ? fs.filterActiveText : fs.filterText}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={fs.resultHead}>
          <Text style={fs.resultsTitle}>Arama Sonuçları</Text>
          <Text style={fs.count}>{results.length} sonuç bulundu</Text>
        </View>
        {loading && (
          <View style={fs.emptyCard}>
            <View style={fs.emptyIconCircle}>
              <Text style={fs.emptyIcon}>…</Text>
            </View>
            <Text style={fs.emptyTitle}>Besinler aranıyor</Text>
            <Text style={fs.emptyText}>
              Backend’den güncel sonuçlar getiriliyor.
            </Text>
          </View>
        )}
        {!loading && !results.length && (
          <View style={fs.emptyCard}>
            <View style={fs.emptyIconCircle}>
              <Text style={fs.emptyIcon}>
                {error ? "!" : query ? "⌕" : "＋"}
              </Text>
            </View>
            <Text style={fs.emptyTitle}>
              {error
                ? "Besinlere ulaşılamadı"
                : query
                  ? "Sonuç bulunamadı"
                  : "Aramaya hazırız"}
            </Text>
            <Text style={fs.emptyText}>
              {error ||
                (query
                  ? "Farklı bir besin adı veya marka deneyebilirsin."
                  : "Besin adı yazarak ara ya da kayıtlı besinlerinden birini seç.")}
            </Text>
            {!error && !query && (
              <View style={fs.emptyHints}>
                <View style={fs.emptyHint}>
                  <Text style={fs.hintIcon}>⌕</Text>
                  <Text style={fs.hintText}>Besin ara</Text>
                </View>
                <View style={fs.emptyHint}>
                  <Text style={fs.hintIcon}>◷</Text>
                  <Text style={fs.hintText}>Son eklenenler</Text>
                </View>
                <View style={fs.emptyHint}>
                  <Text style={fs.hintIcon}>♡</Text>
                  <Text style={fs.hintText}>Favoriler</Text>
                </View>
              </View>
            )}
          </View>
        )}
        {results.map((food) => (
          <View style={fs.card} key={food.externalId}>
            <View style={fs.foodImage}>
              <Text style={fs.foodEmoji}>🍽️</Text>
            </View>
            <View style={fs.cardBody}>
              <Text style={fs.foodName}>{food.name} ⊙</Text>
              <Text style={fs.brand}>{food.brand ?? "Besin"}</Text>
              <View style={fs.nutrients}>
                <Text style={fs.nutrient}>
                  {Math.round(food.caloriesPer100Grams ?? 0)} kcal
                </Text>
                <Text style={fs.nutrient}>
                  P: {food.proteinPer100Grams ?? 0}g
                </Text>
                <Text style={fs.nutrient}>
                  K: {food.carbohydratesPer100Grams ?? 0}g
                </Text>
                <Text style={fs.nutrient}>Y: {food.fatPer100Grams ?? 0}g</Text>
              </View>
            </View>
            <Pressable style={fs.addButton} onPress={() => onAdd(food)}>
              <Text style={fs.addButtonText}>+</Text>
            </Pressable>
          </View>
        ))}
      </SafeAreaView>
    </Modal>
  );
}

const d = StyleSheet.create({
  content: { paddingBottom: 28 },
  eyebrow: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.orange,
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontFamily: type.display, fontSize: 22, color: colors.espresso },
  calendar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    textAlign: "center",
    paddingTop: 5,
    color: colors.plum,
  },
  dateNav: {
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 20,
    backgroundColor: colors.paper,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  arrow: { fontSize: 22, color: "rgba(43,33,28,.5)" },
  date: { fontSize: 10, fontWeight: "800", color: colors.plum },
  today: {
    fontSize: 8,
    fontWeight: "900",
    color: colors.orange,
    backgroundColor: "#f6dfd3",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  hero: {
    backgroundColor: colors.orange,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  ring: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    borderColor: "rgba(246,235,216,.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: { alignItems: "center" },
  ringNumber: { fontSize: 18, fontWeight: "900", color: colors.cream },
  ringUnit: { fontSize: 9, fontWeight: "800", color: colors.cream },
  kcal: { fontSize: 7, color: colors.cream },
  heroCopy: { flex: 1 },
  badge: {
    alignSelf: "flex-start",
    fontSize: 9,
    fontWeight: "900",
    color: colors.espresso,
    backgroundColor: colors.mustard,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  heroTitle: {
    fontFamily: type.display,
    fontSize: 16,
    color: colors.cream,
    marginTop: 5,
  },
  heroText: { fontSize: 9, lineHeight: 12, color: colors.cream, marginTop: 3 },
  heroStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(246,235,216,.28)",
    marginTop: 12,
    paddingTop: 9,
  },
  statLabel: { fontSize: 8, color: colors.cream, opacity: 0.8 },
  statValue: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.cream,
    marginTop: 2,
  },
  statUnit: { fontSize: 8, fontWeight: "500" },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: type.display,
    fontSize: 17,
    color: colors.espresso,
  },
  detail: { fontSize: 9, color: colors.orange, fontWeight: "800" },
  macroRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  macro: {
    flex: 1,
    backgroundColor: colors.paper,
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: colors.line,
  },
  macroName: { fontSize: 8, color: "rgba(43,33,28,.55)" },
  macroValue: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.espresso,
    marginTop: 5,
  },
  macroTarget: { fontSize: 8, fontWeight: "500" },
  track: {
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(43,33,28,.1)",
    marginTop: 7,
  },
  fill: { height: 4, borderRadius: 3 },
  water: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#e9f5f5",
    borderWidth: 1,
    borderColor: "#cde8e7",
    marginBottom: 14,
  },
  waterIcon: { fontSize: 22, marginRight: 8 },
  waterTitle: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.teal,
    marginBottom: 2,
  },
  waterValue: { fontSize: 13, fontWeight: "900", color: colors.espresso },
  waterTarget: { fontSize: 9, fontWeight: "500" },
  waterCaption: { fontSize: 8, color: "rgba(43,33,28,.55)", marginTop: 2 },
  waterAction: {
    backgroundColor: colors.teal,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    marginLeft: 8,
  },
  waterActionText: { fontSize: 9, fontWeight: "900", color: colors.cream },
  waterOverlay: {
    flex: 1,
    backgroundColor: "rgba(43,33,28,.45)",
    justifyContent: "center",
    padding: 20,
  },
  waterModal: {
    backgroundColor: colors.cream,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.espresso,
    padding: 18,
  },
  waterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  waterModalTitle: {
    fontFamily: type.display,
    fontSize: 23,
    color: colors.plum,
  },
  waterClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  waterCloseText: { fontSize: 26, lineHeight: 28, color: colors.espresso },
  waterModalHint: { fontSize: 12, color: "rgba(43,33,28,.65)", marginTop: 8 },
  waterInput: {
    height: 52,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 12,
    backgroundColor: colors.paper,
    paddingHorizontal: 14,
    marginTop: 14,
    color: colors.espresso,
    fontSize: 18,
    fontWeight: "800",
  },
  waterModalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 18,
    marginTop: 16,
  },
  waterCancel: { color: colors.plum, fontWeight: "800", paddingVertical: 10 },
  waterSave: {
    minWidth: 105,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  waterSaveText: { color: colors.cream, fontWeight: "900" },
  meal: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.line,
  },
  mealHead: {
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  mealTitle: { fontSize: 10, fontWeight: "900", color: colors.plum },
  mealMeta: { fontSize: 8, color: colors.orange, marginTop: 3 },
  mealPlus: {
    width: 18,
    height: 18,
    borderRadius: 5,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
  mealPlusText: { fontSize: 16, lineHeight: 18, color: colors.cream },
  food: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  foodEmoji: {
    width: 27,
    height: 27,
    textAlign: "center",
    paddingTop: 4,
    backgroundColor: "#fff3d8",
    borderRadius: 7,
    fontSize: 14,
    marginRight: 7,
  },
  foodName: { fontSize: 9, fontWeight: "800", color: colors.espresso },
  foodMeta: { fontSize: 8, color: "rgba(43,33,28,.6)", marginTop: 2 },
  remove: { fontSize: 16, color: "rgba(43,33,28,.45)" },
  editOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(43,33,28,.45)",
  },
  editModal: {
    backgroundColor: colors.cream,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.espresso,
    padding: 18,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editTitle: { fontFamily: type.display, fontSize: 23, color: colors.plum },
  editClose: { fontSize: 28, color: colors.espresso, padding: 4 },
  editFoodName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.espresso,
    marginTop: 12,
  },
  editLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.orange,
    marginTop: 18,
    marginBottom: 6,
  },
  editInput: {
    height: 50,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 11,
    backgroundColor: colors.paper,
    paddingHorizontal: 12,
    color: colors.espresso,
    fontSize: 18,
    fontWeight: "800",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },
  deleteButton: { paddingHorizontal: 16, paddingVertical: 12 },
  deleteButtonText: { color: "#a83c35", fontWeight: "900" },
  editSave: {
    minWidth: 105,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  editSaveText: { color: colors.cream, fontWeight: "900" },
});

const fs = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    paddingTop: 18,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
  },
  closeIcon: { fontSize: 26, lineHeight: 28, color: colors.espresso },
  headerTitle: { fontFamily: type.display, fontSize: 16, color: colors.plum },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mustard,
    borderWidth: 1,
    borderColor: colors.espresso,
  },
  headerBadgeIcon: { fontSize: 21, color: colors.espresso },
  chips: {
    height: 30,
    gap: 8,
    paddingBottom: 5,
    alignItems: "flex-start",
    flexDirection: "row",
  },
  chip: {
    height: 24,
    fontSize: 9,
    color: colors.plum,
    backgroundColor: colors.paper,
    borderRadius: 9,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  chipActive: { backgroundColor: colors.plum, color: colors.cream },
  searchBox: {
    height: 40,
    backgroundColor: colors.paper,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  searchIcon: { fontSize: 20, color: "#8f837b" },
  input: {
    flex: 1,
    fontSize: 12,
    color: colors.espresso,
    paddingHorizontal: 7,
  },
  clear: { fontSize: 15, color: "#8f837b" },
  tools: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  tool: {
    fontSize: 9,
    color: colors.plum,
    backgroundColor: "#f7f1ea",
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  filters: { flexDirection: "row", gap: 7, marginBottom: 12 },
  filter: {
    fontSize: 8,
    color: colors.espresso,
    backgroundColor: colors.paper,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  filterActive: { backgroundColor: colors.plum },
  filterText: { fontSize: 8, color: colors.espresso },
  filterActiveText: { fontSize: 8, color: colors.cream },
  resultHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultsTitle: {
    fontFamily: type.display,
    fontSize: 14,
    color: colors.espresso,
  },
  count: { fontSize: 9, color: "#8f837b" },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 9,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(43,33,28,.06)",
  },
  foodImage: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#ece8db",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  foodEmoji: { fontSize: 20 },
  cardBody: { flex: 1 },
  foodName: { fontFamily: type.display, fontSize: 14, color: colors.plum },
  brand: { fontSize: 9, color: "#81766f", marginTop: 2 },
  nutrients: { flexDirection: "row", gap: 5, marginTop: 5, flexWrap: "wrap" },
  nutrient: {
    fontSize: 8,
    color: colors.orange,
    backgroundColor: "#f9eee6",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  addButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.plum,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { fontSize: 21, lineHeight: 23, color: colors.cream },
  bottomSummary: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  bottomLabel: { fontSize: 8, fontWeight: "900", color: colors.orange },
  bottomName: {
    fontFamily: type.display,
    fontSize: 15,
    color: colors.plum,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  amount: { fontSize: 14, fontWeight: "900", color: colors.espresso },
  total: { fontSize: 13, fontWeight: "900", color: colors.plum },
  confirm: {
    backgroundColor: "#c83f16",
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: "center",
    marginTop: 9,
  },
  confirmText: { fontSize: 11, fontWeight: "900", color: colors.cream },
  emptyCard: {
    marginTop: 18,
    padding: 20,
    borderRadius: 18,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d9f5ee",
    borderWidth: 2,
    borderColor: colors.teal,
  },
  emptyIcon: { fontSize: 27, fontWeight: "900", color: colors.teal },
  emptyTitle: {
    marginTop: 12,
    fontFamily: type.display,
    fontSize: 19,
    color: colors.plum,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: "#8f837b",
    textAlign: "center",
  },
  emptyHints: {
    width: "100%",
    flexDirection: "row",
    gap: 7,
    marginTop: 17,
  },
  emptyHint: {
    flex: 1,
    minHeight: 58,
    borderRadius: 12,
    backgroundColor: colors.cream,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.line,
  },
  hintIcon: { fontSize: 18, color: colors.orange },
  hintText: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: "800",
    color: colors.espresso,
  },
});
