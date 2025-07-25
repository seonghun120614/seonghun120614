---
layout: post
title:  National Number
date:   2025-07-25 15:44:36 +0900
categories: Math Analysis
---

<!--more-->

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
    - [Prop. Principle of Backwards Induction](#prop-principle-of-backwards-induction)
- [곱셈 정의](#곱셈-정의)
    - [Lemma 1](#lemma-1-2)
    - [Lemma 2](#lemma-2-1)
    - [Prop. Distributive Law](#prop-distributive-law)
    - [Prop. Associative Law](#prop-associative-law)
    - [Prop. Order-preserving](#prop-order-preserving)
    - [Corollary. Cancellation Law](#corollary-cancellation-law)
    - [Prop. Euclid's Division Lemma](#prop-euclids-division-lemma)
    - [자연수의 거듭제곱 정의](#자연수의-거듭제곱-정의)
- [Practice](#practice)

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
$\nexists n \in \text{s.t. }n++ = 0$

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

$+:= \mathbb{N}\times\mathbb{N}\mapsto\mathbb{N}$
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
&\text{Order-preserving }& a \geq b &\iff a + c \geq b + c\\
&\text{Prop. 2 }& a < b &\iff a++ \leq b\\
&\text{Prop. 3 }& a < b &\iff \exists d \in \mathbb{Z}^+, b = a + d\\
\end{align*}
$$

$$
\begin{align*}
&\text{p.f)}\\
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
&\textbf{Order-preserving} \\
&\iff a = b + d \land b \geq a \\
&\iff b \geq b + d & \tag{i}\\
&\iff ((d \neq 0) \lor (d = 0)) \land (b \geq b + d) \\
&\iff ((d \neq 0) \land (b \geq b + d)) \lor ((d = 0) \land (b \geq b + d))\\
&\iff \bot \lor ((d = 0) \land (d = 0) \land (b \geq b + d)) \\
&\iff (d = 0) \land t \\
&\iff d = 0 \\
&\iff a = b &\blacksquare \\
\\
&\textbf{Prop. 2, Prop. 3} \\
&\iff (b = a + d) \land (b \neq a) \\
&\iff (b = a + d) \land (b = a + d \neq a)\\
\\
&\because d \neq 0 \text{ By, Positive Number Lemma 1, we can take }\\
&\exists! c \in \mathbb{N},\quad s.t.\quad c++ = d\\
&\text{Also, Prop. 3 is naturally proved by above right proposition. }\quad \blacksquare\\
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
&\begin{cases}
& P(m_0) \equiv t \\
&\forall m(\geq m_0) \in \mathbb{N}, \bigwedge_{m_0 \leq m' < m} P(m') \implies P(m) \\
\end{cases}\\
&\forall n(\geq m_0), P(n) \equiv t
\end{align*}
$$
위가 참이면 모든 자연수 $m(\geq m_0)$에 대한 $P(n)$이 참이다. $m_0$은 보통 0 또는 1로 두고, $P_{m_0}$이 참이라고 해야 의미가 있게 된다. 증명하자.

$$
\begin{align*}
p.f) \\
&\text{i) } m = m_0,\;P(m_0) \equiv P(m) \equiv t\\
&\text{ii) } m = k, \bigwedge_{m_0 \leq m' < k} P(m') \implies P(k)\\
&\implies \bigwedge_{m_0 \leq m' < k} P(m') \land t\\
&\iff \bigwedge_{m_0 \leq m' < k} P(m') \land P(k)\\
&\iff \bigwedge_{m_0 \leq m' < k++} P(m') \implies P(k++)\\
&\therefore P(k) \implies P(k++)\\
\therefore \forall m(\geq m_0)\in\mathbb{N}, P(m)\equiv t\\
&&\blacksquare\\
\end{align*}
$$

#### Prop. Principle of Backwards Induction
$$
\begin{align*}
&n \in \mathbb{N},\text{P(m) is proposition function}\\
&\begin{cases}
& P(n) \equiv t \\
& P(m++) \implies P(m)
\end{cases}\\
&\forall m(\leq n) \in \mathbb{N}, P(m) \equiv t
\end{align*}
$$
두 조건을 만족 시 n 이하의 자연수 전부에 대해 참임을 볼 수 있다. 여기서는 n에 대한 귀납법을 사용하면 된다.
$$
\begin{align*}
&\text{i) }n = 0,\;P(0) \equiv t\\
&\implies \forall m(\leq 0) \in \mathbb{N}, P(m) \equiv t\\
&\text{ii) }n = k,\;\forall m(\leq k) \in \mathbb{N}, P(m) \equiv t\\
&\implies P(m) \land P(k++)\quad(\because n=k+1)\\
&\implies \forall m(\leq k++) \in \mathbb{N}, P(m) \equiv t\\\\
&\therefore \begin{cases}
& P(n) \equiv t \\
& P(m++) \implies P(m)
\end{cases}\implies \forall m(\leq n) \in \mathbb{N}, P(m) \equiv t
&&\blacksquare
\end{align*}\\
$$

### 곱셈 정의
$\times := \mathbb{N}\times\mathbb{N}\mapsto\mathbb{N}$
- $0\times m:=0$
- $(n++)\times m:= (n\times m) + m$

로 정의한다. 여기서 귀납법을 사용하면 두 자연수의 곱이 자연수임을 쉽게 확인 할 수 있다.

> 두 자연수 $n, m$ 에 대해 $n\times m$ 이 자연수 임을 보이자.  
> n = 0 일 때는 자명하다.  
> n = k 일 때 $k\times m$이 자연수라고 하자.  
> 그러면 $(k++) \times m = k \times m + m$ 이므로 $k\times m$ 이 자연수고, $m$이 자연수이기 때문에 전체도 자연수가 된다.

#### Lemma 1
곱셈의 교환법칙부터 증명하자. 사실 덧셈의 교환법칙 안에 포함되어 있다.

$$
\begin{align*}
&\forall n, m \in \mathbb{N}, n \times m = m \times n\\
&p.f)\\
&\text{i) } n = 0,\\
&\quad \text{1) } m = 0,\;0\times 0=0\times 0\\
&\quad \text{2) } m = k,\;0\times k=k\times 0=0\\
&\quad \implies (k++) \times 0=k\times 0+0=0\times k = 0\\
&\text{ii) } n = i,\\
&\quad i \times m = m \times i\\
&\quad \implies i++ \times m = i \times m + m = m \times i + m = m \times i++\\\\
&\therefore \forall n, m \in \mathbb{N}, n \times m = m \times n
&&\blacksquare
\end{align*}
$$

#### Lemma 2

$$
\forall n, m \in \mathbb{N},\;n\times m = 0 \iff n=0 \lor m=0
$$
귀류법을 사용해 증명하자. 그러면 n, m 은 0이 아니고, 양의 자연수이다.
$$
\begin{align*}
&p.f)\\
&\exists!\;n_{-} \in \mathbb{N},\;s.t.\;n_{-}++ = n\quad(\because \text{Positive Number Lemma 1})\\
&n\times m = n_{-} \times m + m = 0 \implies m = 0 \equiv c\\
&\text{By commutativity of multiplication, the other case is contradiction}\\
&\therefore \forall n, m \in \mathbb{N},\;n\times m = 0 \implies n=0 \lor m=0\\
&\text{The other arrow is trivial.}&\blacksquare
\end{align*}
$$

#### Prop. Distributive Law

$$
\forall a, b, c \in \mathbb{N},\; a(b+c) = ab + ac \land (b+c)a = ba + ca
$$

$$
\begin{align*}
&\text{i) } c = 0,\\
&a(b+0) = ab = ab + 0 = ab + a0 \\
&\text{ii) } a(b+c) = ab + ac \\
&\implies a(b+(c++)) = a((b+c)++) = a(b+c) + a = ab + ac + a = ab + a(c++)\\
&\blacksquare
\end{align*}
$$

#### Prop. Associative Law

$$\forall a, b, c \in \mathbb{N},\;(a\times b)\times c = a\times (b\times c)$$

$$
\begin{align*}
&\text{i) } b = 0, (a\times 0) \times c = 0 = 0 \times c = a\times (0\times c)\\
&\text{ii) } b = k, (a\times k) \times c = a\times(k\times c)\\
&\implies (a\times(k++))\times c = (a\times k + a) \times c = (a\times k)\times c + a \times c = a \times (k \times c) + a \times c = a\times(k++ \times c)\\
\blacksquare
\end{align*}
$$

#### Prop. Order-preserving

$$\forall a, b \in \mathbb{N}, \forall c \in \mathbb{Z^+}\;a < b \implies ac < bc$$

$$
\begin{align*}
a < b&\implies \exists k \in \mathbb{Z^+},\; a + k = b\quad(\because\text{Positive Number Prop.3})\\
&\implies (a+k)c = bc\\
&\implies \exists kc \in \mathbb{Z^+},\;ac + kc = bc\\
&\implies ac < bc\\
\blacksquare
\end{align*}
$$

#### Corollary. Cancellation Law

$$\forall a, b, c \in \mathbb{N}, ac = bc \land c \neq 0 \implies a = b$$

$$
\begin{align*}
&\text{p.f)}\\
&\text{i) }c = 0++, a(0++) = b(0++) \implies a = b\\
&\text{ii) }c = k, ak = bk \implies a = b\\
&\implies a(k++) = b(k++) \implies ak + a = bk + a = bk + b = b(k++)\\
\blacksquare
\end{align*}
$$

> 앞으로 n++ = n + 1 임을 이용한다.

#### Prop. Euclid's Division Lemma
$$\forall n\in\mathbb{N}, q\in\mathbb{Z^+},\;\exists m, r \in \mathbb{N},\;(0\leq r < q) \land (n = mq + r)$$

n에 대한 귀납법을 사용하자.

$$
\begin{align*}
&\text{p.f)}\\
&\text{i) } n = 0,\;0 = 0q + 0\\
&\text{ii) } n = k,\;k = m_0q + r_0\quad(0\leq r_0 < q)\\
&\implies k+1 = m_0q + r_0 + 1 = m_0q + r_1\quad(\because 0 \leq r_1 = r_0 + 1 < q+1)\\
&\begin{cases}
& r_1 = q \implies k+1 = (m_0+1)q + 0\\
& r_1 < q \implies k+1 = m_0q + r_1
\end{cases}\\
\blacksquare
\end{align*}
$$

#### 자연수의 거듭제곱 정의
$$
\begin{align*}
&\forall m \in \mathbb{N}\\
&m^0 := 1,\;0^0 = 1 \\
&m^{n++} := m^n \times m
\end{align*}
$$

거듭제곱을 귀납적으로 정의한다.

### Practice

1. $\forall a, b \in \mathbb{N}, (a+b)^2 = a^2 + 2ab = b^2$

Distributive law를 사용하자.
$$
\begin{align*}
(a+b)^2 = a(a+b) + b(a+b) = a^2 + ab + ba + b^2 = a^2 + 2ab + b^2
\end{align*}
$$

다음은 집합론인데 따로 분야를 나눠서 다루므로 넘어간다. 이제 자연수에서 기본적인 곱셈과 덧셈에 대한 연산은 증명없이 전부 자연스럽게 넘어간다.

---

## 🔗 관련 출처
- [Tao 해석학 I]()
