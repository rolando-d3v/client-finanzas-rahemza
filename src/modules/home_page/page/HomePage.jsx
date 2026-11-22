import React from "react";
import Hero from "../components/Hero/Hero";
import ScrollScrubVideo from "../components/video/Video";
import FinancesSection from "../components/FinancesSection/FinancesSection";
import InventorySection from "../components/InventorySection/InventorySection";
import CompanyManagementSection from "../components/CompanyManagementSection/CompanyManagementSection";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <ScrollScrubVideo />
      <FinancesSection />
      <InventorySection />
      <CompanyManagementSection />
    </main>
  );
}
