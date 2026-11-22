import React from "react";
import ScrollScrubCanvas from "../../components/video/ScrollScrubCanvas";
import FinancesSection from "../../components/FinancesSection/FinancesSection";

export default function FinanzasPage() {
  return (
    <div>
      <ScrollScrubCanvas
        framesPath="/video_finanza/frames/frame_"
        totalFrames={96}
      />
      <FinancesSection />
    </div>
  );
}
