import React from "react";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Stack,
  StyledPressable,
  StyledScrollView,
  StyledSkeleton,
  StyledEmptyState,
  StyledPage,
  StyledCard,
  StyledDivider,
} from "fluent-styles";
import { dialogueService, toastService } from "fluent-styles";
import Svg, { Circle } from "react-native-svg";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { IconCircle } from "../../icons/map";
import { useColors } from "../../constants";
import { usePremium } from "../../hooks/usePremium";
import { PremiumBanner } from "../premium/PremiumGate";
import { useBudgets, useSettings } from "../../hooks";
import { useRecordsStore } from "../../stores";
import { formatCurrency } from "../../utils";
import { SwipeableRow, Text } from "../../components";
import { useWindowDimensions } from "react-native";

// ─── Donut ring ───────────────────────────────────────────────────────────────
function DonutRing({
  spent,
  total,
  size = 72,
  color,
  trackColor,
}: {
  spent: number;
  total: number;
  size?: number;
  color: string;
  trackColor: string;
}) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(spent / total, 1) : 0;
  const dash = pct * circ;
  const cx = size / 2,
    cy = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
        strokeWidth={7}
        fill="none"
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={7}
        fill="none"
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        rotation={-90}
        origin={`${cx}, ${cy}`}
      />
    </Svg>
  );
}

function RowDivider() {
  const Colors = useColors()
  const width = useWindowDimensions().width
  return <Stack horizontal width={width - 66-16} height={1} flex={1} backgroundColor={Colors.border} marginLeft={66} opacity={0.6} />
}

// ─── Budget row ───────────────────────────────────────────────────────────────
function BudgetRow({
  b,
  symbol,
  onPress,
  onDelete,
  isLast,
}: {
  b: any;
  symbol: string;
  onPress: () => void;
  onDelete: () => void;
  isLast: boolean;
}) {
  const Colors = useColors();
  const pct =
    b.limitAmount > 0 ? Math.min((b.spent / b.limitAmount) * 100, 100) : 0;
  const isOver = b.remaining < 0;
  const isWarn = !isOver && pct >= 80;
  const barColor = isOver
    ? Colors.expense
    : isWarn
      ? Colors.warning
      : Colors.primary;

  return (
    <Stack>
      <SwipeableRow onDelete={onDelete}>
        <StyledPressable
          flexDirection="row"
          alignItems="center"
          gap={14}
          paddingHorizontal={16}
          paddingVertical={14}
          backgroundColor={Colors.bgCard}
          onPress={onPress}
        >
          <IconCircle iconKey={b.categoryIcon} bg={b.categoryColor} size={44} />
          <Stack flex={1} gap={6}>
            <Stack
              horizontal
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize={14} fontWeight="700" color={Colors.textPrimary}>
                {b.categoryName}
              </Text>
              <Text fontSize={13} fontWeight="700" color={Colors.textPrimary}>
                {formatCurrency(b.spent, symbol)}
                <Text fontSize={12} fontWeight="500" color={Colors.textMuted}>
                  {" "}
                  / {formatCurrency(b.limitAmount, symbol)}
                </Text>
              </Text>
            </Stack>
            <Stack
              height={3}
              borderRadius={3}
              backgroundColor={Colors.border}
              overflow="hidden"
            >
              <Stack
                height={3}
                borderRadius={3}
                width={`${pct}%` as any}
                backgroundColor={barColor}
              />
            </Stack>
            <Text
            variant="caption"
              fontSize={11}
              fontWeight="500"
              color={
                isOver
                  ? Colors.expense
                  : isWarn
                    ? Colors.warning
                    : Colors.textMuted
              }
            >
              {isOver
                ? `${formatCurrency(Math.abs(b.remaining), symbol)} over budget`
                : `${formatCurrency(b.remaining, symbol)} remaining`}
            </Text>
          </Stack>
        </StyledPressable>
      </SwipeableRow>
      {!isLast && (
        <RowDivider
        />
      )}
    </Stack>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BudgetsScreen() {
  const Colors = useColors();
  const premium = usePremium();
  const { data: settingsData } = useSettings();
  const symbol = settingsData?.currencySymbol ?? "$";
  const { selectedMonth, prevMonth, nextMonth, invalidateData } =
    useRecordsStore();
  const {
    data,
    loading,
    remove,
    totalBudget,
    totalSpent,
    unbudgetedCategories,
  } = useBudgets();

  const overallPct =
    totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalSpent > totalBudget && totalBudget > 0;
  const remaining = totalBudget - totalSpent;

  const handleDeleteBudget = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title: `Remove budget for "${name}"?`,
      message: "The budget limit will be removed for this month.",
      icon: "🗑️",
      confirmLabel: "Remove",
      destructive: true,
    });
    if (ok) {
      await remove(id);
      invalidateData();
      toastService.success("Budget removed");
    }
  };

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack flex={1}>
          {/* Header */}
          <Stack paddingHorizontal={20} paddingBottom={4}>
            <Text
              variant="title"
              fontWeight="700"
              color={Colors.textPrimary}
              letterSpacing={-0.5}
            >
              Budgets
            </Text>
          </Stack>

          {/* Month navigator */}
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
              <ChevronLeftIcon
                size={20}
                color={Colors.primary}
                strokeWidth={2.2}
              />
            </StyledPressable>
            <Text variant="label" fontSize={16} color={Colors.primary}>
              {format(selectedMonth, "MMMM, yyyy")}
            </Text>
            <StyledPressable
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor={Colors.accent}
              alignItems="center"
              justifyContent="center"
              onPress={nextMonth}
            >
              <ChevronRightIcon
                size={20}
                color={Colors.primary}
                strokeWidth={2.2}
              />
            </StyledPressable>
          </Stack>

          {loading ? (
            <Stack padding={16}>
              <StyledSkeleton
                template="list-item"
                repeat={4}
                animation="shimmer"
              />
            </Stack>
          ) : (
            <StyledScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
              {/* Hero summary card */}
              {totalBudget > 0 && (
                <StyledCard
                  marginHorizontal={16}
                  marginBottom={16}
                  borderRadius={22}
                  padding={20}
               
                  backgroundColor={Colors.bgCard}
                >
                  <Stack horizontal alignItems="center" gap={20}>
                    {/* Donut */}
                    <Stack
                      width={72}
                      height={72}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <DonutRing
                        spent={totalSpent}
                        total={totalBudget}
                        size={72}
                        color={isOverBudget ? Colors.expense : Colors.primary}
                        trackColor={Colors.border}
                      />
                      <Stack position="absolute" alignItems="center">
                        <Text
                          fontSize={12}
                          fontWeight="800"
                          color={isOverBudget ? Colors.expense : Colors.primary}
                        >
                          {Math.round(overallPct)}%
                        </Text>
                      </Stack>
                    </Stack>
                    {/* Stats */}
                    <Stack flex={1} gap={8}>
                      <Stack horizontal justifyContent="space-between">
                        <Stack>
                          <Text
                            variant="overline"
                            color={Colors.textMuted}
                            letterSpacing={0.3}
                          >
                            SPENT
                          </Text>
                          <Text
                            fontSize={20}
                            fontWeight="800"
                            letterSpacing={-0.5}
                            color={
                              isOverBudget ? Colors.expense : Colors.textPrimary
                            }
                          >
                            {formatCurrency(totalSpent, symbol)}
                          </Text>
                        </Stack>
                        <Stack alignItems="flex-end">
                          <Text
                            variant="overline"
                            color={Colors.textMuted}
                            letterSpacing={0.3}
                          >
                            BUDGET
                          </Text>
                          <Text
                            fontSize={20}
                            fontWeight="800"
                            color={Colors.textPrimary}
                            letterSpacing={-0.5}
                          >
                            {formatCurrency(totalBudget, symbol)}
                          </Text>
                        </Stack>
                      </Stack>
                      <Stack
                        height={5}
                        borderRadius={3}
                        backgroundColor={Colors.border}
                        overflow="hidden"
                      >
                        <Stack
                          height={5}
                          borderRadius={3}
                          width={`${overallPct}%` as any}
                          backgroundColor={
                            isOverBudget ? Colors.expense : Colors.primary
                          }
                        />
                      </Stack>
                      <Stack
                        horizontal
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Text
                          fontSize={12}
                          fontWeight="600"
                          color={
                            isOverBudget ? Colors.expense : Colors.textMuted
                          }
                        >
                          {isOverBudget
                            ? `${formatCurrency(Math.abs(remaining), symbol)} over`
                            : `${formatCurrency(remaining, symbol)} left`}
                        </Text>
                        <Stack
                          paddingHorizontal={10}
                          paddingVertical={3}
                          borderRadius={10}
                          backgroundColor={
                            isOverBudget
                              ? Colors.expenseLight
                              : overallPct >= 80
                                ? Colors.expenseLight
                                : Colors.incomeLight
                          }
                        >
                          <Text
                            fontSize={11}
                            fontWeight="700"
                            color={
                              isOverBudget
                                ? Colors.expense
                                : overallPct >= 80
                                  ? Colors.warning
                                  : Colors.income
                            }
                          >
                            {isOverBudget
                              ? "Over budget"
                              : overallPct >= 80
                                ? "Near limit"
                                : "On track ✓"}
                          </Text>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </StyledCard>
              )}

              {/* Budgeted categories */}
              {data.length > 0 && (
                <Stack marginHorizontal={16} marginBottom={16}>
                  <Stack
                    horizontal
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={10}
                  >
                    <Text fontSize={15} fontWeight="800" color={Colors.primary}>
                      Budgeted · {format(selectedMonth, "MMM yyyy")}
                    </Text>
                    <Text variant="bodySmall" color={Colors.textMuted}>
                      {data.length}{" "}
                      {data.length === 1 ? "category" : "categories"}
                    </Text>
                  </Stack>
                  <StyledCard
                    borderRadius={18}
                    backgroundColor={Colors.bgCard}
                    shadow="light"
                    overflow="hidden"
                  >
                    {data.map((b, i) => (
                      <BudgetRow
                        key={b.id}
                        b={b}
                        symbol={symbol}
                        isLast={i === data.length - 1}
                        onDelete={() =>
                          handleDeleteBudget(b.id, b.categoryName)
                        }
                        onPress={() =>
                          router.push({
                            pathname: "/set-budget" as any,
                            params: {
                              categoryId: b.categoryId,
                              categoryName: b.categoryName,
                              categoryIcon: b.categoryIcon,
                              categoryColor: b.categoryColor,
                              budgetId: b.id,
                              currentLimit: String(b.limitAmount),
                            },
                          })
                        }
                      />
                    ))}
                  </StyledCard>
                </Stack>
              )}

              {/* Premium banner */}
              {!premium.isPremium && (
                <PremiumBanner
                  message={`Free: ${premium.limits.BUDGETS} budget per month`}
                  subtext={
                    premium.canAddBudget((data ?? []).length)
                      ? "Upgrade for unlimited budgets"
                      : "Upgrade to add more budgets this month"
                  }
                />
              )}

              {/* Unbudgeted categories */}
              {unbudgetedCategories.length > 0 && (
                <Stack marginHorizontal={16} marginBottom={16}>
                  <Stack
                    horizontal
                    alignItems="center"
                    justifyContent="space-between"
                    marginBottom={10}
                  >
                    <Text
                      fontSize={15}
                      fontWeight="800"
                      color={Colors.textPrimary}
                    >
                      Not budgeted
                    </Text>
                    <Text variant="bodySmall" color={Colors.textMuted}>
                      Set limits
                    </Text>
                  </Stack>
                  <StyledCard
                    borderRadius={18}
                    backgroundColor={Colors.bgCard}
                    shadow="light"
                    overflow="hidden"
                  >
                    {unbudgetedCategories.map((cat, i) => (
                      <Stack key={cat.id}>
                        <Stack
                          horizontal
                          alignItems="center"
                          paddingHorizontal={16}
                          paddingVertical={13}
                          gap={14}
                        >
                          <IconCircle
                            iconKey={cat.icon}
                            bg={cat.color}
                            size={42}
                          />
                          <Text
                            flex={1}
                            fontSize={14}
                            fontWeight="600"
                            color={Colors.textPrimary}
                          >
                            {cat.name}
                          </Text>
                          <StyledPressable
                            paddingHorizontal={14}
                            paddingVertical={7}
                            borderRadius={10}
                            backgroundColor={
                              premium.canAddBudget((data ?? []).length)
                                ? Colors.accent
                                : Colors.bgMuted
                            }
                            onPress={() =>
                              premium.canAddBudget((data ?? []).length)
                                ? router.push({
                                    pathname: "/set-budget" as any,
                                    params: {
                                      categoryId: cat.id,
                                      categoryName: cat.name,
                                      categoryIcon: cat.icon,
                                      categoryColor: cat.color,
                                    },
                                  })
                                : router.push("/premium" as any)
                            }
                          >
                            <Text
                              fontSize={11}
                              fontWeight="700"
                              color={
                                premium.canAddBudget((data ?? []).length)
                                  ? Colors.primary
                                  : Colors.textMuted
                              }
                            >
                              {premium.canAddBudget((data ?? []).length)
                                ? "+ Set Budget"
                                : "🔒 Premium"}
                            </Text>
                          </StyledPressable>
                        </Stack>
                        {i < unbudgetedCategories.length - 1 && (
                          <StyledDivider
                            borderBottomColor={Colors.border}
                            marginLeft={72}
                            opacity={0.6}
                          />
                        )}
                      </Stack>
                    ))}
                  </StyledCard>
                </Stack>
              )}

              {data.length === 0 && unbudgetedCategories.length === 0 && (
                <StyledEmptyState
                  variant="minimal"
                  illustration="💰"
                  title="No budgets yet"
                  description="Add categories to start tracking your spending limits"
                  animated
                />
              )}
            </StyledScrollView>
          )}
        </Stack>
      </GestureHandlerRootView>
    </StyledPage>
  );
}
