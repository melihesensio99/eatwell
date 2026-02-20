import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';
import { useTheme } from '../constants/ThemeContext';

interface Props {
  navigation: any;
  route: any;
}

const BarcodeScannerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    // @ts-ignore
    const { nextScreen, nextScreenParams } = ((route || {}).params || {});
    
    if (nextScreen) {
      navigation.replace(nextScreen, { barcode: data, ...nextScreenParams });
    } else {
      navigation.replace('Analysis', { barcode: data });
    }
  };

  // Henüz izin bilgisi yüklenmediyse
  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>Kamera izni yükleniyor...</Text>
      </View>
    );
  }

  // İzin verilmediyse
  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permIconWrap}>
          <Text style={styles.emoji}>📸</Text>
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Kamera İzni Gerekli</Text>
        <Text style={[styles.messageText, { color: colors.textSecondary }]}>
          Barkod taramak için kamera erişimine izin vermeniz gerekiyor.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backLinkText, { color: colors.textMuted }]}>← Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        {/* Üst alan */}
        <View style={styles.overlayTop}>
          <Text style={styles.scanTitle}>Barkodu Tarayın</Text>
          <Text style={styles.scanSubtitle}>
            Ürünün barkodunu çerçeveye hizalayın
          </Text>
        </View>

        {/* Tarama çerçevesi */}
        <View style={styles.scanAreaRow}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>

        {/* Alt alan */}
        <View style={styles.overlayBottom}>
          {scanned && (
            <TouchableOpacity
              style={styles.rescanButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.rescanText}>🔄 Tekrar Tara</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const SCAN_AREA_SIZE = 270;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permIconWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 214, 143, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 214, 143, 0.15)',
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  messageText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  scanSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  scanAreaRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.7)',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderColor: Colors.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.7)',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  rescanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: BorderRadius.xl,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});

export default BarcodeScannerScreen;
