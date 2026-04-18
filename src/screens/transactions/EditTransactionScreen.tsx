import React, { useState, useCallback, useEffect } from "react";
import { Keyboard } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  Stack,
  StyledText,
  StyledPressable,
  StyledTextInput,
  StyledDivider,
  StyledDatePicker,
  Popup,
  TabBar,
  StyledPage,
  StyledScrollView,
  StyledHeader,
} from "fluent-styles";
import { format } from "date-fns";
import { CalendarIcon } from "../../icons";
import { IconCircle } from "../../icons/map";
import { Colors, useColors } from "../../constants";
import { dialogueService, toastService, loaderService } from "fluent-styles";
import { ModalHeader } from "../../components";
import {
  useTransactions,
  useAccounts,
  useCategories,
  useSettings,
} from "../../hooks";
import { useRecordsStore } from "../../stores";
import { transactionService } from "../../services/transactionService";
import { Calculator } from "./Calculator";
import { AccountPicker } from "./AccountPicker";
import { CategoryPicker } from "./CategoryPicker";
import type { TransactionWithRefs } from "../../hooks";

type TxType = "expense" | "income" | "transfer";

const TYPE_TABS = [
  { value: "expense" as TxType, label: "Expense" },
  { value: "income" as TxType, label: "Income" },
  { value: "transfer" as TxType, label: "Transfer" },
];

export default function EditTransactionScreen() {
  const Colors = useColors();

  const TYPE_COLORS: Record<TxType, string> = {
    expense: Colors.expense,
    income: Colors.income,
    transfer: Colors.transfer,
  };
  const TYPE_BG: Record<TxType, string> = {
    expense: Colors.expenseLight,
    income: Colors.incomeLight,
    transfer: Colors.transferLight,
  };

  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: settingsData } = useSettings();
  const { update, remove } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: expenseCategories } = useCategories("expense");
  const { data: incomeCategories } = useCategories("income");
  const { invalidateData } = useRecordsStore();

  const symbol = settingsData?.currencySymbol ?? "$";

  // ─── Load existing transaction ────────────────────────────────────────────
  const [loaded, setLoaded] = useState(false);
  const [txType, setTxType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("0");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [toAccountId, setToAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");
  const [showAccount, setShowAccount] = useState(false);
  const [showToAccount, setShowToAccount] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showDate, setShowDate] = useState(false);

  useEffect(() => {
    if (!id) return;
    transactionService.getById(id).then((tx) => {
      if (!tx) {
        toastService.error("Not found", "Transaction not found");
        router.back();
        return;
      }
      setTxType(tx.type as TxType);
      setAmount(String(tx.amount));
      setAccountId(tx.accountId);
      setToAccountId(tx.toAccountId ?? null);
      setCategoryId(tx.categoryId ?? null);
      setDate(new Date(tx.date));
      setNotes(tx.notes ?? "");
      setLoaded(true);
    });
  }, [id]);

  // ─── Derived ──────────────────────────────────────────────────────────────
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const selectedToAccount = accounts.find((a) => a.id === toAccountId);
  const allCategories = [...expenseCategories, ...incomeCategories];
  const selectedCategory = allCategories.find((c) => c.id === categoryId);
  const accentColor = TYPE_COLORS[txType];
  const bgColor = TYPE_BG[txType];

  const handleTypeChange = (type: TxType) => {
    setTxType(type);
    setCategoryId(null);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      toastService.error("Invalid amount", "Enter an amount greater than 0");
      return;
    }
    if (!accountId) {
      toastService.error("No account", "Please select an account");
      return;
    }
    if (txType === "transfer" && !toAccountId) {
      toastService.error("No destination", "Select a destination account");
      return;
    }

    Keyboard.dismiss();
    const loadId = loaderService.show({ label: "Saving…", variant: "spinner" });
    try {
      await update(id!, {
        type: txType,
        amount: num,
        date,
        notes: notes.trim() || null,
        accountId: accountId!,
        categoryId: categoryId ?? null,
        toAccountId: txType === "transfer" ? (toAccountId ?? null) : null,
      });
      invalidateData();
      toastService.success("Transaction updated");
      router.back();
    } catch (err: any) {
      toastService.error("Failed to save", err?.message);
    } finally {
      loaderService.hide(loadId);
    }
  }, [
    amount,
    accountId,
    toAccountId,
    txType,
    date,
    notes,
    categoryId,
    update,
    id,
    invalidateData,
  ]);

  if (!loaded) {
    return (
      <Stack
        flex={1}
        backgroundColor={Colors.bg}
        alignItems="center"
        justifyContent="center"
      >
        <StyledText color={Colors.textMuted}>Loading…</StyledText>
      </Stack>
    );
  }

  return (
    <StyledPage flex={1} backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        <ModalHeader
          title="Edit Transaction"
          onClose={() => router.back()}
          onSave={handleSave}
          saveColor={accentColor}
        />
      </StyledHeader.Full>
      <StyledScrollView showsVerticalScrollIndicator={false}>
        <Stack flex={1}>
          <Stack
            paddingTop={8}
            paddingHorizontal={20}
            paddingBottom={12}
            backgroundColor={bgColor}
          >
            <TabBar
              options={TYPE_TABS}
              value={txType}
              onChange={handleTypeChange}
              indicator="pill"
              colors={{
                background: Colors.bgCard + "66",
                activeText: accentColor,
                indicator: Colors.bgCard,
                text: Colors.textMuted,
              }}
            />
          </Stack>

          {/* Calculator */}
          <Stack backgroundColor={bgColor}>
            <Calculator value={amount} onChange={setAmount} symbol={symbol} />
          </Stack>

          <StyledDivider borderBottomColor={Colors.border} />

          {/* Fields */}
          <Stack flex={1} paddingHorizontal={20} paddingTop={8}>
            {/* Account */}
            <StyledPressable
              flexDirection="row"
              alignItems="center"
              gap={8}
              paddingVertical={14}
              onPress={() => setShowAccount(true)}
            >
              <StyledText fontSize={18} width={28} textAlign="center">
                💳
              </StyledText>
              <StyledText
                flex={1}
                fontSize={15}
                fontWeight="600"
                color={Colors.textSecondary}
              >
                Account
              </StyledText>
              {selectedAccount ? (
                <Stack horizontal alignItems="center" gap={8}>
                  <IconCircle
                    iconKey={selectedAccount.icon}
                    bg={selectedAccount.color}
                    size={28}
                    type="account"
                  />
                  <StyledText
                    fontSize={14}
                    fontWeight="700"
                    color={Colors.textPrimary}
                  >
                    {selectedAccount.name}
                  </StyledText>
                </Stack>
              ) : (
                <StyledText
                  fontSize={14}
                  color={Colors.primary}
                  fontWeight="600"
                >
                  Select →
                </StyledText>
              )}
            </StyledPressable>
            <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />

            {/* To Account (transfer) */}
            {txType === "transfer" && (
              <>
                <StyledPressable
                  flexDirection="row"
                  alignItems="center"
                  gap={8}
                  paddingVertical={14}
                  onPress={() => setShowToAccount(true)}
                >
                  <StyledText fontSize={18} width={28} textAlign="center">
                    🔄
                  </StyledText>
                  <StyledText
                    flex={1}
                    fontSize={15}
                    fontWeight="600"
                    color={Colors.textSecondary}
                  >
                    To Account
                  </StyledText>
                  {selectedToAccount ? (
                    <Stack horizontal alignItems="center" gap={8}>
                      <IconCircle
                        iconKey={selectedToAccount.icon}
                        bg={selectedToAccount.color}
                        size={28}
                        type="account"
                      />
                      <StyledText
                        fontSize={14}
                        fontWeight="700"
                        color={Colors.textPrimary}
                      >
                        {selectedToAccount.name}
                      </StyledText>
                    </Stack>
                  ) : (
                    <StyledText
                      fontSize={14}
                      color={Colors.primary}
                      fontWeight="600"
                    >
                      Select →
                    </StyledText>
                  )}
                </StyledPressable>
                <StyledDivider
                  borderBottomColor={Colors.border}
                  marginLeft={42}
                />
              </>
            )}

            {/* Category */}
            {txType !== "transfer" && (
              <>
                <StyledPressable
                  flexDirection="row"
                  alignItems="center"
                  gap={8}
                  paddingVertical={14}
                  onPress={() => setShowCategory(true)}
                >
                  <StyledText fontSize={18} width={28} textAlign="center">
                    🏷️
                  </StyledText>
                  <StyledText
                    flex={1}
                    fontSize={15}
                    fontWeight="600"
                    color={Colors.textSecondary}
                  >
                    Category
                  </StyledText>
                  {selectedCategory ? (
                    <Stack horizontal alignItems="center" gap={8}>
                      <IconCircle
                        iconKey={selectedCategory.icon}
                        bg={selectedCategory.color}
                        size={28}
                      />
                      <StyledText
                        fontSize={14}
                        fontWeight="700"
                        color={Colors.textPrimary}
                      >
                        {selectedCategory.name}
                      </StyledText>
                    </Stack>
                  ) : (
                    <StyledText
                      fontSize={14}
                      color={Colors.primary}
                      fontWeight="600"
                    >
                      Select →
                    </StyledText>
                  )}
                </StyledPressable>
                <StyledDivider
                  borderBottomColor={Colors.border}
                  marginLeft={42}
                />
              </>
            )}

            {/* Date */}
            <StyledPressable
              flexDirection="row"
              alignItems="center"
              gap={14}
              paddingVertical={14}
              onPress={() => setShowDate(true)}
            >
              <CalendarIcon size={20} color={Colors.textSecondary} />
              <StyledText
                flex={1}
                fontSize={15}
                fontWeight="600"
                color={Colors.textSecondary}
              >
                Date
              </StyledText>
              <StyledText
                fontSize={14}
                fontWeight="700"
                color={Colors.textPrimary}
              >
                {format(date, "MMM d, yyyy")}
              </StyledText>
            </StyledPressable>
            <StyledDivider borderBottomColor={Colors.border} marginLeft={42} />

            {/* Notes */}
            <Stack
              flexDirection="row"
              alignItems="flex-start"
              gap={8}
              paddingVertical={8}
            >
              <StyledText
                fontSize={18}
                width={28}
                textAlign="center"
                marginTop={8}
              >
                📝
              </StyledText>
              <StyledTextInput
                flex={1}
                placeholder="Add notes..."
                value={notes}
                onChangeText={setNotes}
                variant="ghost"
                multiline
                numberOfLines={2}
                placeholderTextColor={Colors.textMuted}
                fontSize={15}
                color={Colors.textPrimary}
              />
            </Stack>
          </Stack>

          {/* Date popup */}
          <Popup
            visible={showDate}
            onClose={() => setShowDate(false)}
            title="Select date"
            showClose
            position="bottom"
            round
          >
            <Stack paddingHorizontal={16} paddingBottom={24}>
              <StyledDatePicker
                mode="date"
                variant="inline"
                value={date}
                onChange={setDate}
                showTodayButton
                colors={{
                  selected: accentColor,
                  today: accentColor,
                  confirmBg: accentColor,
                }}
              />
              <StyledPressable
                paddingVertical={14}
                borderRadius={12}
                backgroundColor={accentColor}
                alignItems="center"
                marginTop={8}
                onPress={() => setShowDate(false)}
              >
                <StyledText fontSize={15} fontWeight="700" color={Colors.white}>
                  Set date
                </StyledText>
              </StyledPressable>
            </Stack>
          </Popup>

          {/* Pickers */}
          <AccountPicker
            visible={showAccount}
            accounts={accounts}
            selected={accountId}
            onSelect={(a) => setAccountId(a.id)}
            onClose={() => setShowAccount(false)}
          />
          <AccountPicker
            visible={showToAccount}
            accounts={accounts.filter((a) => a.id !== accountId)}
            selected={toAccountId}
            onSelect={(a) => setToAccountId(a.id)}
            onClose={() => setShowToAccount(false)}
          />
          <CategoryPicker
            visible={showCategory}
            expenseCategories={expenseCategories}
            incomeCategories={incomeCategories}
            selected={categoryId}
            transactionType={txType === "transfer" ? "expense" : txType}
            onSelect={(c) => setCategoryId(c.id)}
            onClose={() => setShowCategory(false)}
          />
        </Stack>
      </StyledScrollView>
    </StyledPage>
  );
}
