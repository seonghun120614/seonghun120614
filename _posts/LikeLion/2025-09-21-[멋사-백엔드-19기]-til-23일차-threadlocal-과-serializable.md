---
layout: post
title:  "[멋사 백엔드 19기] TIL 23일차 ThreadLocal 과 Serializable"
date:   2025-09-21 15:57:28 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java
---

<!--more-->

## 📂 목차
- [ThreadLocal](#threadlocal)
    - [Member Variables](#member-variables)
    - [ThreadLocalMap](#threadlocalmap)
- [sealed](#sealed)
- [Serializable 의 재현성](#serializable-의-재현성)
- [DTO 와 DAO](#dto-와-dao)

---

## 📚 본문

프로젝트 진행에 있어 다양한 자바의 내장 클래스들을 살펴보면서 코드를 업그레이드 하기 위해 본다.

### ThreadLocal

{% highlight java %}
public class ThreadLocal<T>
{% endhighlight %}

- T 타입을 가지는 스레드 로컬 변수를 구현한다.
- 각 스레드마다 독립적인 값을 저장하는 것이 핵심이며,
- 다른 스레드와 공유되지 않는다

> 이때 스레드마다 하나의 ThreadLocal 을 가진다는 말은 거짓이다. 1:n 의 관계다

#### Member Variables

{% highlight java %}
private static final boolean TRACE_VTHREAD_LOCALS = traceVirtualThreadLocals();
private final int threadLocalHashCode = nextHashCode();
private static final AtomicInteger nextHashCode = new AtomicInteger();
private static final int HASH_INCREMENT = 0x61c88647;
{% endhighlight %}

- `threadLocalHashCode`: 각 ThreadLocal 인스턴스 별 고유 해시 값 -> 해시 맵에서 key 로 사용하게 된다.
- `nextHashCode` & `HASH_INCREMENT`: 해시 충돌 최소화를 위한 고유값을 생성
    - 여기서 `HASH_INCREMENT` 의 `0x61c88647` 은 황금 비율 상수이며, 연속 생성되는 `ThreadLocal` 에서도 충돌을 최소화하는 상수이다.

**HASH_INCREMENT**
{% highlight java %}
private static int nextHashCode() {
    return nextHashCode.getAndAdd(HASH_INCREMENT);
}
{% endhighlight %}

위 메서드에서 `HASH_INCREMENT` 를 통해 다음 `hashCode` 를 가져오는것을 볼 수 있는데 연속되게 생성되는 `ThreadLocal` 속에서 `hashCode` 값의 충돌을 최소화 하려면 누적하여 더해지는 값마다 다른 값을 나타내게 해야 하며, 이때 `HashMap` 에서는 동일 값에 대한 충돌이 없이 잘 퍼지도록 설계할 수 있게 된다.

따라서 `ThreadLocalMap` 에서 키 값에 대한 황금비를 계속 더하며 슬롯 충돌을 최소화하게 되며, 2의 제곱 크기의 배열에서 고유 ID 가 균등하게 퍼지도록 해준다.

{% highlight java %}
protected T initialValue() {
    return null;
}

public static <S> ThreadLocal<S> withInitial(Supplier<? extends S> supplier) {
    return new SuppliedThreadLocal<>(supplier);
}
{% endhighlight %}

기본 초기값은 null 이 되지만, `SuppliedThreadLocal` 팩터리 패턴으로 초기화를 할 수 있다. 우리는 `withInitial` 을 통해 초기화 할 수 있다.

{% highlight java %}
public T get() {
    return get(Thread.currentThread());
}

private T get(Thread t) {
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null) {
            @SuppressWarnings("unchecked")
            T result = (T) e.value;
            return result;
        }
    }
    return setInitialValue(t);
}
{% endhighlight %}

값 읽기에 해당하는 메서드이다. 두 번째 메서드는 `ThreadLocalMap` 에서 값 검색을 하며, 없으면 `initialValue()` 로 초기화 하여 저장하게 된다.

{% highlight java %}
public void set(T value) {
    set(Thread.currentThread(), value);
}
private void set(Thread t, T value) {
    ThreadLocalMap map = getMap(t);
    if (map != null) map.set(this, value);
    else createMap(t, value);
}
{% endhighlight %}

현재 스레드의 값을 토대로 `ThreadLocalMap` 의 값을 변경하게 된다. 여기서 this 가 의미하는 것이 바로 `hashCode` 가 되게 된다.

결국에는 `ThreadLocalMap` 이 핵심인데, 이를 더 살펴보자.

#### ThreadLocalMap

이 클래스는 `ThreadLocal` 안에 선언되어 있는 `static class` 이다. 밖에서는 그래서 참조를 할 수 없고, `ThreadLocalMap` 은 논리 스레드 마다 적어도 하나씩 존재함을 알 수 있다.

`ThreadLocalMap` 은 핵심 클래스 `Entry` 를 가진다. 

{% highlight java %}
static class Entry extends WeakReference<ThreadLocal<?>> {
    Object value;
    Entry(ThreadLocal<?> k, Object v) { super(k); value = v; }
}
{% endhighlight %}

엔트리는 `ThreadLocalMap` 의 슬롯을 추상화한 클래스이며, Key 를 약한 참조를 통해 ThreadLocal 객체가 없다면 null 을 반환한다. 이를 **[stale entry](#stale-entry)** 라고 한다.

특이한 것은 `ThreadLocal` 객체 그 자체로 Key 가 됨을 알 수 있다. 그렇다면 이게 어떻게 동작하는지 의문인데, 해당 key 는 `ThreadLocal` 에서의 hashCode 로 식별함을 볼 수 있었다.

{% highlight java %}
int index = key.threadLocalHashCode & (table.length - 1);
{% endhighlight %}

- key.threadLocalHashCode: 스레드 로컬 객체가 가진 고유 해시코드
- table.length - 1: 스레드 로컬 맵 내부 배열 크기를 통해 해시 값을 배열 인덱스로 변환

- key.threadLocalHashCode & (table.length - 1): % 대신 & 를 쓰는 이유는 table.length 가 2의 제곱이기 때문에 1을 뺀 값은 비트가 전부 1이 되고, 이는 % 의 결과랑 &의 결과랑 같게 된다.

{% highlight java %}
ThreadLocal<String> userId = ThreadLocal.withInitial(() -> "user1");
ThreadLocal<Integer> counter = ThreadLocal.withInitial(() -> 0);

Thread t = new Thread(() -> {
    System.out.println(userId.get());  // "user1"
    System.out.println(counter.get()); // 0

    userId.set("userA");
    counter.set(42);

    System.out.println(userId.get());  // "userA"
    System.out.println(counter.get()); // 42
});
t.start();
{% endhighlight %}

### sealed

Java 17 문법에서 도입된 문법으로 봉인된이라는 의미를 가진다.

{% highlight java %}
public abstract sealed class Reference<T>
    permits PhantomReference, SoftReference, WeakReference, FinalReference {
{% endhighlight %}

클래스 혹은 인터페이스가 상속 또는 구현 될 수 있는 범위를 제한하는 문법이다.

`permits` 예약어를 통해서 이를 상속하거나 구현하는 클래스의 범위를 제한시켜 명시적으로 지정된 클래스들만이 이를 사용할 수 있게 된다.

> Reference<T> 는 GC 와 밀접히 연결된 핵심 클래스라 임의의 사용자가 마음대로 상속해서 써버리게 되면 GC 시스템이 깨질 수 있기에 봉인해놓은 것.

### Serializable 의 재현성

`Serializable` 을 구현한다고 해서, 재현성을 얻는 것은 아니다. 클래스의 구조가 바뀌거나 JVM 이 자동으로 새 `serialVersionUID` 을 계산하는데, 이 값은 JVM 마다 컴파일 환경마다 달라질 수 있기 때문에 그 때마다 `InvalidClassException` 의 예외가 발생할 수 있다.

{% highlight java %}
private static final long serialVersionUID = 어떤 값;
{% endhighlight %}

해당 값을 멤버 변수로 추가만 해준다면 역직렬화, 직렬화를 재현할 수 있게 되며, 클래스 구조가 조금 바뀌더라도 가능하게 된다.

> 무조건 static final 로 선언하자.

### DTO 와 DAO

`DAO` 는 `Data Access Object` 의 약자로, 실제로 DB 에 접근할 수 있는 권한을 가지는 객체이다. 즉, 얘는 실제 `Connection` 인터페이스를 가지고 있으며, 이 기능들을 제공해주는 애여야 함을 개념적으로 알 수 있다.

`DAO` 는 보통 `infrastructure` 패키지에 위치되어서 데이터베이스 접근을 전담하는 객체로 있는게 좋다.

- domain 쪽은 비즈니스 로직의 중심
- infrastructure 는 DB, 외부 API, 메시지 브로커 등 구체적 기술 의존성이 들어가는 곳

`DTO` 는 Data Transfer Object 이다. 데이터를 전달하기 위한 용도로만 쓰며, 불변이 특징인 객체이다. 따라서 보통 record 로 작성하면 편하며, equals, hashCode 등은 필수이다.

> 필자는 보통 Service <-> Controller 사이만 DTO 를 사용하고 Service 에서는 비즈니스 엔티티와 DTO 를 혼용하여 사용하였지만,  
이는 전역적으로 사용하는 클래스라 따로 빼는게 좋다.

---

## ✒️ 용어

###### Stale Entry

오래되거나 최신 상태가 아닌, 더 이상 유효하지 않은 데이터나 항목을 의미한다.