import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  SectionList,
  RefreshControl,
  PanResponder,
  useWindowDimensions,
} from "react-native";
import {
  Stack,
  StyledPressable,
  StyledEmptyState,
  StyledSkeleton,
  StyledPage,
  StyledCard,
  StyledDivider,
} from "fluent-styles";
import { dialogueService, toastService } from "fluent-styles";
import { router, useFocusEffect } from "expo-router";
import { format, subMonths } from "date-fns";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
  Line,
  Circle,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { IconCircle } from "../../icons/map";
import { ChevronLeftIcon, ChevronRightIcon, AddIcon } from "../../icons";
import { ClaroLogo } from "../../components/ClaroLogo";
import { useColors } from "../../constants";
import { useTransactions, useAccounts, useSettings } from "../../hooks";
import { useRecordsStore } from "../../stores";
import { formatCurrency, formatShortDate, formatTime } from "../../utils";
import { SwipeableRow, Text } from "../../components";
import { transactionService } from "../../services/transactionService";
import type { TransactionWithRefs } from "../../hooks";

// ─── Interactive multi-line chart ─────────────────────────────────────────────
interface ChartPoint {
  month: string;
  expense: number;
  income: number;
}

function SpendChart({ data, symbol }: { data: ChartPoint[]; symbol: string }) {
  const Colors = useColors();
  const { width: screenW } = useWindowDimensions();
  const W = screenW - 40;
  const H = 160;
  const PAD = { top: 24, bottom: 32, left: 36, right: 12 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const [tooltip, setTooltip] = useState<{ x: number; idx: number } | null>(
    null,
  );
  const svgRef = useRef<any>(null);

  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => Math.max(d.expense, d.income)), 1);
  const yMax = Math.ceil(maxVal / 1000) * 1000 || 1000;
  const yTicks = [0, yMax * 0.33, yMax * 0.66, yMax].map((v) => Math.round(v));

  const xPos = (i: number) => PAD.left + (i / (data.length - 1 || 1)) * chartW;
  const yPos = (v: number) => PAD.top + chartH - (v / yMax) * chartH;

  const smoothPath = (pts: [number, number][]) => {
    if (pts.length < 2) return "";
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cpx = (x0 + x1) / 2;
      d += ` C ${cpx} ${y0} ${cpx} ${y1} ${x1} ${y1}`;
    }
    return d;
  };

  const expPts = data.map((d, i): [number, number] => [
    xPos(i),
    yPos(d.expense),
  ]);
  const incPts = data.map((d, i): [number, number] => [
    xPos(i),
    yPos(d.income),
  ]);
  const expPath = smoothPath(expPts);
  const incPath = smoothPath(incPts);
  const expArea =
    expPath +
    ` L ${xPos(data.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`;
  const incArea =
    incPath +
    ` L ${xPos(data.length - 1)} ${PAD.top + chartH} L ${PAD.left} ${PAD.top + chartH} Z`;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => handleTouch(e.nativeEvent.locationX),
    onPanResponderMove: (e) => handleTouch(e.nativeEvent.locationX),
    onPanResponderRelease: () => setTooltip(null),
    onPanResponderTerminate: () => setTooltip(null),
  });

  const handleTouch = (lx: number) => {
    const relX = lx - PAD.left;
    const idx = Math.round((relX / chartW) * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setTooltip({ x: xPos(clamped), idx: clamped });
  };

  const ttIdx = tooltip?.idx ?? -1;
  const ttData = ttIdx >= 0 ? data[ttIdx] : null;
  const fmtY = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

  return (
    <Stack {...panResponder.panHandlers} overflow="hidden">
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs>
          <SvgGrad id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.expense} stopOpacity="0.18" />
            <Stop offset="1" stopColor={Colors.expense} stopOpacity="0" />
          </SvgGrad>
          <SvgGrad id="incGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={Colors.income} stopOpacity="0.15" />
            <Stop offset="1" stopColor={Colors.income} stopOpacity="0" />
          </SvgGrad>
        </Defs>

        {yTicks.map((v, i) => {
          const y = yPos(v);
          return (
            <React.Fragment key={i}>
              <Line
                x1={PAD.left}
                y1={y}
                x2={W - PAD.right}
                y2={y}
                stroke={Colors.border}
                strokeWidth="0.5"
                strokeDasharray={i === 0 ? "" : "3,3"}
                opacity={0.6}
              />
              <SvgText
                x={PAD.left - 4}
                y={y + 4}
                textAnchor="end"
                fontSize={9}
                fill={Colors.textMuted}
                fontWeight="500"
              >
                {fmtY(v)}
              </SvgText>
            </React.Fragment>
          );
        })}

        <Path d={expArea} fill="url(#expGrad)" />
        <Path d={incArea} fill="url(#incGrad)" />

        <Path
          d={expPath}
          stroke={Colors.expense}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={incPath}
          stroke={Colors.income}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />

        {data.map((d, i) => (
          <SvgText
            key={i}
            x={xPos(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize={10}
            fill={ttIdx === i ? Colors.textPrimary : Colors.textMuted}
            fontWeight={ttIdx === i ? "700" : "500"}
          >
            {d.month}
          </SvgText>
        ))}

        {tooltip && ttData && (
          <>
            <Line
              x1={tooltip.x}
              y1={PAD.top}
              x2={tooltip.x}
              y2={PAD.top + chartH}
              stroke={Colors.primary}
              strokeWidth="1"
              strokeDasharray="4,3"
              opacity="0.6"
            />
            <Circle
              cx={tooltip.x}
              cy={yPos(ttData.expense)}
              r={5}
              fill={Colors.bgCard}
              stroke={Colors.expense}
              strokeWidth="2.5"
            />
            <Circle
              cx={tooltip.x}
              cy={yPos(ttData.income)}
              r={5}
              fill={Colors.bgCard}
              stroke={Colors.income}
              strokeWidth="2.5"
            />
            {(() => {
              const bw = 62,
                bh = 22,
                br = 8;
              const bx = Math.min(
                Math.max(tooltip.x - bw / 2, PAD.left),
                W - PAD.right - bw,
              );
              const by = yPos(ttData.expense) - bh - 8;
              const label = formatCurrency(ttData.expense, symbol);
              return (
                <>
                  <Rect
                    x={bx}
                    y={by}
                    width={bw}
                    height={bh}
                    rx={br}
                    fill={Colors.expense}
                  />
                  <SvgText
                    x={bx + bw / 2}
                    y={by + bh / 2 + 4}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#fff"
                    fontWeight="700"
                  >
                    {label}
                  </SvgText>
                </>
              );
            })()}
          </>
        )}
      </Svg>
    </Stack>
  );
}

// ─── Header with chart ────────────────────────────────────────────────────────
// FIX: totalIncome + totalExpense passed from parent (live from useTransactions)
function HomeHeader({
  symbol,
  totalIncome,
  totalExpense,
}: {
  symbol: string;
  totalIncome: number;
  totalExpense: number;
}) {
  const Colors = useColors();
  const { totalBalance } = useAccounts();
  // FIX: dataVersion triggers chart reload on any transaction change
  const { selectedMonth, prevMonth, nextMonth, dataVersion } =
    useRecordsStore();
  const isNow =
    selectedMonth.getMonth() === new Date().getMonth() &&
    selectedMonth.getFullYear() === new Date().getFullYear();

  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  // FIX: depend on dataVersion so chart reloads when transactions change
  useEffect(() => {
    const months = Array.from({ length: 5 }, (_, i) =>
      subMonths(new Date(), 4 - i),
    );
    transactionService.getMonthlyTotals(months).then(setChartData);
  }, [dataVersion]);

  return (
    <Stack paddingHorizontal={20} paddingTop={12} paddingBottom={8}>
      {/* Top row — logo + month nav */}
      <Stack
        horizontal
        alignItems="center"
        justifyContent="space-between"
        marginBottom={16}
      >
        <Stack marginHorizontal={8} horizontal gap={8} alignItems="center" justifyContent="flex-start">
          <ClaroLogo size={32} variant="icon" />
          <Text variant="title"  color={Colors.textPrimary}>
            Claro
          </Text>
        </Stack>

        <Stack horizontal alignItems="center" gap={6}>
          <StyledPressable
            width={30}
            height={30}
            borderRadius={15}
            backgroundColor={Colors.bgMuted}
            alignItems="center"
            justifyContent="center"
            onPress={prevMonth}
          >
            <ChevronLeftIcon
              size={14}
              color={Colors.textMuted}
              strokeWidth={2.5}
            />
          </StyledPressable>
          <Text fontSize={13} fontWeight="700" color={Colors.primary}>
            {format(selectedMonth, "MMM yyyy")}
          </Text>
          <StyledPressable
            width={30}
            height={30}
            borderRadius={15}
            backgroundColor={Colors.bgMuted}
            alignItems="center"
            justifyContent="center"
            onPress={nextMonth}
            disabled={isNow}
          >
            <ChevronRightIcon
              size={14}
              color={isNow ? Colors.border : Colors.textMuted}
              strokeWidth={2.5}
            />
          </StyledPressable>
        </Stack>
      </Stack>

      {/* Main chart card */}
      <StyledCard
        borderRadius={24}
        padding={20}
        backgroundColor={Colors.bgCard}
        shadow="light"
      >
        {/* Total balance header */}
        <Stack marginBottom={4}>
          <Text fontSize={13} fontWeight="600" color={Colors.textMuted}>
            Total Balance
          </Text>
          <Text
             variant="amountSmall"
            fontSize={30}
            fontWeight="800"
            color={Colors.textPrimary}
            letterSpacing={-1}
            marginTop={2}
          >
            {formatCurrency(totalBalance, symbol)}
          </Text>
        </Stack>

        {/* Interactive chart */}
        <Stack alignItems="center" justifyContent="center">
          <SpendChart data={chartData} symbol={symbol} />
        </Stack>

        {/* Income + Expense summary row — FIX: values from live props */}
        <Stack horizontal gap={10} marginTop={4}>
          <Stack
            flex={1}
            paddingVertical={12}
            paddingHorizontal={14}
            borderRadius={16}
            backgroundColor={Colors.bg}
            gap={4}
          >
            <Stack
              horizontal
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize={12} fontWeight="600" color={Colors.textMuted}>
                Income
              </Text>
              <Text fontSize={13} color={Colors.income}>
                ↗
              </Text>
            </Stack>
            <Text
            
              fontSize={17}
              fontWeight="800"
              color={Colors.textPrimary}
              letterSpacing={-0.5}
            >
              {formatCurrency(totalIncome, symbol)}
            </Text>
          </Stack>
          <Stack
            flex={1}
            paddingVertical={12}
            paddingHorizontal={14}
            borderRadius={16}
            backgroundColor={Colors.bg}
            gap={4}
          >
            <Stack
              horizontal
              alignItems="center"
              justifyContent="space-between"
            >
              <Text fontSize={12} fontWeight="600" color={Colors.textMuted}>
                Expense
              </Text>
              <Text fontSize={13} color={Colors.expense}>
                ↘
              </Text>
            </Stack>
            <Text
              fontSize={17}
              fontWeight="800"
              color={Colors.textPrimary}
              letterSpacing={-0.5}
            >
              {formatCurrency(totalExpense, symbol)}
            </Text>
          </Stack>
        </Stack>
      </StyledCard>
    </Stack>
  );
}

// ─── Transaction row ──────────────────────────────────────────────────────────
function TransactionRow({
  tx,
  symbol,
  onDelete,
}: {
  tx: TransactionWithRefs;
  symbol: string;
  onDelete: (id: string) => void;
}) {
  const Colors = useColors();
  const isIncome = tx.type === "income";
  const isTransfer = tx.type === "transfer";
  const iconBg =
    tx.categoryColor ??
    (isIncome ? Colors.income : isTransfer ? Colors.transfer : Colors.expense);
  const amtColor = isIncome
    ? Colors.income
    : isTransfer
      ? Colors.transfer
      : Colors.expense;
  const prefix = isIncome ? "+" : isTransfer ? "" : "-";

  return (
    <SwipeableRow onDelete={() => onDelete(tx.id)}>
      <StyledPressable
        flexDirection="row"
        alignItems="center"
        paddingHorizontal={16}
        paddingVertical={14}
        backgroundColor={Colors.bgCard}
        onPress={() =>
          router.push({
            pathname: "/edit-transaction" as any,
            params: { id: tx.id },
          })
        }
      >
        <IconCircle
          iconKey={tx.categoryIcon ?? tx.type}
          bg={iconBg}
          size={46}
        />
        <Stack flex={1} gap={3} marginLeft={14}>
          <Text
            fontSize={15}
            fontWeight="700"
            color={Colors.textPrimary}
            numberOfLines={1}
          >
            {tx.categoryName ?? (isTransfer ? "Transfer" : "Uncategorized")}
          </Text>
          <Stack horizontal alignItems="center" gap={4}>
            {tx.accountName && (
              <Text fontSize={12} color={Colors.textMuted}>
                {tx.accountName}
              </Text>
            )}
            <Text fontSize={12} color={Colors.textMuted}>
              · {formatTime(new Date(tx.date))}
            </Text>
          </Stack>
        </Stack>
        <Text fontSize={15} fontWeight="700" color={amtColor}>
          {prefix}
          {formatCurrency(tx.amount, symbol)}
        </Text>
      </StyledPressable>
    </SwipeableRow>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function RecordsScreen() {
  const Colors = useColors();
  const { data: settingsData } = useSettings();
  const symbol = settingsData?.currencySymbol ?? "$";
  // FIX: destructure totalIncome + totalExpense for live tile values
  const {
    data,
    loading,
    error,
    refetch,
    totalIncome,
    totalExpense,
    grouped,
    remove,
  } = useTransactions();
  const { invalidateData } = useRecordsStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 600);
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, []),
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const ok = await dialogueService.confirm({
        title: "Delete transaction?",
        message: "This will also reverse the balance change on your account.",
        icon: "🗑️",
        confirmLabel: "Delete",
        destructive: true,
      });
      if (ok) {
        await remove(id);
        invalidateData();
        toastService.success("Transaction deleted");
      }
    },
    [remove, invalidateData],
  );

  const sections = Object.entries(grouped).map(([dateStr, txs]) => ({
    title: formatShortDate(new Date(dateStr)),
    data: txs,
  }));

  if (error) {
    return (
      <Stack flex={1} backgroundColor={Colors.bg}>
        <StyledEmptyState
          illustration="⚠️"
          title="Something went wrong"
          description={error}
          actions={[{ label: "Try again", onPress: refetch }]}
        />
      </Stack>
    );
  }

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <Stack flex={1}>
        {/* FIX: pass live totals into header */}
        <HomeHeader
          symbol={symbol}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />

        <Stack
          horizontal
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal={20}
          paddingTop={8}
          marginHorizontal={8}
        >
          <Text
          variant="label"
            fontSize={17}
            fontWeight="800"
            color={Colors.textMuted}
           
          >
            Transactions
          </Text>
          <StyledPressable
            onPress={() => router.push("/all-transactions" as any)}
          >
            <Text fontSize={13} fontWeight="600" color={Colors.primary}>
              See All →
            </Text>
          </StyledPressable>
        </Stack>

        {loading && !refreshing ? (
          <Stack paddingHorizontal={16}>
            <StyledSkeleton
              template="list-item"
              repeat={5}
              animation="shimmer"
            />
          </Stack>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.primary}
              />
            }
            renderSectionHeader={({ section: { title } }) => (
              <Stack
                backgroundColor={Colors.bg}
                paddingHorizontal={20}
                paddingTop={16}
                paddingBottom={6}
              >
                <Text
                  fontSize={11}
                  fontWeight="700"
                  color={Colors.textMuted}
                  letterSpacing={1.2}
                >
                  {title.toUpperCase()}
                </Text>
              </Stack>
            )}
            renderItem={({ item, index, section }) => {
              const isFirst = index === 0;
              const isLast = index === section.data.length - 1;
              return (
                <StyledCard
                  marginHorizontal={16}
                  backgroundColor={Colors.bgCard}
                  borderRadius={0}
                  borderTopLeftRadius={isFirst ? 18 : 0}
                  borderTopRightRadius={isFirst ? 18 : 0}
                  borderBottomLeftRadius={isLast ? 18 : 0}
                  borderBottomRightRadius={isLast ? 18 : 0}
                  overflow="hidden"
                  style={
                    isFirst
                      ? {
                          shadowColor: "#000",
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 2,
                        }
                      : {}
                  }
                >
                  <TransactionRow
                    tx={item}
                    symbol={symbol}
                    onDelete={handleDelete}
                  />
                </StyledCard>
              );
            }}
            ItemSeparatorComponent={() => (
              <StyledDivider
                borderBottomColor={Colors.border}
                marginLeft={80}
                marginHorizontal={16}
                opacity={0.6}
              />
            )}
            ListEmptyComponent={
              <StyledEmptyState
                variant="minimal"
                illustration="📭"
                title="No transactions"
                description="Tap + to add your first transaction"
                animated
              />
            }
          />
        )}

        <StyledPressable
          position="absolute"
          right={20}
          bottom={100}
          width={58}
          height={58}
          borderRadius={29}
          backgroundColor={Colors.primary}
          alignItems="center"
          justifyContent="center"
          onPress={() => router.push("/add-transaction" as any)}
          style={{
            shadowColor: Colors.primaryDark,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <AddIcon size={26} color="#fff" strokeWidth={2.5} />
        </StyledPressable>
      </Stack>
    </StyledPage>
  );
}
