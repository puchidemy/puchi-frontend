# Dictation Lesson Backend Requirements

## Overview

Dictation lesson là một loại bài học cho phép người dùng học từ vựng thông qua việc viết lại từ/câu từ ngôn ngữ này sang ngôn ngữ khác.

## Database Schema

### 1. DictationLesson

```sql
CREATE TABLE dictation_lessons (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  total_questions INT NOT NULL,
  difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  target_language VARCHAR(10) NOT NULL, -- 'vi', 'en', etc.
  answer_language VARCHAR(10) NOT NULL, -- 'vi', 'en', etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. DictationQuestion

```sql
CREATE TABLE dictation_questions (
  id VARCHAR(255) PRIMARY KEY,
  lesson_id VARCHAR(255) NOT NULL,
  question_order INT NOT NULL,
  type ENUM('new_word', 'review_word') DEFAULT 'new_word',
  instruction VARCHAR(255) NOT NULL,
  target_word VARCHAR(255) NOT NULL,
  target_language VARCHAR(10) NOT NULL,
  answer_language VARCHAR(10) NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  explanation TEXT,
  audio_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES dictation_lessons(id) ON DELETE CASCADE
);
```

### 3. DictationWordOption

```sql
CREATE TABLE dictation_word_options (
  id VARCHAR(255) PRIMARY KEY,
  question_id VARCHAR(255) NOT NULL,
  text VARCHAR(255) NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  display_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES dictation_questions(id) ON DELETE CASCADE
);
```

### 4. UserDictationProgress

```sql
CREATE TABLE user_dictation_progress (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  current_question_index INT DEFAULT 0,
  lives INT DEFAULT 5,
  max_lives INT DEFAULT 5,
  score INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES dictation_lessons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_lesson (user_id, lesson_id)
);
```

### 5. UserDictationAnswer

```sql
CREATE TABLE user_dictation_answers (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  question_id VARCHAR(255) NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_ms INT NOT NULL,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES dictation_lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES dictation_questions(id) ON DELETE CASCADE
);
```

## API Endpoints

### 1. Get Lesson Data

```
GET /api/dictation/lessons/{lessonId}
```

**Response:**

```json
{
  "id": "dictation-001",
  "title": "Basic Greetings",
  "description": "Learn how to write basic Vietnamese greetings",
  "totalQuestions": 5,
  "currentQuestionIndex": 0,
  "lives": 5,
  "maxLives": 5,
  "progress": 0,
  "isCompleted": false,
  "score": 0,
  "questions": [
    {
      "id": "q1",
      "type": "new_word",
      "instruction": "Write this in English",
      "targetWord": "Chào!",
      "targetLanguage": "vi",
      "answerLanguage": "en",
      "wordOptions": [
        { "id": "w1", "text": "passport", "isCorrect": false },
        { "id": "w2", "text": "yes", "isCorrect": false },
        { "id": "w3", "text": "Hi", "isCorrect": true },
        { "id": "w4", "text": "Hello", "isCorrect": true },
        { "id": "w5", "text": "I", "isCorrect": false }
      ],
      "correctAnswer": "Hi",
      "explanation": "Chào! means 'Hi' or 'Hello' in Vietnamese",
      "audioUrl": "/audio/chao.mp3"
    }
  ]
}
```

### 2. Submit Answer

```
POST /api/dictation/lessons/{lessonId}/answer
```

**Request Body:**

```json
{
  "questionId": "q1",
  "userAnswer": "Hi",
  "timeSpent": 5000
}
```

**Response:**

```json
{
  "isCorrect": true,
  "correctAnswer": "Hi",
  "explanation": "Chào! means 'Hi' or 'Hello' in Vietnamese",
  "score": 10,
  "lives": 5
}
```

### 3. Skip Question

```
POST /api/dictation/lessons/{lessonId}/skip
```

**Request Body:**

```json
{
  "questionId": "q1"
}
```

**Response:**

```json
{
  "lives": 4
}
```

### 4. Complete Lesson

```
POST /api/dictation/lessons/{lessonId}/complete
```

**Request Body:**

```json
{
  "answers": [
    {
      "questionId": "q1",
      "userAnswer": "Hi",
      "isCorrect": true,
      "timeSpent": 5000
    }
  ]
}
```

**Response:**

```json
{
  "score": 50,
  "totalQuestions": 5,
  "correctAnswers": 5,
  "timeSpent": 25000,
  "xpEarned": 25
}
```

### 5. Get User Progress

```
GET /api/dictation/lessons/{lessonId}/progress
```

**Response:**

```json
{
  "currentQuestionIndex": 2,
  "lives": 3,
  "score": 20,
  "isCompleted": false
}
```

## Business Logic

### 1. Answer Validation

- So sánh `userAnswer` với `correctAnswer` (case-insensitive)
- Hỗ trợ multiple correct answers (ví dụ: "Hi" và "Hello" đều đúng)
- Tính toán thời gian trả lời

### 2. Lives System

- Mỗi lesson có 5 lives
- Sai hoặc skip = mất 1 life
- Hết lives = lesson failed

### 3. Scoring System

- Đúng = +10 điểm
- Sai = +0 điểm
- Bonus cho thời gian nhanh
- Bonus cho streak đúng liên tiếp

### 4. Progress Tracking

- Lưu trữ progress theo user và lesson
- Resume lesson khi user quay lại
- Track completion rate và performance

### 5. Analytics

- Thời gian trung bình per question
- Tỷ lệ đúng/sai per question
- Difficulty adjustment based on performance
- A/B testing cho different question types

## Security Considerations

1. **Authentication**: Tất cả API calls cần user authentication
2. **Authorization**: User chỉ có thể access lessons đã được assign
3. **Rate Limiting**: Prevent spam submissions
4. **Input Validation**: Sanitize user inputs
5. **Data Privacy**: Encrypt sensitive user data

## Performance Considerations

1. **Caching**: Cache lesson data và user progress
2. **Database Indexing**: Index trên user_id, lesson_id, question_id
3. **CDN**: Serve audio files qua CDN
4. **Pagination**: Cho large lesson sets
5. **Background Jobs**: Process analytics và scoring async

## Future Enhancements

1. **Adaptive Difficulty**: Adjust question difficulty based on user performance
2. **Spaced Repetition**: Reintroduce words at optimal intervals
3. **Social Features**: Leaderboards, achievements, sharing
4. **Offline Support**: Cache lessons for offline use
5. **Voice Recognition**: Support voice input for answers
