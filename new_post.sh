#!/bin/bash

# 1. 제목과 카테고리 파라미터
TITLE="$1"
CATEGORIES="$2"

# 2. 오늘 날짜와 시간 (한국 시간)
DATE=$(date +"%Y-%m-%d %H:%M:%S %z")

# 3. 파일 이름 생성 (공백은 하이픈으로 변환)
FILENAME="_posts/$(date +%Y-%m-%d)-$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '-').md"

# 4. 파일 내용 작성
cat <<'EOF' > "$FILENAME"
---
layout: post
title:  TITLE_PLACEHOLDER
date:   DATE_PLACEHOLDER
categories: CATEGORIES_PLACEHOLDER
---

{% include math.html %}

## 0. 초록 (Abstraction)

- 문제 제시
- 문제 원인
- 글 요약
- 결과 요약

## 1. 서론 (Introduction)

- 주제에 대한 소개
- 문제의 중요성 및 정의
- 독자에게 전달할 핵심 의도

## 2. 본론 (Main Body)


## 3. 결론 (Conclusion)



## 📚 References
- []()
- []()
- []()
EOF

# sed 로 실제 값 치환
sed -i '' "s/TITLE_PLACEHOLDER/$TITLE/" "$FILENAME"
sed -i '' "s/DATE_PLACEHOLDER/$DATE/" "$FILENAME"
sed -i '' "s/CATEGORIES_PLACEHOLDER/$CATEGORIES/" "$FILENAME"

# 5. 완료 메시지
echo "✅ Created: $FILENAME"