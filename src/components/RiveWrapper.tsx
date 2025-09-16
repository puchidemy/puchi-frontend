"use client";

import dynamic from "next/dynamic";
import { getOptimizedRiveProps } from "@/lib/rive-config";

// Lazy load the Rive component to reduce initial bundle size
const Rive = dynamic(() => import("@rive-app/react-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

interface RiveWrapperProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fileType?: "welcome" | "catButton" | "auto"; // "auto" sẽ tự động chọn
  preferSmall?: boolean; // Ưu tiên file nhỏ
}

const RiveWrapper = ({
  width = "auto",
  height = "auto",
  className = "",
  fileType = "auto",
  preferSmall = false,
}: RiveWrapperProps) => {
  // Logic tự động chọn file dựa trên kích thước
  const getAutoFileType = () => {
    if (fileType !== "auto") return fileType;

    // Nếu preferSmall = true, luôn chọn file nhỏ
    if (preferSmall) return "catButton";

    // Tự động chọn dựa trên kích thước
    const widthNum = typeof width === "string" ? parseInt(width) : width;
    const heightNum = typeof height === "string" ? parseInt(height) : height;

    // Nếu kích thước nhỏ hơn 300px, dùng file nhỏ
    if ((widthNum && widthNum < 300) || (heightNum && heightNum < 300)) {
      return "catButton";
    }

    return "welcome";
  };

  const selectedFileType = getAutoFileType();
  const isSmallFile = selectedFileType === "catButton";

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{
        width: width === "auto" ? (isSmallFile ? "200px" : "100%") : width,
        height: height === "auto" ? (isSmallFile ? "200px" : "100vh") : height,
      }}
    >
      <Rive
        {...getOptimizedRiveProps(selectedFileType)}
        onLoad={() =>
          console.log(
            `${selectedFileType} Rive loaded (${
              isSmallFile ? "36KB" : "3.4MB"
            })`
          )
        }
      />
    </div>
  );
};

export default RiveWrapper;
