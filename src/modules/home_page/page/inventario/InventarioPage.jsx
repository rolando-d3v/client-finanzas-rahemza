import React from "react";
import ScrollScrubCanvas from "../../components/video/ScrollScrubCanvas";
import InventorySection from "../../components/InventorySection/InventorySection";
import CompanyManagementSection from "../../components/CompanyManagementSection/CompanyManagementSection";

export default function InventarioPage() {
  return (
    <div>
      <ScrollScrubCanvas
        framesPath="/video_inventario/frames/frame_"
        totalFrames={150}
      />
      <InventorySection />
      <CompanyManagementSection />
    </div>
  );
}
