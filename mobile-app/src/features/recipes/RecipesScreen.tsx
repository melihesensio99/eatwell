import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiFetch } from "../../api/client";
import { colors, type } from "../../theme";
import { Eyebrow, Screen, Section } from "../../components/RetroUI";
import { useFocusEffect } from "@react-navigation/native";

type Ingredient = { name: string; quantity: string; source: string; confidence: number };
type Recipe = {
  id?: string; recipeName: string; description: string; ingredients: Ingredient[]; steps: string[];
  preparationMinutes: number; cookingMinutes: number; servings: number;
  caloriesPerServing?: number | null; proteinGramsPerServing?: number | null;
  carbohydratesGramsPerServing?: number | null; fatGramsPerServing?: number | null;
};

export function RecipesScreen() {
  const [mode, setMode] = useState<"find" | "create">("find");
  const [ingredients, setIngredients] = useState("");
  const [servings, setServings] = useState("2");
  const [image, setImage] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState<Recipe[]>([]);
  const [expandedSavedId, setExpandedSavedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { apiFetch<Recipe[]>("/api/recipes/saved").then(setSaved).catch(() => setSaved([])); }, []);
  useFocusEffect(useCallback(() => () => {
    setRecipe(null);
    setImage(null);
    setIngredients("");
  }, []));

  const chooseImage = async (source: "camera" | "library") => {
    const permission = source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("İzin gerekli", source === "camera" ? "Tarif bulmak için kamera izni ver." : "Tarif bulmak için fotoğraf izni ver."); return; }
    const result = source === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.5, base64: true })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.5, base64: true });
    const asset = result.canceled ? null : result.assets[0];
    if (asset?.base64) setImage({ uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType ?? "image/jpeg" });
  };

  const generate = async () => {
    const list = ingredients.split(",").map((item) => item.trim()).filter(Boolean).slice(0, 10);
    if (mode === "find" && !image) { Alert.alert("Görsel seç", "Tarif bulmak için bir yemek veya malzeme fotoğrafı ekle."); return; }
    if (mode === "create" && list.length === 0) { Alert.alert("Malzeme ekle", "Tarif oluşturmak için en az bir malzeme yaz."); return; }
    setBusy(true);
    try {
      const result = await apiFetch<Recipe>("/api/recipes/generate", { method: "POST", body: JSON.stringify({
        ingredients: list, servings: Math.max(1, Math.min(12, Number(servings) || 2)), dietaryPreference: null,
        imageBase64: image?.base64 ?? null, mimeType: image?.mimeType ?? null,
      }) }, 180_000);
      setRecipe(result);
    } catch (error) { Alert.alert("Tarif oluşturulamadı", error instanceof Error ? error.message : "Tekrar dene."); }
    finally { setBusy(false); }
  };

  const save = async () => {
    if (!recipe) return;
    try { const stored = await apiFetch<Recipe>("/api/recipes/saved", { method: "POST", body: JSON.stringify(recipe) }); setSaved((current) => [stored, ...current]); Alert.alert("Kaydedildi", "Tarifin tarif defterine eklendi."); }
    catch (error) { Alert.alert("Tarif kaydedilemedi", error instanceof Error ? error.message : "Tekrar dene."); }
  };

  const deleteSaved = (item: Recipe) => {
    if (!item.id) return;
    Alert.alert("Tarifi sil", `${item.recipeName} tarif defterinden silinsin mi?`, [
      { text: "Vazgeç", style: "cancel" },
      { text: "Sil", style: "destructive", onPress: async () => {
        try {
          await apiFetch(`/api/recipes/saved/${item.id}`, { method: "DELETE" });
          setSaved((current) => current.filter((recipe) => recipe.id !== item.id));
          setExpandedSavedId(null);
        } catch (error) {
          Alert.alert("Tarif silinemedi", error instanceof Error ? error.message : "Tekrar dene.");
        }
      } },
    ]);
  };

  return <Screen>
    <Eyebrow>EatWell mutfak</Eyebrow>
    <Text style={s.title}>Tarifler.</Text>
    <Text style={s.intro}>Elindeki yemeği tanıt veya malzemelerini yaz; sana uygun bir tarif hazırlayalım.</Text>
    <View style={s.modeRow}>
      <Pressable style={[s.mode, mode === "find" && s.modeActive]} onPress={() => setMode("find")}><Text style={s.modeIcon}>📷</Text><Text style={[s.modeTitle, mode === "find" && s.modeTitleActive]}>Tarif Bul</Text><Text style={[s.modeCopy, mode === "find" && s.modeCopyActive]}>Görselden tarif öner</Text></Pressable>
      <Pressable style={[s.mode, mode === "create" && s.modeActive]} onPress={() => setMode("create")}><Text style={s.modeIcon}>🥕</Text><Text style={[s.modeTitle, mode === "create" && s.modeTitleActive]}>Tarif Oluştur</Text><Text style={[s.modeCopy, mode === "create" && s.modeCopyActive]}>Malzemelerini yaz</Text></Pressable>
    </View>
    <View style={s.panel}>
      {mode === "find" ? <>
        <Text style={s.panelTitle}>Yemeğinin fotoğrafını ekle</Text>
        {image ? <Image source={{ uri: image.uri }} style={s.image} /> : <Text style={s.placeholder}>Fotoğraf seçerek yemeğini tanımlayalım.</Text>}
        <View style={s.imageActions}>
          <Pressable style={[s.secondary, s.imageAction]} onPress={() => chooseImage("camera")}><Text style={s.secondaryText}>📷 Kamerayı aç</Text></Pressable>
          <Pressable style={[s.secondary, s.imageAction]} onPress={() => chooseImage("library")}><Text style={s.secondaryText}>🖼️ Galeriden seç</Text></Pressable>
        </View>
      </> : <>
        <Text style={s.panelTitle}>Malzemelerin</Text>
        <TextInput value={ingredients} onChangeText={setIngredients} placeholder="Örn. tavuk, yoğurt, domates, pirinç" placeholderTextColor="rgba(43,33,28,.45)" style={s.input} multiline />
        <Text style={s.hint}>Virgülle ayırarak en fazla 10 malzeme yazabilirsin.</Text>
      </>}
      {mode === "create" && <View style={s.servingsRow}><Text style={s.smallLabel}>KAÇ KİŞİLİK?</Text><TextInput value={servings} onChangeText={setServings} keyboardType="number-pad" style={s.servingsInput} /></View>}
      <Pressable style={s.primary} onPress={generate} disabled={busy}>{busy ? <ActivityIndicator color={colors.cream} /> : <Text style={s.primaryText}>{mode === "find" ? "✦ Görselden tarif bul" : "✦ Tarif oluştur"}</Text>}</Pressable>
    </View>
    {recipe && <View style={s.result}>
      <Section title="Önerilen tarif" /><Text style={s.recipeTitle}>{recipe.recipeName}</Text><Text style={s.description}>{recipe.description}</Text>
      <Text style={s.meta}>{recipe.preparationMinutes + recipe.cookingMinutes} dk · {recipe.servings} kişilik</Text>
      <Text style={s.subTitle}>Malzemeler</Text>{recipe.ingredients.map((item, index) => <Text style={s.line} key={`${item.name}-${index}`}>• {item.quantity} {item.name}</Text>)}
      <Text style={s.subTitle}>Hazırlanışı</Text>{recipe.steps.map((step, index) => <Text style={s.line} key={`${step}-${index}`}>{index + 1}. {step}</Text>)}
      <Pressable style={s.secondary} onPress={save}><Text style={s.secondaryText}>♡ Tarif defterine kaydet</Text></Pressable>
    </View>}
    <Section title="Tarif defterim" />
    {saved.length === 0 ? <Text style={s.empty}>Henüz kaydedilmiş tarifin yok.</Text> : saved.slice(0, 5).map((item) => {
      const expanded = expandedSavedId === item.id;
      return <Pressable style={s.savedCard} key={item.id} onPress={() => setExpandedSavedId(expanded ? null : item.id ?? null)}>
        <Text style={s.savedTitle}>{item.recipeName}</Text>
        {!expanded ? <Text style={s.savedCopy}>{item.description}</Text> : <>
          <Text style={s.savedCopy}>{item.description}</Text>
          <Text style={s.subTitle}>Süre ve porsiyon</Text>
          <Text style={s.line}>{item.preparationMinutes + item.cookingMinutes} dk · {item.servings} kişilik</Text>
          {(item.caloriesPerServing != null || item.proteinGramsPerServing != null || item.carbohydratesGramsPerServing != null || item.fatGramsPerServing != null) && <Text style={s.line}>Kalori: {item.caloriesPerServing ?? "—"} kcal · Protein: {item.proteinGramsPerServing ?? "—"} g · Karbonhidrat: {item.carbohydratesGramsPerServing ?? "—"} g · Yağ: {item.fatGramsPerServing ?? "—"} g</Text>}
          <Text style={s.subTitle}>Malzemeler</Text>
          {item.ingredients.map((ingredient, index) => <Text style={s.line} key={`${ingredient.name}-${index}`}>• {ingredient.quantity} {ingredient.name}</Text>)}
          <Text style={s.subTitle}>Hazırlanışı</Text>
          {item.steps.map((step, index) => <Text style={s.line} key={`${step}-${index}`}>{index + 1}. {step}</Text>)}
          <Pressable style={s.deleteButton} onPress={() => deleteSaved(item)}><Text style={s.deleteText}>Tarifi sil</Text></Pressable>
        </>}
      </Pressable>;
    })}
  </Screen>;
}

const s = StyleSheet.create({
  title: { fontFamily: type.display, fontSize: 34, color: colors.espresso, marginTop: 5 }, intro: { fontSize: 13, lineHeight: 19, color: "rgba(43,33,28,.68)", marginVertical: 10 },
  modeRow: { flexDirection: "row", gap: 10, marginTop: 12 }, mode: { flex: 1, minHeight: 115, padding: 13, borderRadius: 16, borderWidth: 2, borderColor: colors.espresso, backgroundColor: colors.paper }, modeActive: { backgroundColor: colors.plum }, modeIcon: { fontSize: 25, marginBottom: 8 }, modeTitle: { fontSize: 15, fontWeight: "900", color: colors.espresso }, modeTitleActive: { color: colors.cream }, modeCopy: { fontSize: 11, color: "rgba(43,33,28,.62)", marginTop: 4 }, modeCopyActive: { color: "rgba(255,248,235,.75)" },
  panel: { backgroundColor: colors.paper, borderRadius: 17, borderWidth: 2, borderColor: colors.espresso, padding: 15, marginTop: 15 }, panelTitle: { fontSize: 13, fontWeight: "900", color: colors.plum, marginBottom: 10 }, placeholder: { color: "rgba(43,33,28,.55)", fontSize: 12, lineHeight: 18, paddingVertical: 24, textAlign: "center" }, image: { height: 170, borderRadius: 12, marginBottom: 10 }, imageActions: { flexDirection: "row", gap: 8 }, imageAction: { flex: 1 }, input: { minHeight: 90, borderWidth: 2, borderColor: colors.espresso, borderRadius: 12, padding: 12, color: colors.espresso, textAlignVertical: "top", fontSize: 13 }, hint: { color: "rgba(43,33,28,.55)", fontSize: 10, marginTop: 7 },
  servingsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }, smallLabel: { fontSize: 10, letterSpacing: 1, fontWeight: "900", color: colors.orange }, servingsInput: { width: 58, borderWidth: 2, borderColor: colors.espresso, borderRadius: 9, padding: 7, textAlign: "center", color: colors.espresso, fontWeight: "900" }, primary: { backgroundColor: colors.orange, borderRadius: 13, paddingVertical: 14, alignItems: "center", marginTop: 14 }, primaryText: { color: colors.cream, fontSize: 13, fontWeight: "900" }, secondary: { backgroundColor: "#eee1cf", borderRadius: 11, paddingVertical: 12, alignItems: "center", marginTop: 10 }, secondaryText: { color: colors.plum, fontSize: 12, fontWeight: "900" },
  result: { marginTop: 4, backgroundColor: colors.paper, borderRadius: 17, borderWidth: 2, borderColor: colors.espresso, padding: 15 }, recipeTitle: { fontFamily: type.display, fontSize: 25, color: colors.plum }, description: { color: "rgba(43,33,28,.7)", fontSize: 12, lineHeight: 18, marginTop: 7 }, meta: { color: colors.orange, fontSize: 11, fontWeight: "900", marginTop: 8 }, subTitle: { color: colors.plum, fontSize: 13, fontWeight: "900", marginTop: 15, marginBottom: 6 }, line: { color: colors.espresso, fontSize: 12, lineHeight: 19 }, empty: { color: "rgba(43,33,28,.6)", fontSize: 12, paddingVertical: 10 }, savedCard: { padding: 13, borderRadius: 14, backgroundColor: colors.paper, borderWidth: 2, borderColor: "rgba(43,33,28,.18)", marginBottom: 9 }, savedTitle: { fontFamily: type.display, fontSize: 17, color: colors.plum }, savedCopy: { color: "rgba(43,33,28,.64)", fontSize: 11, lineHeight: 16, marginTop: 4 },
  deleteButton: { alignSelf: "flex-start", marginTop: 15, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 9, backgroundColor: "#f5d8d1" }, deleteText: { color: "#a83c35", fontSize: 11, fontWeight: "900" },
});
