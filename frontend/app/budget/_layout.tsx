import { Stack } from "expo-router";
import { BudgetDraftProvider } from "@/features/Budget/context/BudgetDraftContext";

export default function BudgetLayout() {
  return (
    <BudgetDraftProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ai-setup" />
        <Stack.Screen name="total" />
        <Stack.Screen name="fixed-expense" />
        <Stack.Screen name="select-category" />
        <Stack.Screen name="category-budget" />
        <Stack.Screen name="summary" />
      </Stack>
    </BudgetDraftProvider>
  );
}
