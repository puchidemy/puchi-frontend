# Rive Component Optimization

## Tối ưu hóa kích thước Rive Component

### 1. **Lazy Loading (Đã triển khai)**

- Sử dụng `dynamic import` để lazy load Rive component
- Giảm kích thước bundle ban đầu
- Hiển thị loading spinner trong khi tải

### 2. **File Size Optimization**

- **welcome.riv**: 3.4MB (file lớn)
- **cat_button.riv**: 36KB (file nhỏ - giảm 99% kích thước)

### 3. **Performance Settings**

```typescript
// Các tùy chọn tối ưu hiệu suất
useOffscreenRenderer: false,        // Tắt offscreen renderer
shouldResizeCanvasToContainer: true, // Tự động resize
automaticallyHandleEvents: true,     // Tự động xử lý events
```

### 4. **Components Available**

#### RiveWrapper (Component duy nhất - tất cả tính năng)

```tsx
import RiveWrapper from "@/components/RiveWrapper";

// Tự động chọn file dựa trên kích thước
<RiveWrapper width="200px" height="200px" />; // Tự động dùng catButton (36KB)
<RiveWrapper width="800px" height="600px" />; // Tự động dùng welcome (3.4MB)

// Chỉ định file cụ thể
<RiveWrapper fileType="catButton" />; // Luôn dùng file nhỏ
<RiveWrapper fileType="welcome" />; // Luôn dùng file lớn

// Ưu tiên file nhỏ
<RiveWrapper preferSmall={true} />; // Luôn chọn file nhỏ

// Kích thước tự động
<RiveWrapper />; // Tự động chọn kích thước phù hợp
```

### 5. **Configuration**

Tất cả cài đặt được quản lý trong `src/lib/rive-config.ts`:

```typescript
import { getOptimizedRiveProps } from "@/lib/rive-config";

// Lấy props tối ưu cho từng loại file
const props = getOptimizedRiveProps("welcome"); // hoặc "catButton"
```

### 6. **Bundle Size Reduction**

- **Trước**: Rive component load ngay lập tức
- **Sau**: Lazy load + file nhỏ hơn 99%
- **Kết quả**: Giảm đáng kể thời gian tải trang

### 7. **Usage Recommendations**

- Sử dụng `RiveWrapper` cho tất cả trường hợp
- Component sẽ tự động chọn file phù hợp dựa trên kích thước
- Sử dụng `preferSmall={true}` để tiết kiệm bandwidth
- Cân nhắc compress Rive files thêm nếu cần

### 8. **Next Steps**

1. Compress `welcome.riv` file để giảm từ 3.4MB xuống
2. Sử dụng Rive's optimization tools
3. Giảm complexity của animations trong file
4. Sử dụng lower resolution assets
