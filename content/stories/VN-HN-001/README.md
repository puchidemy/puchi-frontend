# VN-HN-001 — Sáng Hà Nội — tô phở đầu ngày

**Status:** `draft` · **contentVersion:** `1.1.0`  
**Level:** B1 · **City:** ha-noi · **Scenes:** 4 (trimmed)

Culture-first Hanoi morning phở story. Scenes have narration (and light dialogue where needed), word/phrase/grammar anchors, and activities. Media files are listed in `assets/manifest.json` but not yet recorded — validator warns on missing files for `draft`.

## Scenes

1. `street-smell` — mùi phở trên phố (`phrase.mui-pho`)
2. `queue-up` — xếp hàng / xin lỗi
3. `order-bowl` — gọi một tô / rau thơm
4. `first-sip` — nước dùng

## Objectives

- `obj.order-pho` — gọi tô / hỏi topping (`order-bowl`, grammar `cho tôi`)
- `obj.street-polite` — xếp hàng, xin lỗi (`queue-up`)

## Validate / compile

```bash
bun run validate:story -- content/stories/VN-HN-001
bun run compile:story -- content/stories/VN-HN-001
```
