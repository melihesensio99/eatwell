import React, { useState } from "react";
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
import { apiConfigured, apiFetch, apiRoutes } from "../../api/client";
import { colors, type } from "../../theme";
import { SafeAreaView } from "react-native-safe-area-context";

type Product = {
  externalId: string;
  name: string;
  brand?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  nutriScore?: string | null;
  novaGroup?: number | null;
  ingredientsText?: string | null;
  allergensTags: string[];
  matchedUserAllergens: string[];
  hasAllergenWarning: boolean;
  caloriesPer100Grams?: number | null;
  proteinPer100Grams?: number | null;
  carbohydratesPer100Grams?: number | null;
  fatPer100Grams?: number | null;
  sugarsPer100Grams?: number | null;
  saturatedFatPer100Grams?: number | null;
  saltPer100Grams?: number | null;
};
const meals = [
  ["Kahvaltı", "breakfast"],
  ["Öğle", "lunch"],
  ["Akşam", "dinner"],
  ["Ara", "snack"],
] as const;
const value = (n?: number | null) =>
  n == null ? "—" : String(Math.round(n * 10) / 10);

export function BarcodeScannerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState<Product | null>(null);
  const [scanned, setScanned] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [meal, setMeal] = useState("dinner");
  const [quantity, setQuantity] = useState("100");
  const [manualBarcode, setManualBarcode] = useState("");
  const reset = () => {
    setProduct(null);
    setScanned(false);
    setBusy(false);
    setError("");
    setQuantity("100");
    setManualBarcode("");
  };
  const close = () => {
    reset();
    onClose();
  };
  const lookupBarcode = async (rawBarcode: string) => {
    const data = rawBarcode.trim();
    if (scanned || !data) {
      if (!data) setError("Barkod numarası girin.");
      return;
    }
    if (!apiConfigured()) {
      setError("Backend bağlantısı yapılandırılmamış.");
      return;
    }
    setScanned(true);
    setBusy(true);
    setError("");
    try {
      setProduct(await apiFetch<Product>(apiRoutes.foodByBarcode(data)));
    } catch {
      setError("Bu barkoda ait ürün backend’de bulunamadı.");
      setScanned(false);
    } finally {
      setBusy(false);
    }
  };
  const onBarcodeScanned = ({ data }: { data: string }) => {
    void lookupBarcode(data);
  };
  const addToDailyLog = async () => {
    if (!product) return;
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
          foodExternalId: product.externalId,
          foodName: product.name,
          quantityGrams: grams,
          mealType: meal,
          logDate: new Date().toISOString().slice(0, 10),
          caloriesPer100Grams: product.caloriesPer100Grams,
          proteinPer100Grams: product.proteinPer100Grams,
          carbohydratesPer100Grams: product.carbohydratesPer100Grams,
          fatPer100Grams: product.fatPer100Grams,
          brand: product.brand,
          barcode: product.barcode,
        }),
      });
      close();
    } catch {
      setError("Besin günlük kaydına eklenemedi.");
      setBusy(false);
    }
  };
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={close}>
      <SafeAreaView style={s.screen} edges={["top", "bottom"]}>
        {!product ? (
          <View style={s.scannerWrap}>
            <View style={s.top}>
              <Pressable
                onPress={close}
                hitSlop={12}
                accessibilityLabel="Barkod ekranını kapat"
              >
                <Text style={s.back}>×</Text>
              </Pressable>
              <Text style={s.title}>Barkod Tara</Text>
              <Text style={s.topIcon}>⌁</Text>
            </View>
            {!permission?.granted ? (
              <View style={s.permission}>
                <Text style={s.permissionTitle}>Kamera izni gerekli</Text>
                <Text style={s.muted}>
                  Ürün barkodunu okuyabilmek için kameraya izin ver.
                </Text>
                <Pressable style={s.primary} onPress={requestPermission}>
                  <Text style={s.primaryText}>Kamera izni ver</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <View style={s.cameraWrap}>
                  <CameraView
                    style={s.camera}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: [
                        "ean13",
                        "ean8",
                        "upc_a",
                        "upc_e",
                        "code128",
                        "qr",
                      ],
                    }}
                    onBarcodeScanned={onBarcodeScanned}
                  />
                  <View style={s.scanFrame} pointerEvents="none">
                    <View style={s.corner} />
                  </View>
                </View>
                <Text style={s.instruction}>
                  Barkodu çerçevenin içine hizala.
                </Text>
              </>
            )}
            <View style={s.manualRow}>
              <TextInput
                value={manualBarcode}
                onChangeText={setManualBarcode}
                keyboardType="number-pad"
                placeholder="Barkod numarasını gir"
                placeholderTextColor="#8f837b"
                style={s.manualInput}
              />
              <Pressable
                style={s.manualButton}
                onPress={() => void lookupBarcode(manualBarcode)}
                disabled={busy}
              >
                <Text style={s.manualButtonText}>Ürünü bul</Text>
              </Pressable>
            </View>
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
              contentContainerStyle={s.result}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              <View style={s.top}>
                <Pressable
                  onPress={close}
                  hitSlop={12}
                  accessibilityLabel="Barkod sonucunu kapat"
                >
                  <Text style={s.back}>×</Text>
                </Pressable>
                <Text style={s.title}>Barkod Sonucu</Text>
                <Text style={s.topIcon}>●</Text>
              </View>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={s.image} />
              ) : (
                <View style={s.noImage}>
                  <Text style={s.noImageText}>Ürün görseli yok</Text>
                </View>
              )}
              <Text style={s.brand}>
                {product.brand ?? "Marka bilgisi yok"}
              </Text>
              <Text style={s.productName}>{product.name}</Text>
              <Text style={s.barcode}>Barkod: {product.barcode ?? "—"}</Text>
              <View style={s.badges}>
                <View style={s.nutriBadge}>
                  <Text style={s.badgeLabel}>NUTRI-SCORE</Text>
                  <Text style={s.badgeValue}>{product.nutriScore ?? "—"}</Text>
                </View>
                <View style={s.novaBadge}>
                  <Text style={s.badgeLabel}>NOVA</Text>
                  <Text style={s.badgeValue}>{product.novaGroup ?? "—"}</Text>
                </View>
              </View>
              {product.hasAllergenWarning && (
                <View style={s.warning}>
                  <Text style={s.warningTitle}>⚠ Alerjen Uyarısı</Text>
                  <Text style={s.warningText}>
                    {product.matchedUserAllergens.join(", ")}
                  </Text>
                  <Text style={s.warningSmall}>
                    Profilindeki alerjenlerle eşleşen içerik bulundu.
                  </Text>
                </View>
              )}
              <View style={s.panel}>
                <Text style={s.panelTitle}>
                  Enerji Değeri <Text style={s.per100}>100 gram için</Text>
                </Text>
                <Text style={s.calories}>
                  {value(product.caloriesPer100Grams)}{" "}
                  <Text style={s.kcal}>kcal</Text>
                </Text>
                <View style={s.nutrientGraph}>
                  {[
                    ["Protein", product.proteinPer100Grams, "#4e9b91", 50],
                    ["Karb", product.carbohydratesPer100Grams, "#d9aa20", 100],
                    ["Yağ", product.fatPer100Grams, "#d97967", 100],
                    ["Şeker", product.sugarsPer100Grams, "#c85a32", 100],
                    [
                      "Doymuş yağ",
                      product.saturatedFatPer100Grams,
                      "#9a6b7a",
                      50,
                    ],
                    ["Tuz", product.saltPer100Grams, "#6c8db3", 10],
                  ].map(([label, n, color, max]) => (
                    <View style={s.nutrientRow} key={String(label)}>
                      <View style={s.nutrientHead}>
                        <Text style={s.nutrientLabel}>{label}</Text>
                        <Text style={s.nutrientValue}>
                          {value(n as number)} g
                        </Text>
                      </View>
                      <View style={s.nutrientTrack}>
                        <View
                          style={[
                            s.nutrientFill,
                            {
                              width: `${Math.min(100, Math.max(0, (((n as number | null | undefined) ?? 0) / (max as number)) * 100))}%`,
                              backgroundColor: color as string,
                            },
                          ]}
                        />
                      </View>
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
                    keyboardType="number-pad"
                    placeholder="Gram miktarı"
                    placeholderTextColor="#81766f"
                    style={s.quantityInput}
                    returnKeyType="done"
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
              {product.ingredientsText && (
                <View style={s.panel}>
                  <Text style={s.panelTitle}>İçindekiler</Text>
                  <Text style={s.ingredients}>{product.ingredientsText}</Text>
                </View>
              )}
              {product.allergensTags?.length > 0 && (
                <View style={s.panel}>
                  <Text style={s.panelTitle}>Alerjenler</Text>
                  <Text style={s.ingredients}>
                    {product.allergensTags.join(", ")}
                  </Text>
                </View>
              )}
              {error && <Text style={s.error}>{error}</Text>}
              <Pressable
                style={s.primary}
                onPress={addToDailyLog}
                disabled={busy}
              >
                <Text style={s.primaryText}>
                  {busy
                    ? "Kaydediliyor..."
                    : "✦ " +
                      meals.find((x) => x[1] === meal)?.[0] +
                      " öğününe ekle"}
                </Text>
              </Pressable>
              <Pressable
                onPress={close}
                hitSlop={12}
                accessibilityLabel="Barkod ekranını kapat"
              >
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
  scannerWrap: { flex: 1, padding: 18 },
  result: { padding: 14, paddingBottom: 28 },
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
    height: 430,
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 18,
    position: "relative",
  },
  camera: { flex: 1 },
  scanFrame: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    width: 250,
    height: 130,
    borderWidth: 3,
    borderColor: colors.mustard,
    borderRadius: 12,
  },
  instruction: {
    fontSize: 12,
    textAlign: "center",
    color: colors.espresso,
    marginTop: 14,
  },
  manualRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
  },
  manualInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: colors.paper,
    paddingHorizontal: 10,
    color: colors.espresso,
    fontSize: 12,
  },
  manualButton: {
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.plum,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  manualButtonText: { color: colors.cream, fontSize: 11, fontWeight: "900" },
  permission: { alignItems: "center", justifyContent: "center", flex: 1 },
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
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 14,
  },
  primaryText: { fontSize: 12, fontWeight: "900", color: colors.cream },
  loader: { marginTop: 18 },
  error: {
    color: "#b52324",
    fontSize: 11,
    textAlign: "center",
    marginVertical: 10,
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.paper,
    marginBottom: 8,
    resizeMode: "contain",
  },
  noImage: {
    height: 100,
    borderRadius: 12,
    backgroundColor: "#e6dfd3",
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: { fontSize: 11, color: "#81766f" },
  brand: {
    fontSize: 10,
    color: colors.orange,
    fontWeight: "900",
    marginTop: 5,
    textAlign: "center",
  },
  productName: {
    fontFamily: type.display,
    fontSize: 28,
    color: colors.plum,
    marginTop: 2,
    textAlign: "center",
  },
  barcode: {
    fontSize: 9,
    color: "#81766f",
    marginTop: 4,
    textAlign: "center",
  },
  badges: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 12,
  },
  nutriBadge: {
    minWidth: 112,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#d9f5e5",
    alignItems: "center",
  },
  novaBadge: {
    minWidth: 92,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#e2f1e9",
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: 8,
    fontWeight: "900",
    color: "#175c40",
    letterSpacing: 0.6,
  },
  badgeValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#175c40",
    marginTop: 2,
  },
  warning: {
    backgroundColor: "#ffd9d2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  warningTitle: { fontSize: 12, fontWeight: "900", color: "#b52324" },
  warningText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#8b2525",
    marginTop: 5,
  },
  warningSmall: { fontSize: 9, color: "#8b2525", marginTop: 4 },
  panel: {
    backgroundColor: colors.paper,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  panelTitle: { fontSize: 10, fontWeight: "900", color: colors.plum },
  per100: { fontSize: 8, fontWeight: "500", color: "#81766f" },
  calories: {
    fontFamily: type.display,
    fontSize: 22,
    color: colors.plum,
    marginTop: 5,
  },
  kcal: { fontSize: 10 },
  nutrientGraph: {
    marginTop: 8,
  },
  nutrientRow: {
    marginTop: 8,
  },
  nutrientHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nutrientLabel: { fontSize: 9, color: "#81766f" },
  nutrientValue: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.espresso,
  },
  nutrientTrack: {
    height: 7,
    borderRadius: 5,
    backgroundColor: "#eee4d8",
    overflow: "hidden",
    marginTop: 4,
  },
  nutrientFill: {
    height: "100%",
    borderRadius: 5,
  },
  quantity: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  quantityInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    backgroundColor: "#f8f2e9",
    paddingHorizontal: 12,
    fontSize: 18,
    fontWeight: "900",
    color: colors.plum,
    textAlign: "left",
  },
  gram: { fontSize: 11, color: "#81766f", marginLeft: 8 },
  meals: { flexDirection: "row", gap: 6, marginTop: 9 },
  meal: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: "#f8f2e9",
    alignItems: "center",
  },
  mealActive: { backgroundColor: colors.plum },
  mealText: { fontSize: 9, color: colors.espresso },
  mealTextActive: { color: colors.cream, fontWeight: "900" },
  ingredients: { fontSize: 10, lineHeight: 15, color: "#5e554f", marginTop: 6 },
  cancel: {
    fontSize: 11,
    color: colors.plum,
    textAlign: "center",
    marginTop: 12,
  },
});
