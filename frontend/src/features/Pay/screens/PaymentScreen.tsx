import React, { useState } from "react";
import PaymentTemplate from "../templates/PaymentTemplate";
import { getUserCards } from "@/features/User/api/cardService";
import type { UserCard } from "@/features/User/screens/MyPageScreen/types";

export default function PaymentScreen() {
  const [tab, setTab] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  
  
  const cards: UserCard[] = getUserCards();

  return (
    <PaymentTemplate 
      selectedTab={tab} 
      onChangeTab={setTab}
      cards={cards}
      activeCardIndex={activeCardIndex}
      onActiveCardChange={setActiveCardIndex}
    />
  );
}
