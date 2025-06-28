---
layout: post
title:  National Number
date:   2025-06-25 15:44:36 +0900
categories: Math Analysis
---

<!--more-->
미완성


## 📂 목차
- [페아노 공리계(PA)](#페아노-공리계)
    - [Recursive 정의](#recursive-정의)
- [덧셈](#덧셈)

---

## 📚 본문

선행 학습으로 집합론과 수리논리학이 필요 할 수 있다.

### 페아노 공리계

**정의**
- **National Number** $:= \mathbb{N}$
- **Successor Operation** $:= ++$

**공리**
1. 시작 수 정의  
$0 \in \mathbb{N}$

2. 0에서 시작하는 **'셈(Succession / Counting)'**을 정의  
$\forall n \in \mathbb{N}, n++ \in \mathbb{N}$  
즉, 모든 자연수는 **Successor** 를 갖는다.

3. 공리 1, 2 만으로는 컴퓨터의 overflow 가 되는 수 체계에서는 0으로 되돌아가는 것이 맞지 않음, **Wrap-around** 를 방지  
$\nexists n \in s.t. n++ = 0$

4. 공리 1, 2, 3 만으로는 0, 1 에서의 1++ 가 다시 1이 되는 수체계가 있을 수 있다. 1 = 2 = 3 = ... 의 문제 발생을 방지  
$\forall n, m \in \mathbb{N}, n++=m++ \implies n=m$  
이는 수가 그 자체로 자기 자신임을 함축하는 공리이며 유일성이 무너지지 않게 보장한다.

5. **Principle of Mathematical Induction**  
$0 \in A \land \forall n \in \mathbb{N}, (n \in A \implies n++ \in A) \implies \forall n \in \mathbb{N}, n \in A$  
즉, 어떤 집합이 0을 포함하고 그 후속자를 포함한다면, 해당 집합은 자연수 집합이다.

> *0이 자연수라고 보는 것은 관점의 차이이다.*

위 공리 1 ~ 5 를 만족하는 수체계 $\mathbb{N}$ 이 존재하고, $\mathbb{N}$ 의 원소를 자연수라고 한다.

#### Recursive 정의

페아노의 공리계 안에서 정의 가능한 논리 구조로 재귀적인 수열을 정의할 때도 이를 쓴다.

**명제**  
각 자연수 $n$ 에 대해 $f_n: \mathbb{N} \rightarrow \mathbb{N}$ 의 함수가 존재하고, $c \in \mathbb{N}$ 일 때,
- $a_0 := c$
- $a_{n++} := f_n(a_n)$

을 만족하게 할 수 있다. 즉, 귀납적으로 수열을 정의할 수 있고, 그 수열의 원소 $a_n$는 **'유일'하게** 결정이 된다.

### 덧셈

$+: \mathbb{N}\times\mathbb{N}\rightarrow\mathbb{N}$
- $0+a = a$
- $(a++)+b = (a+b)++$

#### 보조정리

a+0 = a 도 성립할까
> $\forall n \in \mathbb{N},\ n + 0 = n$

$$
\begin{align*}
(0 + 0 = 0) &\equiv t \quad (\because\ 0 \in \mathbb{N}) \\
(k + 0 = k) &\rightarrow (k++) + 0 \\
&= (k + 0)++ \\
&= k++ \equiv t \\
\end{align*}
$$

n+(m++) = (n+m)++ 도 성립할까
> $\forall n, m \in \mathbb{N}, n+(m++)=(n+m)++$

$$
\begin{align*}
0 + (m++) &= m++ = (0 + m)++ \equiv t \\
k + (m++) &= (k + m)++ \rightarrow \\
(k++) + (m++) &= (k + (m++))++ \\
&= ((k + m)++)++ \equiv t \\
\end{align*}
$$

#### Associative Rule

---

## ✒️ 용어

###### 

---

## 🔗 관련 출처
- []()
