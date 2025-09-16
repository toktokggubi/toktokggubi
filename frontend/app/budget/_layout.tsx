import { Stack } from "expo-router";

export default function BudgetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="total" />
      <Stack.Screen name="fixed-expense" />
      <Stack.Screen name="select-category" />
      <Stack.Screen name="category-budget" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
