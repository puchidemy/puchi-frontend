"use client";

import RiveWrapper from "./RiveWrapper";

const RiveExamples = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Rive Component Examples</h1>

      {/* RiveWrapper Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          RiveWrapper (Tất cả tính năng)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tự động chọn file nhỏ */}
          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Auto Small (36KB)</h3>
            <RiveWrapper width="200px" height="200px" />
          </div>

          {/* Tự động chọn file lớn */}
          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Auto Large (3.4MB)</h3>
            <RiveWrapper width="400px" height="400px" />
          </div>

          {/* Chỉ định file cụ thể */}
          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Force Small</h3>
            <RiveWrapper fileType="catButton" width="200px" height="200px" />
          </div>
        </div>
      </section>

      {/* More Examples */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Các cách sử dụng khác</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Welcome File (3.4MB)</h3>
            <RiveWrapper fileType="welcome" width="300px" height="300px" />
          </div>

          <div className="border p-4 rounded">
            <h3 className="font-medium mb-2">Ưu tiên file nhỏ</h3>
            <RiveWrapper preferSmall={true} width="300px" height="300px" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default RiveExamples;
