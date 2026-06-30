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
image: /assets/img/
date:   DATE_PLACEHOLDER
categories: 
code_runner: false
---

<!--more-->

## 📂 목차
- []()
- []()

---

## 📚 본문



---

## ✒️ 용어

###### 

---

## 🔗 관련 출처
- []()
EOF

# sed 로 실제 값 치환
sed -i '' "s/TITLE_PLACEHOLDER/$TITLE/" "$FILENAME"
sed -i '' "s/DATE_PLACEHOLDER/$DATE/" "$FILENAME"
sed -i '' "s/CATEGORIES_PLACEHOLDER/$CATEGORIES/" "$FILENAME"

# 5. 완료 메시지
echo "✅ Created: $FILENAME"