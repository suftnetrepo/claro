/**
 * ReceiptScannerSheet.tsx
 * Claro — Receipt Scanning UI
 *
 * Drop this file into: src/components/ReceiptScannerSheet.tsx
 *
 * Built entirely with fluent-styles components — no bare React Native
 * primitives except View (layout only, no styling). Every button, text
 * block, card, loader, and pressable uses the library your other screens use.
 *
 * Usage:
 *   <ReceiptScannerSheet
 *     visible={showScanner}
 *     onClose={() => setShowScanner(false)}
 *     onConfirm={(data) => {
 *       setAmount(String(data.amount));
 *       setSelectedCategory(data.suggestedCategory);
 *       setNotes(data.merchant);
 *       setDate(new Date(data.date));
 *     }}
 *   />
 */

import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import Svg, { Path, Circle, Rect, Line } from "react-native-svg";
import {
  Popup,
  StyledButton,
  StyledText,
  StyledCard,
  StyledImage,
  Stack,
  StyledScrollView,
  StyledShape,
  StyledSpacer,
  Loader,
  toastService,
} from "fluent-styles";

import { scanReceipt, ReceiptExtraction } from "../services/receiptService";
import { useColors } from "../constants/useColors";
import { useReceiptScanLimit, FREE_SCAN_LIMIT } from "../hooks/useReceiptScanLimit";
import { usePremium } from "../hooks/usePremium";
import { PremiumBanner } from "../screens/premium/PremiumGate";

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewState = "idle" | "scanning" | "analysing" | "review" | "error";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: ReceiptExtraction) => void;
}

// ─── Scan-line animation (kept as a plain View — no styling, pure motion) ────

function ScanLine({ color }: { color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(180, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: color,
    opacity: 0.85,
  }));

  return <Animated.View style={style} />;
}

// ─── Receipt frame icon ───────────────────────────────────────────────────────

function ReceiptIcon({ color, size = 64 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Rect x="18" y="8" width="44" height="56" rx="4" stroke={color} strokeWidth="2.5" />
      <Path
        d="M18 64 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4 l4 4 l4-4"
        stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"
      />
      <Line x1="26" y1="24" x2="54" y2="24" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="26" y1="32" x2="46" y2="32" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="26" y1="40" x2="50" y2="40" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="26" y1="50" x2="54" y2="50" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <Circle cx="60" cy="60" r="14" fill={color} opacity="0.15" />
      <Circle cx="60" cy="60" r="9" stroke={color} strokeWidth="2" fill="none" />
      <Circle cx="60" cy="60" r="3" fill={color} />
    </Svg>
  );
}

function CameraIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function GalleryIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="2" />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Data row ─────────────────────────────────────────────────────────────────

function DataRow({
  label,
  value,
  textColor,
  mutedColor,
}: {
  label: string;
  value: string;
  textColor: string;
  mutedColor: string;
}) {
  return (
    <Stack horizontal alignItems="center" paddingVertical={13}>
      <StyledText
        fontSize={14}
        color={mutedColor}
        flex={1}
      >
        {label}
      </StyledText>
      <StyledText
        fontSize={14}
        fontWeight="600"
        color={textColor}
        textAlign="right"
      >
        {value}
      </StyledText>
    </Stack>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReceiptScannerSheet({ visible, onClose, onConfirm }: Props) {
  const colors = useColors();
  const { isPremium } = usePremium();
  const { scansUsed, scansRemaining, limitReached, incrementCount, refresh: refreshScanLimit } = useReceiptScanLimit();
  const [state, setState] = useState<ViewState>("idle");
  const [extraction, setExtraction] = useState<ReceiptExtraction | null>(null);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Reset when sheet opens — backup path; the real reset is handleClose()
  // below, fired directly from every dismissal (X, swipe, backdrop, confirm).
  // Relying on this effect alone left the sheet showing stale review data
  // on reopen when Popup's own close gestures didn't produce a clean
  // false→true transition of `visible` for this effect to key off.
  useEffect(() => {
    if (visible) {
      setState("idle");
      setExtraction(null);
      setThumbnailUri(null);
      setErrorMessage("");
      refreshScanLimit();
    }
  }, [visible, refreshScanLimit]);

  // Always reset local state before telling the parent to close — don't
  // rely solely on the `visible`-watching effect above (see its comment).
  const handleClose = useCallback(() => {
    setState("idle");
    setExtraction(null);
    setThumbnailUri(null);
    setErrorMessage("");
    onClose();
  }, [onClose]);

  const handleScan = useCallback(async (source: "camera" | "library") => {
    setState("scanning");
    await new Promise((r) => setTimeout(r, 700));
    setState("analysing");

    const result = await scanReceipt(source);

    if (!result.success) {
      if (result.error === "cancelled") {
        setState("idle");
        return;
      }
      setErrorMessage(result.message);
      setState("error");
      return;
    }

    setExtraction(result.data);
    setThumbnailUri(result.imageUri);
    setState("review");
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!extraction) return;
    await incrementCount();
    onConfirm(extraction);
    toastService.success("Receipt imported — review and save");
    handleClose();
  }, [extraction, incrementCount, onConfirm, handleClose]);

  const handleRetry = useCallback(() => {
    setState("idle");
    setExtraction(null);
    setThumbnailUri(null);
  }, []);

  // ── Idle ────────────────────────────────────────────────────────────────────

  const renderIdle = () => (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <Stack alignItems="center" paddingTop={8} paddingBottom={24}>

        {/* Icon ring */}
        <StyledShape
          size={120}
          borderRadius={60}
          backgroundColor={colors.primary + "14"}
          borderWidth={2}
          borderColor={colors.primary + "30"}
          marginBottom={24}
        >
          <ReceiptIcon color={colors.primary} size={64} />
        </StyledShape>

        <StyledText
          fontSize={22}
          fontWeight="700"
          color={colors.textPrimary}
          textAlign="center"
          marginBottom={10}
        >
          Scan a receipt
        </StyledText>

        <StyledText
          fontSize={14}
          color={colors.textMuted}
          textAlign="center"
          marginBottom={32}
          paddingHorizontal={16}
          lineHeight={22}
        >
          Point your camera at any receipt and we'll fill in the details automatically.
        </StyledText>

        {limitReached ? (
          <Stack alignItems="stretch" style={{ width: "100%" }}>
            <PremiumBanner
              message="Free scan limit reached"
              subtext={`You've used all ${FREE_SCAN_LIMIT} receipt scans this month`}
            />
          </Stack>
        ) : (
          <>
            {/* Primary: Camera */}
            <StyledButton
              primary
              block
              onPress={() => handleScan("camera")}
              leftIcon={<CameraIcon color={colors.white} size={18} />}
              style={{ marginBottom: 12 }}
            >
              <StyledButton.Text
                color={colors.white}
                fontSize={18}
                fontWeight="600"
              >
                Open Camera
              </StyledButton.Text>
            </StyledButton>

            {/* Secondary: Library */}
            <StyledButton
              outline
              block
              onPress={() => handleScan("library")}
              leftIcon={<GalleryIcon color={colors.textPrimary} size={16} />}
              style={{ marginBottom: 12 }}
            >
              <StyledButton.Text
                color={colors.textPrimary}
                fontSize={18}
              >
                Choose from Library
              </StyledButton.Text>
            </StyledButton>

            {!isPremium && scansUsed > 0 && (
              <StyledText
                fontSize={12}
                color={colors.textMuted}
                textAlign="center"
                marginBottom={12}
              >
                {scansRemaining} scan{scansRemaining === 1 ? "" : "s"} left this month
              </StyledText>
            )}
          </>
        )}

        <StyledText
          fontSize={12}
          color={colors.textMuted}
          textAlign="center"
        >
          🔒 Receipt images are sent to OpenAI for analysis and never stored.
        </StyledText>
      </Stack>
    </Animated.View>
  );

  // ── Scanning ────────────────────────────────────────────────────────────────

  const renderScanning = () => (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <Stack alignItems="center" justifyContent="center" paddingVertical={40}>

        {/* Corner-bracket frame */}
        <View style={[styles.scanFrame, { borderColor: colors.primary + "40" }]}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
          <ScanLine color={colors.primary} />
        </View>

        <StyledSpacer height={28} />

        <StyledText
          fontSize={18}
          fontWeight="600"
          color={colors.textPrimary}
          textAlign="center"
          marginBottom={8}
        >
          Scanning receipt…
        </StyledText>

        <StyledText
          fontSize={14}
          color={colors.textMuted}
          textAlign="center"
        >
          Keep the receipt flat and well-lit
        </StyledText>
      </Stack>
    </Animated.View>
  );

  // ── Analysing ───────────────────────────────────────────────────────────────

  const renderAnalysing = () => (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <Stack alignItems="center" justifyContent="center" paddingVertical={48}>

        <Loader
          variant="circular"
          color={colors.primary}
          label="Analysing receipt…"
          theme="system"
        />

        <StyledSpacer height={16} />

        <StyledText
          fontSize={14}
          color={colors.textMuted}
          textAlign="center"
        >
          Reading merchant, amount, and date
        </StyledText>
      </Stack>
    </Animated.View>
  );

  // ── Review ──────────────────────────────────────────────────────────────────

  const renderReview = () => {
    if (!extraction) return null;

    const formattedAmount = new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: extraction.currency,
    }).format(extraction.amount);

    const formattedDate = new Date(extraction.date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(150)}>
        <StyledScrollView showsVerticalScrollIndicator={false}>

          {/* Merchant + thumbnail */}
          <Stack horizontal alignItems="center" gap={14} marginBottom={16}>
            {thumbnailUri && (
              <StyledImage
                source={{ uri: thumbnailUri }}
                width={64}
                height={80}
                borderRadius={8}
                borderWidth={1}
                borderColor={colors.border}
                resizeMode="cover"
              />
            )}
            <Stack flex={1} gap={8}>
              <StyledText
                fontSize={18}
                fontWeight="700"
                color={colors.textPrimary}
              >
                {extraction.merchant}
              </StyledText>
            </Stack>
          </Stack>

          {/* Amount hero card */}
          <StyledCard
            backgroundColor={colors.primary + "10"}
            borderRadius={16}
            padding={20}
            marginBottom={12}
            borderWidth={1}
            borderColor={colors.primary + "28"}
            alignItems="center"
          >
            <StyledText
              fontSize={11}
              fontWeight="600"
              color={colors.primary}
              letterSpacing={1}
              textTransform="uppercase"
              marginBottom={6}
            >
              Total Amount
            </StyledText>
            <StyledText
              fontSize={36}
              fontWeight="700"
              color={colors.primary}
              letterSpacing={-1}
            >
              {formattedAmount}
            </StyledText>
          </StyledCard>

          {/* Data rows card */}
          <StyledCard
            backgroundColor={colors.bgCard}
            borderRadius={16}
            paddingHorizontal={16}
            marginBottom={12}
            borderWidth={1}
            borderColor={colors.border}
          >
            <DataRow label="Date" value={formattedDate} textColor={colors.textPrimary} mutedColor={colors.textMuted} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <DataRow label="Category" value={extraction.suggestedCategory} textColor={colors.textPrimary} mutedColor={colors.textMuted} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <DataRow label="Currency" value={extraction.currency} textColor={colors.textPrimary} mutedColor={colors.textMuted} />
            {extraction.notes ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <DataRow label="Items" value={extraction.notes} textColor={colors.textPrimary} mutedColor={colors.textMuted} />
              </>
            ) : null}
          </StyledCard>

          <StyledText
            fontSize={12}
            color={colors.textMuted}
            textAlign="center"
            marginBottom={20}
          >
            You can edit any of these details after importing.
          </StyledText>

        </StyledScrollView>

        {/* Actions */}
        <Stack horizontal gap={12} paddingTop={8}>
          <Stack flex={1}>
            <StyledButton outline block onPress={handleRetry}>
              <StyledButton.Text color={colors.textMuted} fontSize={14}>
                Try Again
              </StyledButton.Text>
            </StyledButton>
          </Stack>
          <Stack flex={2}>
            <StyledButton primary block onPress={handleConfirm}>
              <StyledButton.Text
                color={colors.white}
                fontSize={14}
                fontWeight="600"
              >
                Use This Receipt
              </StyledButton.Text>
            </StyledButton>
          </Stack>
        </Stack>
      </Animated.View>
    );
  };

  // ── Error ───────────────────────────────────────────────────────────────────

  const renderError = () => (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <Stack alignItems="center" paddingVertical={40}>

        <StyledShape
          size={80}
          borderRadius={40}
          backgroundColor={colors.error + "14"}
          marginBottom={20}
        >
          <StyledText fontSize={32} textAlign="center">📷</StyledText>
        </StyledShape>

        <StyledText
          fontSize={20}
          fontWeight="700"
          color={colors.textPrimary}
          textAlign="center"
          marginBottom={10}
        >
          Couldn't read that receipt
        </StyledText>

        <StyledText
          fontSize={14}
          color={colors.textMuted}
          textAlign="center"
          marginBottom={32}
          paddingHorizontal={16}
          lineHeight={22}
        >
          {errorMessage}
        </StyledText>

        <StyledButton primary block onPress={handleRetry}>
          <StyledButton.Text
            color={colors.white}
            fontSize={18}
            fontWeight="600"
          >
            Try Again
          </StyledButton.Text>
        </StyledButton>
      </Stack>
    </Animated.View>
  );

  // ── Sheet ───────────────────────────────────────────────────────────────────

  const titleMap: Record<ViewState, string> = {
    idle: "Scan Receipt",
    scanning: "Scan Receipt",
    analysing: "Scan Receipt",
    review: "Review Receipt",
    error: "Scan Receipt",
  };

  const canClose = state === "idle" || state === "review" || state === "error";

  return (
    <Popup
      visible={visible}
      onClose={canClose ? handleClose : undefined}
      closeOnPressOverlay={canClose}
      title={titleMap[state]}
      showClose={canClose}
      showHandle
      round
      roundRadius={24}
      safeAreaBottom
      position="bottom"
      animation="slide"
      colors={{
        background: colors.bg,
        headerTitle: colors.textPrimary,
      }}
    >
      <Stack paddingHorizontal={20} paddingBottom={8}>
        {state === "idle" && renderIdle()}
        {state === "scanning" && renderScanning()}
        {state === "analysing" && renderAnalysing()}
        {state === "review" && renderReview()}
        {state === "error" && renderError()}
      </Stack>
    </Popup>
  );
}

// ─── Minimal structural styles (no colours — all from useColors/theme) ────────

const styles = StyleSheet.create({
  scanFrame: {
    width: 240,
    height: 200,
    borderWidth: 1,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderWidth: 3,
  },
  cornerTL: { top: -1, left: -1, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: -1, right: -1, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: -1, left: -1, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -1, right: -1, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 8 },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
