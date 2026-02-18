import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Spacing, BorderRadius, FontSize } from '../constants/colors';

interface Props {
  navigation: any;
  route: any;
}

const BarcodeScannerScreen: React.FC<Props> = ({ navigation, route }) => {
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
      <View style={styles.container}>
        <Text style={styles.messageText}>Kamera izni yükleniyor...</Text>
      </View>
    );
  }

  // İzin verilmediyse
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.emoji}>📸</Text>
        <Text style={styles.title}>Kamera İzni Gerekli</Text>
        <Text style={styles.messageText}>
          Barkod taramak için kamera erişimine izin vermeniz gerekiyor.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>İzin Ver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backLink}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backLinkText}>← Geri Dön</Text>
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
        {/* Üst karanlık alan */}
        <View style={styles.overlayTop}>
          <Text style={styles.scanTitle}>📷 Barkodu Tarayın</Text>
          <Text style={styles.scanSubtitle}>
            Ürünün barkodunu kamera alanına hizalayın
          </Text>
        </View>

        {/* Ortadaki tarama çerçevesi */}
        <View style={styles.scanAreaRow}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame}>
            {/* Köşe çizgileri */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>

        {/* Alt karanlık alan */}
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

const SCAN_AREA_SIZE = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  messageText: {
    color: Colors.textSecondary,
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
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  backLink: {
    padding: Spacing.md,
  },
  backLinkText: {
    color: Colors.textMuted,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  // Camera overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  scanSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.sm,
  },
  scanAreaRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 0,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: Colors.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    gap: Spacing.md,
  },
  rescanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  rescanText: {
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  cancelText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});

export default BarcodeScannerScreen;
