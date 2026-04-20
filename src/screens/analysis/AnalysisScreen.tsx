import React, { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  Stack,
  StyledText,
  StyledPressable,
  StyledSkeleton,
  StyledEmptyState,
  TabBar,
  StyledPage,
} from "fluent-styles";
import Svg, {
  Rect,
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
  G,
  Text as SvgText,
} from "react-native-svg";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { IconCircle } from "../../icons/map";
import { Colors, useColors } from "../../constants";
import { useAnalysis, useSettings, useExpenseRangeTotal } from "../../hooks";
import { useRecordsStore } from "../../stores";
import { formatCurrency } from "../../utils";
import { Text } from "../../components";
import type { CategorySpending } from "../../hooks";

const TABS = [
  { value: "spending" as const, label: "Spending" },
  { value: "income" as const, label: "Income" },
  { value: "trends" as const, label: "Trends" },
];
type TabValue = (typeof TABS)[number]["value"];

// ─── Month navigator ──────────────────────────────────────────────────────────
function MonthNav() {
  const Colors = useColors();
  const { selectedMonth, prevMonth, nextMonth } = useRecordsStore();
  const isNow =
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();
  return (
    <Stack
      horizontal
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={20}
      paddingVertical={12}
    >
      <StyledPressable
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={Colors.accent}
        alignItems="center"
        justifyContent="center"
        onPress={prevMonth}
      >
        <ChevronLeftIcon size={20} color={Colors.primary} strokeWidth={2.2} />
      </StyledPressable>
      <Text variant="label" fontSize={16} color={Colors.primary}>
        {format(selectedMonth, "MMMM, yyyy")}
      </Text>
      <StyledPressable
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={isNow ? Colors.bgMuted : Colors.accent}
        alignItems="center"
        justifyContent="center"
        onPress={nextMonth}
        disabled={isNow}
      >
        <ChevronRightIcon
          size={20}
          color={isNow ? Colors.textMuted : Colors.primary}
          strokeWidth={2.2}
        />
      </StyledPressable>
    </Stack>
  );
}

// ─── Shared smooth path helper (Catmull-Rom → cubic bezier) ─────────────────
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const d: string[] = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

// ─── Mini sparkline SVG — small wiggly line for the money cards ──────────────
function MiniSparkline({
  values,
  color,
  width = 80,
  height = 36,
}: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (values.length < 2) {
    return (
      <Svg width={width} height={height}>
        <Circle cx={width / 2} cy={height / 2} r={3} fill={color} />
      </Svg>
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pad = 4;
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (width - pad * 2),
    y: pad + (1 - (v - min) / range) * (height - pad * 2),
  }));
  const linePath = smoothPath(pts);
  const areaPath =
    linePath +
    ` L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgLinearGradient
          id={`sg_${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0.0" />
        </SvgLinearGradient>
      </Defs>
      <Path d={areaPath} fill={`url(#sg_${color.replace("#", "")})`} />
      <Path
        d={linePath}
        stroke={color}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Money card — "Money Out" / "Money In" card matching reference screenshot ─
function MoneyCard({
  title,
  amount,
  monthlyValues,
  pctChange,
  color,
  bg,
  symbol,
  isExpense,
  children,
}: {
  title: string;
  amount: number;
  monthlyValues: number[];
  pctChange: number | null;
  color: string;
  bg: string;
  symbol: string;
  isExpense: boolean;
  children: React.ReactNode;
}) {
  const Colors = useColors();
  // null = no previous month to compare — hide badge entirely
  const hasPct = pctChange !== null;
  const isUp = hasPct && pctChange! >= 0;
  // For expenses: up = bad; for income: up = good
  const isBad = isExpense ? isUp : !isUp;
  const badgeColor = isBad ? Colors.expense : Colors.income;
  const badgeBg = isBad ? Colors.expenseLight : Colors.incomeLight;

  return (
    <Stack
      borderRadius={20}
      backgroundColor={bg}
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
      }}
    >
      {/* Card header */}
      <Stack padding={18} paddingBottom={12}>
        <Stack
          horizontal
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack flex={1}>
            <Text
              fontSize={13}
              fontWeight="600"
              color={Colors.textMuted}
              letterSpacing={0.2}
            >
              This Month
            </Text>
            <Stack horizontal alignItems="baseline" gap={6} marginTop={4}>
              <Text
                fontSize={34}
                variant="amountSmall"
                fontWeight="700"
                color={color}
                letterSpacing={-0.8}
              >
                {formatCurrency(amount, symbol)}
              </Text>
            </Stack>
          </Stack>
          {/* Sparkline + pct badge */}
          <Stack alignItems="flex-end" gap={6}>
            <MiniSparkline
              values={monthlyValues}
              color={color}
              width={80}
              height={36}
            />
            {hasPct && (
              <Stack
                paddingHorizontal={8}
                paddingVertical={3}
                borderRadius={12}
                backgroundColor={badgeBg}
              >
                <Text fontSize={11} fontWeight="700" color={badgeColor}>
                  {isUp ? "▲" : "▼"} {Math.abs(pctChange!).toFixed(1)}%
                </Text>
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>

      {/* Divider */}
      <Stack height={1} backgroundColor={Colors.border} marginHorizontal={18} />

      {/* Category rows */}
      <Stack paddingBottom={8}>{children}</Stack>
    </Stack>
  );
}

// ─── Transaction row — icon + name/subtitle + amount ─────────────────────────
function TxRow({ item, symbol }: { item: CategorySpending; symbol: string }) {
  const Colors = useColors();
  return (
    <Stack
      horizontal
      alignItems="center"
      paddingHorizontal={18}
      paddingVertical={14}
      gap={14}
    >
      <IconCircle
        iconKey={item.categoryIcon}
        bg={item.categoryColor}
        size={40}
      />
      <Stack flex={1}>
        <Text fontSize={14} fontWeight="600" color={Colors.textPrimary}>
          {item.categoryName}
        </Text>
        <Text fontSize={12} color={Colors.textMuted} marginTop={2}>
          {item.percentage.toFixed(0)}% of total
        </Text>
      </Stack>
      <Text fontSize={14} fontWeight="600" color={Colors.textPrimary}>
        {formatCurrency(item.total, symbol)}
      </Text>
    </Stack>
  );
}

// ─── Spending tab ─────────────────────────────────────────────────────────────
function SpendingTab({
  data,
  symbol,
  loading,
}: {
  data: ReturnType<typeof useAnalysis>["data"];
  symbol: string;
  loading: boolean;
}) {
  const Colors = useColors();
  if (loading)
    return (
      <Stack padding={16}>
        <StyledSkeleton template="card" animation="shimmer" />
      </Stack>
    );
  if (!data || typeof data !== "object") {
    return (
      <Stack padding={16}>
        <StyledEmptyState
          variant="minimal"
          illustration="⚠️"
          title="Data error"
        />
      </Stack>
    );
  }

  const totalExpense = Number(data.totalExpense) || 0;
  const totalIncome = Number(data.totalIncome) || 0;
  const netBalance = Number(data.netBalance) || 0;
  const expenseByCategory = Array.isArray(data.expenseByCategory)
    ? data.expenseByCategory
    : [];
  // Sparkline from monthly totals
  const monthly = Array.isArray(data.monthlyTotals) ? data.monthlyTotals : [];
  const expValues = monthly.map((m) => Number(m.expense) || 0);
  const prevExp =
    expValues.length >= 2 ? expValues[expValues.length - 2] : null;
  const pctChange =
    prevExp != null && prevExp > 0
      ? ((totalExpense - prevExp) / prevExp) * 100
      : null;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Money Out card */}
      <MoneyCard
        title="Money Out"
        amount={totalExpense}
        monthlyValues={expValues}
        pctChange={pctChange}
        color={Colors.expense}
        bg={Colors.bgCard}
        symbol={symbol}
        isExpense={true}
      >
        {totalExpense === 0 ? (
          <Stack padding={20} alignItems="center">
            <Text fontSize={13} color={Colors.textMuted}>
              No spending this month
            </Text>
          </Stack>
        ) : (
          expenseByCategory.map((item, i) => (
            <Stack key={item.categoryId}>
              <TxRow item={item} symbol={symbol} />
              {i < expenseByCategory.length - 1 && (
                <Stack
                  height={1}
                  backgroundColor={Colors.border}
                  marginLeft={72}
                />
              )}
            </Stack>
          ))
        )}
      </MoneyCard>

      {/* Net balance summary row */}
      <Stack
        horizontal
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={4}
        paddingVertical={8}
      >
        <Text fontSize={13} color={Colors.textMuted}>
          Net Balance This Month
        </Text>
        <Text
          fontSize={15}
          fontWeight="700"
          color={netBalance >= 0 ? Colors.income : Colors.expense}
        >
          {netBalance >= 0 ? "+" : ""}
          {formatCurrency(netBalance, symbol)}
        </Text>
      </Stack>
    </ScrollView>
  );
}

// ─── Income tab ───────────────────────────────────────────────────────────────
function IncomeTab({
  data,
  symbol,
  loading,
}: {
  data: ReturnType<typeof useAnalysis>["data"];
  symbol: string;
  loading: boolean;
}) {
  const Colors = useColors();
  if (loading)
    return (
      <Stack padding={16}>
        <StyledSkeleton template="card" animation="shimmer" />
      </Stack>
    );
  if (!data || typeof data !== "object") {
    return (
      <Stack padding={16}>
        <StyledEmptyState
          variant="minimal"
          illustration="⚠️"
          title="Data error"
        />
      </Stack>
    );
  }

  const totalIncome = Number(data.totalIncome) || 0;
  const totalExpense = Number(data.totalExpense) || 0;
  const netBalance = Number(data.netBalance) || 0;
  const incomeByCategory = Array.isArray(data.incomeByCategory)
    ? data.incomeByCategory
    : [];
  const monthly = Array.isArray(data.monthlyTotals) ? data.monthlyTotals : [];
  const incValues = monthly.map((m) => Number(m.income) || 0);
  const prevInc =
    incValues.length >= 2 ? incValues[incValues.length - 2] : null;
  const pctChange =
    prevInc != null && prevInc > 0
      ? ((totalIncome - prevInc) / prevInc) * 100
      : null;

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Money In card */}
      <MoneyCard
        title="Money In"
        amount={totalIncome}
        monthlyValues={incValues}
        pctChange={pctChange}
        color={Colors.income}
        bg={Colors.bgCard}
        symbol={symbol}
        isExpense={false}
      >
        {totalIncome === 0 ? (
          <Stack padding={20} alignItems="center">
            <Text fontSize={13} color={Colors.textMuted}>
              No income this month
            </Text>
          </Stack>
        ) : (
          incomeByCategory.map((item, i) => (
            <Stack key={item.categoryId}>
              <TxRow item={item} symbol={symbol} />
              {i < incomeByCategory.length - 1 && (
                <Stack
                  height={1}
                  backgroundColor={Colors.border}
                  marginLeft={72}
                />
              )}
            </Stack>
          ))
        )}
      </MoneyCard>

      {/* Net balance summary row */}
      <Stack
        horizontal
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal={4}
        paddingVertical={8}
      >
        <Text fontSize={13} color={Colors.textMuted}>
          Net Balance This Month
        </Text>
        <Text
          fontSize={15}
          fontWeight="700"
          color={netBalance >= 0 ? Colors.income : Colors.expense}
        >
          {netBalance >= 0 ? "+" : ""}
          {formatCurrency(netBalance, symbol)}
        </Text>
      </Stack>
    </ScrollView>
  );
}

// ─── TrendsTab ────────────────────────────────────────────────────────────────
const TREND_RANGES = ["1D", "1W", "1M", "3M", "1Y", "ALL"] as const;
type TrendRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

function MonthlyPill() {
  const Colors = useColors();
  return (
    <Stack
      paddingHorizontal={14}
      paddingVertical={7}
      borderRadius={20}
      backgroundColor={Colors.bgMuted}
      borderWidth={1}
      borderColor={`rgba(255,255,255,0.06)`}
      alignItems="center"
      justifyContent="center"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
      }}
    >
      <StyledText fontSize={13} fontWeight="600" color={Colors.textPrimary}>
        Monthly ▾
      </StyledText>
    </Stack>
  );
}

function TrendsTab({
  data,
  symbol,
  loading,
}: {
  data: ReturnType<typeof useAnalysis>["data"];
  symbol: string;
  loading: boolean;
}) {
  const Colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number | null>(null);
  const [expenseRange, setExpenseRange] = useState<TrendRange>("3M");
  // Live DB total for the selected range
  const { data: rangeTotal } = useExpenseRangeTotal(expenseRange);
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);

  if (loading)
    return (
      <Stack padding={16}>
        <StyledSkeleton template="card" animation="shimmer" />
      </Stack>
    );
  if (!data || typeof data !== "object") {
    return (
      <Stack padding={16}>
        <StyledEmptyState
          variant="minimal"
          illustration="⚠️"
          title="Data error"
        />
      </Stack>
    );
  }

  const monthly = Array.isArray(data.monthlyTotals) ? data.monthlyTotals : [];
  const validMonthly = monthly.filter((m) => m && typeof m === "object");

  if (
    validMonthly.length === 0 ||
    !validMonthly.some(
      (m) => (Number(m.expense) || 0) > 0 || (Number(m.income) || 0) > 0,
    )
  ) {
    return (
      <Stack flex={1} padding={16}>
        <StyledEmptyState
          variant="minimal"
          illustration="📈"
          title="Not enough data yet"
          description="Trends appear after logging transactions across multiple months"
          animated
        />
      </Stack>
    );
  }

  // ── Color Palette: Separate UI Accent from Semantic Colors ──────────────
  const CARD_BG = Colors.bgCard;
  const UI_ACCENT = Colors.income; // Green for all interactive UI elements
  const INC_ACTIVE = UI_ACCENT; // Use UI accent for interactive states
  const INC_INACTIVE = Colors.income + "33"; // 20% opacity
  const INC_LABEL = Colors.textMuted;
  const INC_TITLE = Colors.textPrimary;
  const EXP_BG = Colors.bgCard;
  const EXP_LINE = Colors.expense; // Red ONLY for chart visualization, not UI selection
  const EXP_LABEL = Colors.textMuted;
  const EXP_TITLE = Colors.textPrimary;

  // ── Dimensions ────────────────────────────────────────────────────────────
  const CARD_PAD = 20;
  const SCROLL_PAD = 16;
  // Card inner width = screen - scroll padding - card padding on both sides
  const cardInner = screenWidth - SCROLL_PAD * 2 - CARD_PAD * 2;

  // ── Income data ───────────────────────────────────────────────────────────
  // Default to the month with highest income so the chart looks meaningful on load
  const defaultIncomeIdx = validMonthly.reduce(
    (best, m, i) =>
      (Number(m.income) || 0) > (Number(validMonthly[best]?.income) || 0)
        ? i
        : best,
    validMonthly.length - 1,
  );
  const activeIncomeIdx = selectedMonthIdx ?? defaultIncomeIdx;
  const totalIncome = Number(validMonthly[activeIncomeIdx]?.income) || 0;
  const incomeMaxVal = Math.max(
    ...validMonthly.map((m) => Number(m.income) || 0),
    1,
  );
  const n = validMonthly.length;

  // ── Expense data ──────────────────────────────────────────────────────────
  const rangeCount: Record<TrendRange, number> = {
    "1D": 1,
    "1W": 1,
    "1M": 1,
    "3M": 3,
    "1Y": 6,
    ALL: 99,
  };
  const filteredExpense = validMonthly.slice(
    -Math.min(rangeCount[expenseRange], validMonthly.length),
  );
  const expMaxVal = Math.max(
    ...filteredExpense.map((m) => Number(m.expense) || 0),
    1,
  );
  const filteredExpTotal = filteredExpense.reduce(
    (sum, m) => sum + (Number(m.expense) || 0),
    0,
  );
  const tooltipVal =
    tooltipIdx !== null
      ? Number(filteredExpense[tooltipIdx]?.expense) || 0
      : null;

  // ── SVG Income bar chart ───────────────────────────────────────────────────
  const BAR_H = 160;
  const BAR_MAX_H = 115; // tallest bar pixel height
  const BAR_VISUAL_MIN = 0.38; // inactive bars are at least 38% of BAR_MAX_H visually
  const SLOT_COUNT = n;
  const SLOT_W = Math.floor(cardInner / SLOT_COUNT);
  const BAR_W = Math.min(52, Math.floor(SLOT_W * 0.65));
  const BAR_RADIUS = BAR_W / 2;
  const incSvgW = cardInner;
  const RULE_Y = BAR_H - BAR_MAX_H - 6; // rule sits just above tallest possible bar top

  // Bar with large top radius (semicircle arch) + small bottom radius (gently rounded)
  function pillBar(x: number, y: number, w: number, h: number): string {
    const tr = Math.min(8, h / 2); // top radius = 8px, matching bottom
    const br = Math.min(8, h / 2); // bottom radius = 8px fixed, clamped for short bars
    return [
      // Start at top-left, after top-left arc
      `M ${x + tr} ${y}`,
      // Top edge → top-right arc
      `L ${x + w - tr} ${y}`,
      `A ${tr} ${tr} 0 0 1 ${x + w} ${y + tr}`,
      // Right side down → bottom-right arc
      `L ${x + w} ${y + h - br}`,
      `A ${br} ${br} 0 0 1 ${x + w - br} ${y + h}`,
      // Bottom edge → bottom-left arc
      `L ${x + br} ${y + h}`,
      `A ${br} ${br} 0 0 1 ${x} ${y + h - br}`,
      // Left side up → top-left arc
      `L ${x} ${y + tr}`,
      `A ${tr} ${tr} 0 0 1 ${x + tr} ${y}`,
      `Z`,
    ].join(" ");
  }

  function IncomeBarChart() {
    return (
      <Svg width={incSvgW} height={BAR_H} viewBox={`0 0 ${incSvgW} ${BAR_H}`}>
        <Defs>
          <SvgLinearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={INC_ACTIVE} stopOpacity="1" />
            <Stop offset="1" stopColor={INC_ACTIVE} stopOpacity="0.6" />
          </SvgLinearGradient>
        </Defs>

        {/* Subtle horizontal rule */}
        <Rect
          x={0}
          y={RULE_Y}
          width={incSvgW}
          height={1}
          fill="rgba(255,255,255,0.08)"
        />

        {validMonthly.map((m, i) => {
          const raw = Number(m.income) || 0;
          const isActive = i === activeIncomeIdx;
          // Real data ratio — preserves actual proportions between months
          const dataRatio = raw === 0 ? 0 : raw / incomeMaxVal;
          // Visual floor: zero-income months get a small arch stub; real data scales naturally.
          // Active bar gets a slight lift (+15%) to stand out without hiding other proportions.
          const visualRatio =
            dataRatio === 0
              ? BAR_VISUAL_MIN // stub for empty months
              : isActive
                ? Math.min(1, dataRatio * 1.0) // active: true proportion, capped at 100%
                : Math.max(BAR_VISUAL_MIN, dataRatio * 0.88); // inactive: slight reduction, floor at 38%
          const barH = Math.round(visualRatio * BAR_MAX_H);
          // Centre bar within its slot
          const slotX = i * SLOT_W;
          const x = slotX + (SLOT_W - BAR_W) / 2;
          const y = BAR_H - barH;
          return (
            <G key={i}>
              <Path
                d={pillBar(x, y, BAR_W, barH)}
                fill={isActive ? "url(#incGrad)" : INC_INACTIVE}
              />
              {/* Full-slot hit area */}
              <Rect
                x={slotX}
                y={0}
                width={SLOT_W}
                height={BAR_H}
                fill="transparent"
                onPress={() => setSelectedMonthIdx(i)}
              />
            </G>
          );
        })}
      </Svg>
    );
  }

  // ── SVG Expense line chart ─────────────────────────────────────────────────
  const LINE_H = 140;
  const expN = filteredExpense.length;
  const LINE_PAD = 20; // horizontal padding so first/last labels aren't clipped
  const lineSvgW = cardInner;

  function ExpenseLineChart() {
    if (expN < 2) {
      // Single point — just draw a centered circle
      const cy = LINE_H / 2;
      const cx = lineSvgW / 2;
      return (
        <Svg width={lineSvgW} height={LINE_H}>
          <Circle cx={cx} cy={cy} r={6} fill={EXP_LINE} />
        </Svg>
      );
    }

    // Map data → pixel coords with padding so labels aren't clipped at edges
    const drawW = lineSvgW - LINE_PAD * 2;
    const pts = filteredExpense.map((m, i) => {
      const val = Number(m.expense) || 0;
      const x = LINE_PAD + (expN === 1 ? drawW / 2 : (i / (expN - 1)) * drawW);
      const y = LINE_H - 8 - (val / expMaxVal) * (LINE_H - 24);
      return { x, y, val, label: m.month ? m.month.substring(0, 3) : "" };
    });

    const linePath = smoothPath(pts);
    // Area = line path + close down to bottom-right, across to bottom-left
    const areaPath =
      linePath +
      ` L ${pts[pts.length - 1].x} ${LINE_H} L ${pts[0].x} ${LINE_H} Z`;

    const selPt = tooltipIdx !== null ? pts[tooltipIdx] : null;

    return (
      <Svg
        width={lineSvgW}
        height={LINE_H + 20}
        viewBox={`0 0 ${lineSvgW} ${LINE_H + 20}`}
      >
        <Defs>
          <SvgLinearGradient id="expArea" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={EXP_LINE} stopOpacity="0.25" />
            <Stop offset="1" stopColor={EXP_LINE} stopOpacity="0.0" />
          </SvgLinearGradient>
        </Defs>
        {/* Area fill */}
        <Path d={areaPath} fill="url(#expArea)" />
        {/* Line */}
        <Path
          d={linePath}
          stroke={EXP_LINE}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data point dots — small on all, big dark on selected */}
        {pts.map((pt, i) => {
          const isSel = i === tooltipIdx;
          return (
            <G key={i}>
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={isSel ? 6 : 3}
                fill={isSel ? EXP_TITLE : EXP_LINE}
                stroke={isSel ? Colors.textPrimary : "none"}
                strokeWidth={isSel ? 2 : 0}
              />
              {/* Hit area */}
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={18}
                fill="transparent"
                onPress={() => setTooltipIdx((prev) => (prev === i ? null : i))}
              />
              {/* X-axis label */}
              <SvgText
                x={pt.x}
                y={LINE_H + 16}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fontFamily="System"
                fill={EXP_LABEL}
              >
                {pt.label}
              </SvgText>
            </G>
          );
        })}
        {/* Tooltip bubble above selected point */}
        {selPt &&
          (() => {
            const txt = formatCurrency(selPt.val, symbol);
            const bw = txt.length * 7.5 + 20;
            const bh = 28;
            const bx = Math.min(Math.max(selPt.x - bw / 2, 0), lineSvgW - bw);
            const by = Math.max(selPt.y - bh - 10, 0);
            return (
              <G>
                <Rect
                  x={bx}
                  y={by}
                  width={bw}
                  height={bh}
                  rx={8}
                  ry={8}
                  fill={Colors.bgMuted}
                  opacity="0.95"
                />
                <SvgText
                  x={bx + bw / 2}
                  y={by + bh / 2 + 4.5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fontFamily="System"
                  fill={Colors.textPrimary}
                >
                  {txt}
                </SvgText>
              </G>
            );
          })()}
      </Svg>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: SCROLL_PAD,
        paddingBottom: 36,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ══ INCOME CARD ══════════════════════════════════════════════════════ */}
      <Stack
        borderRadius={22}
        backgroundColor={CARD_BG}
        borderWidth={1}
        borderColor={`rgba(255,255,255,0.06)`}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Stack padding={CARD_PAD} paddingBottom={0}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <Text
              variant="title"
              fontSize={26}
              fontWeight="700"
              color={INC_TITLE}
              letterSpacing={-0.5}
            >
              Income by
            </Text>
            <MonthlyPill />
          </Stack>
          <Text fontSize={12} color={INC_LABEL} marginBottom={8}>
            Viewing last {n} months chart
          </Text>
          <Text
            fontSize={32}
            fontWeight="700"
            color={INC_TITLE}
            letterSpacing={-1}
            marginBottom={2}
          >
            {formatCurrency(totalIncome, symbol)}
          </Text>
          <Text
            variant="caption"
            fontSize={12}
            color={INC_LABEL}
            marginBottom={16}
          >
            Total income
          </Text>
        </Stack>

        {/* Bar chart */}
        <Stack paddingHorizontal={CARD_PAD} paddingBottom={0}>
          <IncomeBarChart />
        </Stack>

        {/* Month pill row */}
        <Stack
          horizontal
          justifyContent="space-around"
          paddingHorizontal={CARD_PAD}
          paddingBottom={20}
          paddingTop={8}
        >
          {validMonthly.map((m, i) => {
            const label = m.month ? m.month.substring(0, 3) : "---";
            const isActive = i === activeIncomeIdx;
            return (
              <StyledPressable
                key={i}
                onPress={() => setSelectedMonthIdx(i)}
                paddingHorizontal={10}
                paddingVertical={5}
                borderRadius={14}
                backgroundColor={isActive ? INC_ACTIVE : "transparent"}
                alignItems="center"
                justifyContent="center"
                minWidth={34}
              >
                <StyledText
                  fontSize={11}
                  fontWeight={isActive ? "700" : "500"}
                  color={isActive ? Colors.textOnDark : INC_LABEL}
                >
                  {label}
                </StyledText>
              </StyledPressable>
            );
          })}
        </Stack>
      </Stack>

      {/* ══ EXPENSE CARD ═════════════════════════════════════════════════════ */}
      <Stack
        borderRadius={22}
        backgroundColor={CARD_BG}
        borderWidth={1}
        borderColor={`rgba(255,255,255,0.06)`}
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.04,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        }}
      >
        {/* Header */}
        <Stack padding={CARD_PAD} paddingBottom={0}>
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <Text
              variant="title"
              fontSize={26}
              fontWeight="700"
              color={INC_TITLE}
              letterSpacing={-0.5}
            >
              Expense by
            </Text>
            <MonthlyPill />
          </Stack>
          <Text fontSize={12} color={EXP_LABEL} marginBottom={8}>
            Viewing last {filteredExpense.length} months chart
          </Text>
          <Text
            fontSize={32}
            fontWeight="700"
            color={EXP_TITLE}
            letterSpacing={-1}
            marginBottom={2}
          >
            {formatCurrency(rangeTotal.expense || filteredExpTotal, symbol)}
          </Text>
          <Text
            variant="caption"
            fontSize={12}
            color={EXP_LABEL}
            marginBottom={12}
          >
            Total expense
          </Text>
        </Stack>

        {/* Line chart */}
        <Stack paddingHorizontal={CARD_PAD} paddingBottom={4}>
          <ExpenseLineChart />
        </Stack>

        {/* Range selector */}
        <Stack
          horizontal
          justifyContent="space-around"
          paddingHorizontal={CARD_PAD}
          paddingBottom={20}
          paddingTop={4}
        >
          {TREND_RANGES.map((r) => {
            const isActive = r === expenseRange;
            return (
              <StyledPressable
                key={r}
                onPress={() => {
                  setExpenseRange(r);
                  setTooltipIdx(null);
                }}
                paddingHorizontal={12}
                paddingVertical={7}
                borderRadius={18}
                backgroundColor={isActive ? UI_ACCENT : "transparent"}
                alignItems="center"
                justifyContent="center"
                minWidth={34}
              >
                <StyledText
                  fontSize={12}
                  fontWeight={isActive ? "700" : "500"}
                  color={isActive ? Colors.textOnDark : EXP_LABEL}
                >
                  {r}
                </StyledText>
              </StyledPressable>
            );
          })}
        </Stack>
      </Stack>
    </ScrollView>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AnalysisScreen() {
  const Colors = useColors();
  const UI_ACCENT = Colors.income; // Green for all interactive UI elements
  const [tab, setTab] = useState<TabValue>("spending");
  const { data: settingsData } = useSettings();
  const symbol = settingsData?.currencySymbol ?? "$";
  const { data, loading } = useAnalysis();

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <Stack flex={1}>
        <Stack paddingHorizontal={20} paddingTop={8} paddingBottom={4}>
          <Text
             variant="title"
    
            fontWeight="700"
            color={Colors.textPrimary}
            letterSpacing={-0.5}
          >
            Analysis
          </Text>
        </Stack>

        <MonthNav />
        <TabBar
          options={TABS}
          value={tab}
          onChange={setTab}
          indicator="line"
          showBorder
          indicatorHeight={4}
          colors={{
            background: Colors.bgCard,
            activeText: UI_ACCENT,
            text: Colors.textMuted,
            indicator: UI_ACCENT,
            border: `rgba(255,255,255,0.08)`,
            badge: UI_ACCENT,
            activeChipBg: UI_ACCENT,
            activeChipText: Colors.textOnDark,
            disabled: Colors.textMuted,
          }}
          labelBulge={false}
          style={{
            paddingHorizontal: 20,
            borderRadius: 30,
            marginHorizontal: 20,
          }}
        />
        <Stack flex={1}>
          {tab === "spending" && (
            <SpendingTab data={data} symbol={symbol} loading={loading} />
          )}
          {tab === "income" && (
            <IncomeTab data={data} symbol={symbol} loading={loading} />
          )}
          {tab === "trends" && (
            <TrendsTab data={data} symbol={symbol} loading={loading} />
          )}
        </Stack>
      </Stack>
    </StyledPage>
  );
}
