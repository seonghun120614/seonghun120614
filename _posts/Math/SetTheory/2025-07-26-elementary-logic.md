---
layout: post
title:  Elementary Logic
date:   2025-07-26 01:47:26 +0900
categories: Math SetTheory
---

<!--more-->
🚧 작업중

## 📂 목차
- [명제 Statement](#statement)
- []()

---

## 📚 본문

### Statement

논리는 타당하지 않은 논증으로부터 타당한 논증을 구별하는 데 쓰이는 원리와 방법을 익히는 것이다. 논리를 논하기 위해서는 **참, 거짓**으로 구분 할 수 있는 문장인 Statement 부터 보아야 한다.

#### Simple Statement & Compound Statement

일반적으로 참, 거짓의 분기가 1회로 끝나는 문장을 Simple Statement 라고 하며, 단순 명제가 결합된 것을 Compound Statement 라고 한다.

단순 명제는 보통 영소문자로 두어 명제를 **정의**하고, 이 단순 명제들을 결합자를 통해 결합하면 영대문자로 나타내는 복합명제가 되는데 결합자는 다음과 같다:

**Connectives**
- $\lnot$ : not, 부정, 아니다의 의미
- $\land$: and, 그리고
- $\lor$: or, 또는
- $\rightarrow$: if...then, 이면, 라면
- $\leftrightarrow$: if...and only if..., 이면 그리고 그때에만

복합 명제에서 부분 부분의 명제들을 보통 **Component** 라고 부르며, 이러한 복합 명제에 대한 참, 거짓 여부를 판단하고 싶을 때 **Truth Table(진리표)**를 사용하면 쉽게 검토할 수 있다.

### Truth Table

각각의 결합자들을 사용한 복합 명제에 대해 진리표를 그려보자.

$\lnot p$
| p | ¬p |
|---|----|
| T | F  |
| F | T  |

$p\land q$
| p | q | p ∧ q |
|---|---|--------|
| T | T |   T    |
| T | F |   F    |
| F | T |   F    |
| F | F |   F    |

$p\lor q$
| p | q | p ∨ q |
|---|---|--------|
| T | T |   T    |
| T | F |   T    |
| F | T |   T    |
| F | F |   F    |

여기서 각각의 가능한 경우, 성분들의 가능한 참, 거짓의 조합을 **Logical Possibilities(논리적 가능성)** 라고 하며, and, or 에 대한 논리적 가능성은 4가지, not 에 대한 논리적 가능성은 2가지 이다.

### Logically Equivalent

단순 명제 p, q 이거나 합성명제인 P, Q에 대한 모든 논리적 가능성의 경우 진리값이 같으면 P, Q는 **Logically Equivalent(논리적 동치)** 또는 그냥 동치라고 한다. $P\equiv Q$ 로 나타내게 된다.

예를 들어 다음 복합 명제끼리 equivalent 임을 볼 수 있다.

$$p\lor q \equiv \lnot(\lnot p\land \lnot q)$$

> 진리표를 그려보면 각각의 logical possibilities 에 대해 모든 결과 값이 동일함을 볼 수 있다.

### Conditional Truth Table

'이면' 을 나타내는 $\rightarrow$ 기호는 **Conditional(조건부)** 기호라고 부르며, $p\rightarrow q$ 의 진리표는 다음과 같다.

| p | q | ¬q | p ∧ ¬q | p → q := ¬(p ∧ ¬q) |
|---|---|----|--------|--------|
| T | T |  F |   F    |   T    |
| T | F |  T |   T    |   F    |
| F | T |  F |   F    |   T    |
| F | F |  T |   F    |   T    |

여기서 p 이면 q 이다. 라는 것은 전자의 명제가 참일 경우에만 따지는데, p가 거짓인 경우에는 그런 경우를 관심으로 두지 않기 때문에 논하는 것은 무의미하다. 따라서 생각조차 하지 않는데, 이를테면 다음과 같은 명제이다:

> 저 사람이 태양이면 나는 바람이다.

사람이 태양일리 없으므로 이런 명제는 생각조차하지 않는다. 하지만 이 두 논리적 가능성은 결과적으로 참이라고 둔다(정의다).

### Biconditional Truth Table

쌍화살표 라고 보통 많이 보았을텐데, **Biconditional(쌍조건부)**라고 읽고, 기호로 $p\leftrightarrow q$ 로 쓸 수 있다. $(p \rightarrow q) \land (p \leftarrow q)$ 와도 같다. 진리표는:

| p | q | p → q | p ← q | p ↔ q |
|---|---|--------|--------|--------|
| T | T |   T    |   T    |   T    |
| T | F |   F    |   T    |   F    |
| F | T |   T    |   F    |   F    |
| F | F |   T    |   T    |   T    |

### Tautology

모든 논리적 가능성에 대해 참인 것을 Tautology(항진)이라고 한다.

다음은 다 항진일 것이다.
- $p \lor ~p$
- $p \leftrightarrow p$

항진은 기호로 보통 소문자 t로 둔다.

#### Implication

$P \rightarrow Q$ 가 t일 때, $P \implies Q$ 라고 하고, P 는 Q를 함의한다. 라고 읽는다. 여기서 화살표 기호의 결합력이 or, and 의 결합력보다 더 느슨하므로 보통 $p \rightarrow (p\lor q)$ 을 $p \rightarrow p\lor q$ 로 쓴다. 또한 $\lnot$ 은 $\lor, \land$ 보다 쎄다.

> 결합력 순위 $\lnot > \land, \lor > \rightarrow, \leftarrow, \leftrightarrow$  
> 위와 같이 진리표를 그려나가야 한다.

어쨋든 함의가 나왔다는 것은 그 복합 명제가 무조건 항진임을 뜻한다.

##### Theorem

- Law of Addition(Add.): $p \implies p \lor q$
- Laws of Simplification(Simp.): $p\land q \implies p$, $p\land q \implies q$
- Disjunctive Syllogism(D.S.): $(p\lor q) \land \lnot p \implies q$

#### Equivalence

---

## ✒️ 용어

###### 

---

## 🔗 관련 출처
- []()
