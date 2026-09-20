import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, type } from "../theme";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={ui.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={ui.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={ui.eyebrow}>{children}</Text>;
}
export function Section({ title, action }: { title: string; action?: string }) {
  return (
    <View style={ui.section}>
      <Text style={ui.sectionTitle}>{title}</Text>
      {action && <Text style={ui.link}>{action}</Text>}
    </View>
  );
}
export function Sticker({
  children,
  color = colors.mustard,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <View style={[ui.sticker, { backgroundColor: color }]}>
      <Text style={ui.stickerText}>{children}</Text>
    </View>
  );
}
export function MacroCard({
  label,
  value,
  background,
  color = colors.espresso,
}: {
  label: string;
  value: string;
  background: string;
  color?: string;
}) {
  return (
    <View style={[ui.macro, { backgroundColor: background }]}>
      <Text style={[ui.macroLabel, { color }]}>{label}</Text>
      <Text style={[ui.macroValue, { color }]}>{value}</Text>
      <View style={ui.track}>
        <View
          style={[ui.trackFill, { width: "58%", backgroundColor: color }]}
        />
      </View>
    </View>
  );
}
export function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={ui.quick} onPress={onPress}>
      <Text style={ui.quickIcon}>{icon}</Text>
      <View>
        <Text style={ui.quickText}>{title}</Text>
        <Text style={ui.muted}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}
export const ui = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 22, paddingBottom: 34 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: "800",
    color: colors.orange,
    textTransform: "uppercase",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: type.display,
    fontSize: 19,
    color: colors.espresso,
  },
  link: { color: colors.orange, fontSize: 12, fontWeight: "800" },
  sticker: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.espresso,
  },
  stickerText: { fontSize: 11, fontWeight: "800", color: colors.espresso },
  macroGrid: { flexDirection: "row", gap: 9 },
  macro: {
    flex: 1,
    minHeight: 112,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 15,
    padding: 12,
    justifyContent: "space-between",
  },
  macroLabel: { fontSize: 10, letterSpacing: 1, fontWeight: "800" },
  macroValue: { fontSize: 19, fontWeight: "800" },
  track: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(43,33,28,.2)",
    overflow: "hidden",
  },
  trackFill: { height: "100%", borderRadius: 4 },
  quick: {
    width: "48%",
    minHeight: 70,
    padding: 11,
    borderWidth: 2,
    borderColor: colors.espresso,
    borderRadius: 14,
    backgroundColor: colors.paper,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quickIcon: { fontSize: 22, color: colors.orange },
  quickText: { fontSize: 13, fontWeight: "800", color: colors.espresso },
  muted: { fontSize: 12, color: "rgba(43,33,28,.62)", marginTop: 2 },
});
