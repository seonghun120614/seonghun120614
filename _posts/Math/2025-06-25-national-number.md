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
    - [정의](#정의)
    - [Axiom](#axiom)
    - [귀납적 정의](#귀납적-정의)
- [덧셈 정의](#덧셈-정의)
    - [Lemma 1](#lemma-1)
    - [Lemma 2](#lemma-2)
    - [Prop. Commutative Rule](#prop-commutative-rule)
    - [Prop. Associative Rule](#prop-associative-rule)
    - [Prop. Cancellation Law](#prop-cancellation-law)
    - [양수 정의](#양수-정의)
        - [Prop. 1](#prop-1)
        - [Corollary 1](#corollary-1)
        - [Lemma 1](#lemma-1-1)
    - [자연수의 순서 정의](#자연수의-순서-정의)
        - [Prop. 1](#prop-1-1)
        - [Props.](#props)
        - [Prop. Trichotomy](#prop-trichotomy)
        - [Prop. Strong Principle of Induction](#prop-strong-principle-of-induction)

---

## 📚 본문

선행 학습으로 집합론과 수리논리학이 필요 할 수 있다.

### 페아노 공리계

#### 정의
- **National Number** $:= \mathbb{N}$
- **Successor Operation** $:= ++$

#### Axiom

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

#### 귀납적 정의

페아노의 공리계 안에서 정의 가능한 논리 구조로 재귀적인 수열을 정의할 때도 이를 쓴다.

각 자연수 $n$ 에 대해 $f_n: \mathbb{N} \rightarrow \mathbb{N}$ 의 함수가 존재하고, $c \in \mathbb{N}$ 일 때,
- $a_0 := c$
- $a_{n++} := f_n(a_n)$

을 만족하게 할 수 있다. 즉, 귀납적으로 수열을 정의할 수 있고, 그 수열의 원소 $a_n$는 **'유일'하게** 결정이 된다.

### 덧셈 정의

$+:= \mathbb{N}\times\mathbb{N}\rightarrow\mathbb{N}$
- $0+a = a$
- $(a++)+b = (a+b)++$

#### Lemma 1
$$
\begin{align*}
&\forall n \in \mathbb{N},\ n + 0 = n \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
0 + 0 &= 0 &(\because\ 0 \in \mathbb{N}) \\
\text{Assume } k + 0 &= k &\text{ (Inductive Hypothesis)} \\
(k++) + 0 &= (k + 0)++ \\
&= k++ \\
\\
\therefore (k++) + 0 &= k++ &&\blacksquare
\end{align*}
$$

#### Lemma 2
$$
\begin{align*}
&\forall n, m \in \mathbb{N},\ n + (m++) = (n + m)++ \\
&\text{p.f)} \\
\end{align*}
$$  

$$
\begin{align*}
0 + (m++) &= m++ = (0 + m)++  &(\because 0 + m := m) \\
\text{Assume } k + (m++) &= (k + m)++ &\text{ (Inductive Hypothesis)} \\
(k++) + (m++) &= (k + (m++))++ &\\
&= ((k + m)++)++ &\\
\\
\therefore \forall n, m \in \mathbb{N},\ n + (m++) &= (n + m)++ &\blacksquare\\
\end{align*}
$$

#### Prop. Commutative Rule
$$
\begin{align*}
&\forall n, m \in \mathbb{N}, n + m = m + n \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
0 + m &= m + 0 \\
\text{Assume } k + m &= m + k \\
(k++) + m &= m + (k++) \\
&=(k + m)++ \\
&=(m + k)++ \\
&=m + (k++) \\
\\
\therefore \forall n, m \in \mathbb{N}, n + m &= m + n &\blacksquare
\end{align*}
$$

#### Prop. Associative Rule
$$
\begin{align*}
&\forall a, b, c \in \mathbb{N}, (a+b)+c = a+(b+c) \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
(0 + b) + c &= b + c = 0 + (b + c) \\
\text{Assume } (k + b) + c &= k + (b + c) \\
((k++) + b) + c &= ((k + b)++) + c \\
&=((k + b) + c)++ \\
&=(k + (b + c))++ \\
&=(k++) + (b + c) \\
\\
\therefore \forall a, b, c \in \mathbb{N}, (a+b)+c &= a+(b+c) &\blacksquare
\end{align*}
$$

#### Prop. Cancellation Law
$$
\begin{align*}
&\forall a, b, c \in \mathbb{N}, a + b = a + c \implies b = c \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
b \neq c \rightarrow a + b &\neq a + c &(\text{Reductio ad Absurdum}) \\
0 + b = b &\neq c = 0 + c \\
\text{Assume } k + b &\neq k + c \\
(k++) + b = (k + b)++ &\neq (k + c)++ = (k++) + c \\
\\
\therefore \forall a, b, c \in \mathbb{N}, a + b = a + c &\implies b = c &\blacksquare
\end{align*}
$$

#### 양수 정의

자연수 n 이 양수(positive) 일 필요충분조건은 n이 0이 아닐때이다. 편의 상 양수를 $\mathbb{Z}^+$ 라고 하자.

##### Prop. 1
$$
\begin{align*}
&a\in\mathbb{\mathbb{Z}^+} \land b\in\mathbb{N} \implies a+b \in \mathbb{Z}^+ \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
a+0 = a &\in \mathbb{Z}^+ \\
\text{Assume } a + k &\in \mathbb{Z}^+ \\
a + (k++) = (a + k)++ &\in \mathbb{Z}^+ &(\because \text{Axiom 3}) \\
\\
\therefore a\in\mathbb{\mathbb{Z}^+} \land b\in\mathbb{N} &\implies a+b \in \mathbb{Z}^+ &\blacksquare\\
\end{align*}
$$

##### Corollary 1
$$
\begin{align*}
&\forall a, b \in \mathbb{N}, a + b = 0 \implies a = 0 \land b = 0 \\
&\text{p.f)} \\
\end{align*}
$$

$$
\begin{align*}
a \neq 0 \lor b \neq 0 &\rightarrow a + b \neq 0 &(\text{Reductio ad Absurdum}) \\
a \neq 0 \lor b \neq 0 &\rightarrow a \in \mathbb{Z}^+ \lor b \in \mathbb{Z}^+ \\
&\rightarrow a + b \in \mathbb{Z}^++ &(\because \text{Prop. 1}) \\
&\rightarrow a + b \neq 0 \\
\\
\therefore \forall a, b \in \mathbb{N}, a + b = 0 &\implies a = 0 \land b = 0 &\blacksquare
\end{align*}
$$

##### Lemma 1
$$
\begin{align*}
&\forall a \in \mathbb{Z}^+ \implies \exists! b \in \mathbb{N}, b++ = a \\
&\text{p.f)}
\end{align*}
$$

$$
\begin{align*}
\textbf{Existence:} \\
\forall a \in \mathbb{Z}^+ , &\exists b \in \mathbb{N} \\
&\exists 0 \in \mathbb{N}, 0++ = 1 \\
\text{Assume for k}\quad &\exists c \in \mathbb{N}, c++ = k \\
&\exists c++ \in \mathbb{N}, (c++)++ = k++ \\
\\
\textbf{Uniqueness:} \\
&\text{Take } b_1, b_2 \in \mathbb{N}, b_1++ = a \land b_2++ = a \\
&\text{Then } b_1 = b_2 &(\text{Axiom 4}) \\
\\
\therefore \forall a \in \mathbb{Z}^+ &\implies \exists! b \in \mathbb{N}, b++ = a &\blacksquare\\
\end{align*}
$$

#### 자연수의 순서 정의

자연수 n, m에 대해 순서를 정의하자:
- $n \ge m := a \in \mathbb{N}, n = m + a$  
n 이 m 이상(greater than or equal to) 또는 n 이 m보다 크거나 같다 라고 한다.
- $n > m := n \ge m \land n \neq m$  
n 이 m 보다 크다 또는 n 이 m 초과 라고 한다.

##### Prop. 1
$$
\begin{align*}
&\forall n \in \mathbb{N}, n++ > n \\
&\text{p.f)}
\end{align*}
$$

$$
\begin{align*}
0++ = (0 + 0)++ = 0 + 0++ &> 0 \\
\text{Assume } k++ &> k \\
(k++)++ = (k+a)++ = k++ + a &> k++ \\
\\
\therefore \forall n \in \mathbb{N}, n++ > n
\end{align*}
$$

##### Props.
$$
\begin{align*}
&\text{Reflexive }& a \geq a\\
&\text{Transitive }& a \geq b \land b \geq c &\implies a\geq c \\
&\text{Anti-symmetric }& a \geq b \land b \geq a &\implies a=b\\
&\text{Prop. 2 }& a \geq b &\iff a + c \geq b + c\\
&\text{Prop. 3 }& a < b &\iff a++ \leq b\\
&\text{Prop. 4 }& a < b &\iff \exists d \in \mathbb{Z}^+, b = a + d\\
&\text{p.f)}
\end{align*}
$$

$$
\begin{align*}
&\textbf{Reflexive} \\
&a = a + 0 \geq a &\blacksquare \\
\\
&\textbf{Transitive} \\
&(a = b + d) \land (b = c + e) \\
&\implies a = c + e + d \\
&\implies a \geq c &\blacksquare \\
\\
&\textbf{Anti-symmetric} \\
&\iff a = b + d \land b = a + e \\
&\iff a = a + e + d \land b = b + d + e\\
&\iff a \geq a + d \\
&\iff a = b &\blacksquare\\
\\
&\textbf{Prop. 2} \\
&\iff a = b + d \land b \geq a \\
&\iff b \geq b + d & \tag{i}\\
&\iff ((d \neq 0) \lor (d = 0)) \land (b \geq b + d) \\
&\iff ((d \neq 0) \land (b \geq b + d)) \lor ((d = 0) \land (b \geq b + d))\\
&\iff \bot \lor ((d = 0) \land (d = 0) \land (b \geq b + d)) \\
&\iff (d = 0) \land t \\
&\iff d = 0 \\
&\iff a = b &\blacksquare \\
\\
&\textbf{Prop. 3, Prop. 4} \\
&\iff (b = a + d) \land (b \neq a) \\
&\iff (b = a + d) \land (b = a + d \neq a)\\
\\
&\because d \neq 0 \text{ By, Positive Number Lemma 1, we can take }\\
&\exists! c \in \mathbb{N},\quad s.t.\quad c++ = d\\
&\text{Also, Prop. 4 is naturally proved by above right proposition. }\quad \blacksquare\\
\\
&\iff (b = a + (c++) = (a+c)++ = (a++) + c) \land (b \neq a \equiv t) \\
&\iff b = (a++) + c = a + (c++) \\
&\iff a++ \leq b & \blacksquare \\
\end{align*}
$$

이제 $a > b$ 를 $a = b + p\quad (p \in \mathbb{Z}^+)$ 로 둘 수 있다.

##### Prop. Trichotomy
삼분법이라고 한다. 하나가 참이면 다른 명제 두 개가 참이 아니며 어떤 상황에서든 하나만 참이 되는 명제다. `xor`의 확장 버전이지만 조금 다른 버전이다.
$$
\begin{align*}
&\forall a, b \in \mathbb{N}, \\
&\text{Let } P_1 := a > b, P_2 := a = b, P_3 := a < b\\
&\text{then }\bigvee_{i=1}^3 \left( P_i \land \bigwedge_{j \neq i} \lnot P_j \right)
\end{align*}
$$

셋 중 하나만 참을 요약해서 표현한 것이다.

$$
\begin{align*}
p.f) \\
&\text{i) } P_1 \equiv t, \\
&a = b + p > b&(P_2 \equiv \bot)\\
&\text{prove by Reductio ad Absurdum}\\
&P_3 := a < b := b = a + q = b + (p + q) \implies \bot &(p+q \neq 0)\\
\\
&\text{ii) } P_2 \equiv t, \\
&a = b \implies \lnot P_1 \land \lnot P_2 &(\because \text{Definition of Positive Number Order})\\
\\
&\text{iii) } P_3 \equiv t, \textbf{(trivial)} \\
&&\blacksquare\\
\end{align*}
$$

#### Prop. Strong Principle of Induction
$$
\begin{align*}
&m_0 \in \mathbb{N}, P \text{ is proposition function.}\\
&\forall n \in \mathbb{N}, \left(\forall m(\geq m_0) \in \mathbb{N}, \left(\bigwedge_{m_0 \leq m' < m} P(m')\right) \rightarrow P(m)\right) \rightarrow P(n) \\
\end{align*}
$$
위가 참이면 모든 자연수 n에 대한 P(n) 이 참이다. $m_0$은 보통 0 또는 1로 둔다.

---

## 🔗 관련 출처
- [Tao 해석학 I]()
