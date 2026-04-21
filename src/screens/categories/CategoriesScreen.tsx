import React, { useState } from "react";
import { FlatList } from "react-native";
import { router } from "expo-router";
import {
  Stack,
  StyledPressable,
  StyledDivider,
  StyledEmptyState,
  StyledSkeleton,
  TabBar,
  StyledPage,
  StyledHeader,
  StyledCard,
  StyleShape,
} from "fluent-styles";
import { dialogueService, toastService } from "fluent-styles";
import { IconCircle } from "../../icons/map";
import { AddIcon, ChevronLeftIcon, DeleteIcon } from "../../icons";
import { Text } from "../../components";
import { Colors, useColors } from "../../constants";
import { useCategories } from "../../hooks";
import type { Category } from "../../db/schema";
import { RowDivider } from "@/components";

type CatType = "expense" | "income";
const TABS = [
  { value: "expense" as CatType, label: "Expense" },
  { value: "income" as CatType, label: "Income" },
];

export default function CategoriesScreen() {
  const Colors = useColors();
  const [type, setType] = useState<CatType>("expense");
  const { data: cats, loading, remove } = useCategories(type);

  const handleDelete = async (id: string, name: string) => {
    const ok = await dialogueService.confirm({
      title: `Delete "${name}"?`,
      message: "Transactions using this category will become uncategorized.",
      icon: "🗑️",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await remove(id);
      toastService.success("Category deleted");
    }
  };

  return (
    <StyledPage backgroundColor={Colors.bg}>
      <StyledHeader.Full>
        {/* Header */}
        <Stack
          backgroundColor={Colors.bg}
          paddingHorizontal={20}
          paddingBottom={14}
        >
          <Stack horizontal alignItems="center" justifyContent="space-between">
            <StyledPressable
              width={38}
              height={38}
              borderRadius={19}
              backgroundColor={Colors.bgCard}
              alignItems="center"
              justifyContent="center"
              onPress={() => router.navigate("/(tabs)/settings")}
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <ChevronLeftIcon
                size={18}
                color={Colors.textPrimary}
                strokeWidth={2.5}
              />
            </StyledPressable>
            <Text
              variant="title"
              fontSize={17}
              fontWeight="800"
              color={Colors.textPrimary}
              letterSpacing={-0.3}
            >
              Categories
            </Text>
            <Stack width={38} />
          </Stack>
        </Stack>
      </StyledHeader.Full>

      <TabBar
        options={TABS}
        value={type}
        onChange={setType}
        indicator="line"
        showBorder
        colors={{
          background: Colors.bg,
          activeText: Colors.primary,
          indicator: Colors.primary,
          text: Colors.textMuted,
          border: Colors.border,
        }}
      />

      {loading ? (
        <Stack padding={16}>
          <StyledSkeleton template="list-item" repeat={8} animation="shimmer" />
        </Stack>
      ) : (
        <StyledCard
          borderRadius={18}
          backgroundColor={Colors.bgCard}
          shadow="light"
          marginHorizontal={16}
          marginVertical={16}
          overflow="hidden"
        >
          <FlatList
            data={cats}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item, index }) => (
              <Stack>
                <StyledPressable
                  flexDirection="row"
                  alignItems="center"
                  paddingHorizontal={20}
                  paddingVertical={12}
                  backgroundColor={Colors.bgCard}
                  onPress={() =>
                    router.push({
                      pathname: "/add-category" as any,
                      params: {
                        id: item.id,
                        name: item.name,
                        icon: item.icon,
                        color: item.color,
                        type: item.type,
                      },
                    })
                  }
                >
                  <IconCircle iconKey={item.icon} bg={item.color} size={44} />
                  <Text
                    flex={1}
                    fontSize={14}
                    fontWeight="700"
                    color={Colors.textPrimary}
                    marginLeft={14}
                  >
                    {item.name}
                  </Text>
                  {/* Delete button directly on row — no nested dialogue */}
                  <StyledPressable
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <StyleShape size={48} backgroundColor={Colors.bg} cycle>
                      <DeleteIcon
                        size={18}
                        color={Colors.textMuted}
                        strokeWidth={2}
                      />
                    </StyleShape>
                  </StyledPressable>
                </StyledPressable>
                {index < cats.length - 1 && <RowDivider />}
              </Stack>
            )}
            ListEmptyComponent={
              <StyledEmptyState
                variant="minimal"
                illustration="🏷️"
                title="No categories"
                animated
              />
            }
            ListFooterComponent={
              <StyledPressable
                flexDirection="row"
                alignItems="center"
                justifyContent="center"
                gap={10}
                marginHorizontal={20}
                marginTop={16}
                paddingVertical={16}
                borderRadius={12}
                borderWidth={1}
                borderColor={Colors.primary}
                onPress={() =>
                  router.push({
                    pathname: "/add-category" as any,
                    params: { type },
                  })
                }
              >
                <AddIcon size={18} color={Colors.primary} strokeWidth={2.5} />
                <Text fontSize={14} fontWeight="700" color={Colors.primary}>
                  ADD NEW CATEGORY
                </Text>
              </StyledPressable>
            }
          />
        </StyledCard>
      )}
    </StyledPage>
  );
}
