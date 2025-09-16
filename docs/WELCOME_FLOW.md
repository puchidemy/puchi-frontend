# Welcome Flow Design

## Tổng quan

Trang welcome được thiết kế với luồng onboarding 5 bước để thu thập thông tin người dùng và tùy chỉnh trải nghiệm học tập.

## Cấu trúc Components

### 1. **WelcomePage** (`src/app/[locale]/welcome/page.tsx`)
- Component chính, chỉ render WelcomeFlow

### 2. **WelcomeFlow** (`src/components/welcome/WelcomeFlow.tsx`)
- Quản lý toàn bộ luồng welcome với 3 stages
- State management cho intro → onboarding → complete

### 3. **WelcomeIntro** (`src/components/welcome/WelcomeIntro.tsx`)
- Màn hình đầu tiên chỉ hiển thị Rive animation
- Button "Get Started" để bắt đầu onboarding

### 4. **OnboardingFlow** (`src/components/welcome/OnboardingFlow.tsx`)
- Quản lý 5 bước onboarding
- Progress bar hiển thị tiến độ
- Navigation buttons (Back/Continue)
- Validation: phải chọn câu trả lời mới được tiếp tục

### 5. **OnboardingComplete** (`src/components/welcome/OnboardingComplete.tsx`)
- Màn hình hoàn thành onboarding
- Hiển thị tóm tắt câu trả lời của người dùng
- Button "Start Learning Vietnamese"

## 5 Bước Onboarding

### Bước 1: "How did you hear about Puchi?"

**Mục đích:** Thu thập thông tin marketing
**Options:**

- Social Media
- Friend Recommendation
- App Store/Google Play
- Online Search
- Other

### Bước 2: "Why are you learning Vietnamese?"

**Mục đích:** Hiểu động lực học tập
**Options:**

- Travel to Vietnam
- Work/Business
- Family/Friends
- Academic Interest
- Cultural Interest

### Bước 3: "Let's prepare you for conversations!"

**Mục đích:** Xác định loại hội thoại ưu tiên
**Options:**

- Daily Conversations
- Business/Professional
- Travel & Tourism
- Food & Dining
- All of the above

### Bước 4: "How much Vietnamese do you know?"

**Mục đích:** Đánh giá trình độ hiện tại
**Options:**

- Complete Beginner
- Know a few words
- Can make simple sentences
- Intermediate
- Advanced

### Bước 5: "Here's what you can achieve!"

**Mục đích:** Thiết lập mục tiêu học tập
**Options:**

- Basic Communication
- Fluent Conversations
- Business Vietnamese
- Cultural Understanding
- Native-like Proficiency

## UI/UX Features

### Progress Bar

- Hiển thị tiến độ: "Step X of 5"
- Percentage: "X%"
- Visual progress bar

### Button States

- **Selected Answer:** `variant="default"` (highlighted)
- **Unselected Answer:** `variant="ghost"` (subtle)
- **Continue Button:** Disabled until answer selected
- **Back Button:** Disabled on first step

### Responsive Design

- Mobile-first approach
- Max width container cho desktop
- Flexible layout với flexbox

### Animation

- Rive animation ở header (welcome.riv)
- Smooth transitions giữa các bước
- Loading states

## State Management

```typescript
interface WelcomeFlowState {
  currentStage: "intro" | "onboarding" | "complete";
  answers: Record<number, string>;
}

interface OnboardingFlowState {
  currentStep: number;
  answers: Record<number, string>;
}
```

## Data Flow

1. **Welcome Intro** → User clicks "Get Started" → `handleStartOnboarding()` → Switch to onboarding stage
2. **User selects answer** → `handleAnswer()` → Update local state
3. **User clicks Continue** → `handleContinue()` → Next step or complete
4. **Onboarding complete** → `handleOnboardingComplete()` → Switch to complete stage
5. **User clicks Start Learning** → `handleStartLearning()` → Redirect to main app

## Future Enhancements

### Analytics

- Track user responses for insights
- A/B testing different question orders
- Conversion rate optimization

### Personalization

- Customize content based on answers
- Adaptive learning paths
- Personalized recommendations

### Localization

- Support multiple languages
- Cultural adaptations
- Regional preferences

### Integration

- Save answers to user profile
- Sync with learning progress
- Social features (share goals)

## Technical Notes

### Performance

- Lazy loading Rive component
- Optimized re-renders
- Minimal bundle size

### Accessibility

- Keyboard navigation
- Screen reader support
- Focus management

### SEO

- Meta tags for social sharing
- Structured data
- Performance optimization
