import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { apiConfigured, apiFetch, apiRoutes } from "../../api/client";
import { colors, type } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Analysis = {
  productName: string;
  analysis: string;
  healthAdvice: string[];
  estimatedPortionGrams?: number | null;
  caloriesPer100Grams?: number | null;
  proteinPer100Grams?: number | null;
  carbohydratesPer100Grams?: number | null;
  fatPer100Grams?: number | null;
  sugarsPer100Grams?: number | null;
  saturatedFatPer100Grams?: number | null;
  saltPer100Grams?: number | null;
  detectedComponents: string[];
  allergens: string[];
};
const meals = [
  ["Kahvaltı", "breakfast"],
  ["Öğle", "lunch"],
  ["Akşam", "dinner"],
  ["Ara Öğün", "snack"],
] as const;
const val = (n?: number | null) =>
  n == null ? "—" : String(Math.round(n * 10) / 10);
const allergenNames: Record<string, string> = {
  milk: "Süt",
  nuts: "Kuruyemiş",
  peanuts: "Yer fıstığı",
  soybeans: "Soya",
  gluten: "Gluten",
  eggs: "Yumurta",
  fish: "Balık",
  shellfish: "Kabuklu deniz ürünleri",
  sesame: "Susam",
};
const localizeAllergen = (value: string) =>
  allergenNames[value.trim().toLowerCase()] ?? value;

export function FoodAnalysisModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [meal, setMeal] = useState("dinner");
  const [quantity, setQuantity] = useState("");
  const reset = () => {
    setPhoto(null);
    setResult(null);
    setBusy(false);
    setError("");
    setQuantity("");
  };
  const close = () => {
    reset();
    onClose();
  };
  const capture = async () => {
    if (!cameraRef.current || !apiConfigured()) {
      setError("Backend bağlantısı yapılandırılmamış.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const captured = await cameraRef.current.takePictureAsync({
        quality: 0.45,
      });
      const optimized = await ImageManipulator.manipulateAsync(
        captured.uri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.45,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );
      if (!optimized.base64) throw new Error("IMAGE_BASE64_MISSING");
      const imageBase64 = optimized.base64.replace(
        /^data:image\/[^;]+;base64,/i,
        "",
      );
      setPhoto(captured.uri);
      const analysis = await apiFetch<Analysis>(
        apiRoutes.analyzeFoodImage,
        {
          method: "POST",
          body: JSON.stringify({
            imageBase64,
            mimeType: "image/jpeg",
          }),
        },
        180_000,
      );
      setResult(analysis);
      setQuantity(String(Math.round(analysis.estimatedPortionGrams ?? 100)));
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Fotoğraf backend AI analizine gönderilemedi.",
      );
    } finally {
      setBusy(false);
    }
  };
  const save = async () => {
    if (!result) return;
    const grams = Number(quantity);
    if (!grams || grams <= 0) {
      setError("Porsiyon miktarı 0’dan büyük olmalı.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(apiRoutes.items, {
        method: "POST",
        body: JSON.stringify({
          foodExternalId: "ai-image-" + Date.now(),
          foodName: result.productName,
          quantityGrams: grams,
          mealType: meal,
          logDate: new Date().toISOString().slice(0, 10),
          caloriesPer100Grams: result.caloriesPer100Grams,
          proteinPer100Grams: result.proteinPer100Grams,
          carbohydratesPer100Grams: result.carbohydratesPer100Grams,
          fatPer100Grams: result.fatPer100Grams,
          brand: null,
          barcode: null,
        }),
      });
      close();
    } catch {
      setError("AI analiz sonucu günlük kaydına eklenemedi.");
      setBusy(false);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        {!result ? (
          <View style={s.captureScreen}>
            <View style={s.top}>
              <Pressable
                onPress={close}
                hitSlop={12}
                accessibilityLabel="Fotoğraf analizini kapat"
              >
                <Text style={s.back}>×</Text>
              </Pressable>
              <Text style={s.title}>AI ile Yemek Analizi</Text>
              <Text style={s.topIcon}>◎</Text>
            </View>
            {photo ? (
              <Image source={{ uri: photo }} style={s.preview} />
            ) : !permission?.granted ? (
              <View style={s.permission}>
                <Text style={s.permissionTitle}>Kamera izni gerekli</Text>
                <Text style={s.muted}>
                  Tabağının fotoğrafını çekebilmek için kameraya izin ver.
                </Text>
                <Pressable style={s.primary} onPress={requestPermission}>
                  <Text style={s.primaryText}>Kamera izni ver</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={s.cameraWrap}>
                  <CameraView ref={cameraRef} style={s.camera} facing="back" />
                  <View style={s.frame} pointerEvents="none" />
                </View>
                <Text style={s.instruction}>Tabağını çerçeveye al.</Text>
              </>
            )}
            {!photo && permission?.granted && (
              <Pressable style={s.capture} onPress={capture} disabled={busy}>
                <Text style={s.captureText}>
                  {busy ? "Analiz ediliyor..." : "Fotoğraf çek ve analiz et"}
                </Text>
              </Pressable>
            )}
            {busy && (
              <ActivityIndicator color={colors.orange} style={s.loader} />
            )}
            {error && <Text style={s.error}>{error}</Text>}
          </View>
        ) : (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
          >
            <ScrollView
              contentContainerStyle={s.resultScreen}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View style={s.top}>
                <Pressable
                  onPress={close}
                  hitSlop={12}
                  accessibilityLabel="Analiz sonucunu kapat"
                >
                  <Text style={s.back}>×</Text>
                </Pressable>
                <Text style={s.title}>AI Analiz Sonucu</Text>
                <Text style={s.topIcon}>●</Text>
              </View>
              {photo && <Image source={{ uri: photo }} style={s.preview} />}
              <Text style={s.productName}>{result.productName}</Text>
              <Text style={s.analysis}>{result.analysis}</Text>
              {result.allergens.length > 0 && (
                <View style={s.warning}>
                  <Text style={s.warningTitle}>⚠ Tespit Edilen Alerjenler</Text>
                  <Text style={s.warningText}>
                    {result.allergens.map(localizeAllergen).join(", ")}
                  </Text>
                </View>
              )}
              <View style={s.panel}>
                <Text style={s.panelTitle}>Kalori ve Makrolar</Text>
                <Text style={s.calories}>
                  {val(result.caloriesPer100Grams)}{" "}
                  <Text style={s.kcal}>kcal / 100 g</Text>
                </Text>
                <View style={s.grid}>
                  {[
                    ["Protein", result.proteinPer100Grams],
                    ["Karb", result.carbohydratesPer100Grams],
                    ["Yağ", result.fatPer100Grams],
                    ["Şeker", result.sugarsPer100Grams],
                    ["Doymuş yağ", result.saturatedFatPer100Grams],
                    ["Tuz", result.saltPer100Grams],
                  ].map(([label, n]) => (
                    <View style={s.nutrient} key={String(label)}>
                      <Text style={s.nutrientLabel}>{label}</Text>
                      <Text style={s.nutrientValue}>{val(n as number)} g</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={s.panel}>
                <Text style={s.panelTitle}>Porsiyon Miktarı</Text>
                <View style={s.quantity}>
                  <TextInput
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    style={s.quantityInput}
                  />
                  <Text style={s.gram}>gram</Text>
                </View>
              </View>
              <View style={s.panel}>
                <Text style={s.panelTitle}>Öğün Seçimi</Text>
                <View style={s.meals}>
                  {meals.map(([label, key]) => (
                    <Pressable
                      key={key}
                      onPress={() => setMeal(key)}
                      style={[s.meal, meal === key && s.mealActive]}
                    >
                      <Text
                        style={[s.mealText, meal === key && s.mealTextActive]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              {result.detectedComponents.length > 0 && (
                <View style={s.panel}>
                  <Text style={s.panelTitle}>Tespit Edilen İçerikler</Text>
                  <Text style={s.analysis}>
                    {result.detectedComponents.join(", ")}
                  </Text>
                </View>
              )}
              <View style={s.panel}>
                <Text style={s.panelTitle}>AI Diyetisyen Tavsiyeleri</Text>
                {result.healthAdvice.map((advice, i) => (
                  <Text style={s.advice} key={i}>
                    • {advice}
                  </Text>
                ))}
              </View>
              {error && <Text style={s.error}>{error}</Text>}
              <Pressable style={s.primary} onPress={save} disabled={busy}>
                <Text style={s.primaryText}>
                  {busy
                    ? "Kaydediliyor..."
                    : "✦ " +
                      meals.find((x) => x[1] === meal)?.[0] +
                      " öğününe ekle"}
                </Text>
              </Pressable>
              <Pressable onPress={close}>
                <Text style={s.cancel}>Vazgeç</Text>
              </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  captureScreen: { flex: 1, padding: 18 },
  resultScreen: { padding: 14, paddingBottom: 30 },
  top: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { fontSize: 26, color: colors.espresso },
  title: { fontFamily: type.display, fontSize: 15, color: colors.plum },
  topIcon: { fontSize: 16, color: colors.plum },
  cameraWrap: {
    flex: 1,
    minHeight: 280,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 18,
    position: "relative",
  },
  camera: { flex: 1 },
  frame: {
    ...StyleSheet.absoluteFill,
    margin: 24,
    borderWidth: 2,
    borderColor: colors.mustard,
    borderRadius: 18,
  },
  instruction: {
    fontSize: 12,
    textAlign: "center",
    color: colors.espresso,
    marginTop: 14,
  },
  preview: {
    height: 190,
    borderRadius: 12,
    backgroundColor: "#e6dfd3",
    marginVertical: 10,
  },
  capture: {
    backgroundColor: colors.orange,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 14,
  },
  captureText: { fontSize: 13, fontWeight: "900", color: colors.cream },
  permission: { flex: 1, alignItems: "center", justifyContent: "center" },
  permissionTitle: {
    fontFamily: type.display,
    fontSize: 22,
    color: colors.plum,
  },
  muted: {
    fontSize: 12,
    color: "rgba(43,33,28,.6)",
    textAlign: "center",
    marginTop: 8,
  },
  primary: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 14,
  },
  primaryText: { fontSize: 12, fontWeight: "900", color: colors.cream },
  loader: { marginTop: 14 },
  error: {
    fontSize: 11,
    color: "#b52324",
    textAlign: "center",
    marginVertical: 10,
  },
  productName: {
    fontFamily: type.display,
    fontSize: 24,
    color: colors.plum,
    marginTop: 5,
  },
  analysis: { fontSize: 11, lineHeight: 16, color: "#5e554f", marginTop: 7 },
  warning: {
    backgroundColor: "#ffd9d2",
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  warningTitle: { fontSize: 12, fontWeight: "900", color: "#b52324" },
  warningText: { fontSize: 11, color: "#8b2525", marginTop: 4 },
  panel: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  panelTitle: { fontSize: 10, fontWeight: "900", color: colors.plum },
  calories: {
    fontFamily: type.display,
    fontSize: 23,
    color: colors.plum,
    marginTop: 6,
  },
  kcal: { fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 9 },
  nutrient: {
    width: "30%",
    backgroundColor: "#f8f2e9",
    borderRadius: 7,
    padding: 7,
  },
  nutrientLabel: { fontSize: 8, color: "#81766f" },
  nutrientValue: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.espresso,
    marginTop: 4,
  },
  quantity: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  quantityInput: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.plum,
    textAlign: "center",
    width: 90,
  },
  gram: { fontSize: 11, color: "#81766f" },
  meals: { flexDirection: "row", gap: 6, marginTop: 9 },
  meal: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: "#f8f2e9",
  },
  mealActive: { backgroundColor: colors.plum },
  mealText: { fontSize: 9, color: colors.espresso },
  mealTextActive: { color: colors.cream, fontWeight: "900" },
  advice: { fontSize: 10, lineHeight: 16, color: "#5e554f", marginTop: 7 },
  cancel: {
    fontSize: 11,
    color: colors.plum,
    textAlign: "center",
    marginTop: 12,
  },
});
