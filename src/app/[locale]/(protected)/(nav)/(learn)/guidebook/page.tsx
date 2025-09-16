"use client";

import { useSearchParams } from "next/navigation";

const GuideBookPage = () => {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const unit = searchParams.get("unit");

  return (
    <div>
      GuideBookPage
      <div>Section: {section}</div>
      <div>Unit: {unit}</div>
    </div>
  );
};

export default GuideBookPage;
