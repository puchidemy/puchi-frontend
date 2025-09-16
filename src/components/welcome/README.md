# Welcome Components

Thư mục này chứa tất cả components liên quan đến luồng welcome/onboarding của ứng dụng.

## Cấu trúc Files

```
src/components/welcome/
├── index.ts                 # Export tất cả components
├── WelcomeFlow.tsx          # Component chính quản lý luồng
├── WelcomeIntro.tsx         # Màn hình đầu tiên với Rive animation
├── OnboardingFlow.tsx       # 5 bước câu hỏi onboarding
├── OnboardingComplete.tsx   # Màn hình hoàn thành
└── README.md               # Documentation này
```

## Luồng Hoạt Động

### Stage 1: Welcome Intro

- Hiển thị Rive animation (welcome.riv)
- Button "Get Started" để bắt đầu onboarding
- Full-screen layout

### Stage 2: Onboarding Flow

- 5 bước câu hỏi với progress bar
- Navigation: Back/Continue buttons
- Validation: phải chọn câu trả lời mới được tiếp tục

### Stage 3: Onboarding Complete

- Hiển thị tóm tắt câu trả lời
- Button "Start Learning Vietnamese"
- Success icon và welcome message

## Usage

```tsx
import { WelcomeFlow } from "@/components/welcome";

// Trong welcome page
const WelcomePage = () => {
  return <WelcomeFlow />;
};
```

## State Management

```typescript
type WelcomeStage = "intro" | "onboarding" | "complete";

interface WelcomeFlowState {
  currentStage: WelcomeStage;
  answers: Record<number, string>;
}
```

## Components API

### WelcomeFlow

- Không có props
- Quản lý toàn bộ state và navigation

### WelcomeIntro

```typescript
interface WelcomeIntroProps {
  onStartOnboarding: () => void;
}
```

### OnboardingFlow

```typescript
interface OnboardingFlowProps {
  onComplete: (answers: Record<number, string>) => void;
}
```

### OnboardingComplete

```typescript
interface OnboardingCompleteProps {
  answers: Record<number, string>;
  onStartLearning: () => void;
}
```

## Styling

- Sử dụng Tailwind CSS
- Mobile-first responsive design
- Consistent với design system của app
- Dark/light mode support

## Performance

- Lazy loading Rive component
- Optimized re-renders
- Minimal bundle size
- Smooth transitions giữa các stages
