import React from "react";
import ContractsClient from "./client";

export default function ContractsPage() {
  const contracts = [
    { name: "Launchpad Factory", id: process.env.NEXT_PUBLIC_LAUNCHPAD_CONTRACT },
    { name: "Prediction Market", id: process.env.NEXT_PUBLIC_PREDICTION_MARKET_CONTRACT },
    { name: "Campaign Pool", id: process.env.NEXT_PUBLIC_CAMPAIGN_CONTRACT },
    { name: "Social Competition", id: process.env.NEXT_PUBLIC_COMPETITION_CONTRACT },
    { name: "Smart Wallet", id: process.env.NEXT_PUBLIC_SMART_WALLET_CONTRACT },
  ].filter(c => c.id) as { name: string, id: string }[];

  return <ContractsClient initialContracts={contracts} />;
}
