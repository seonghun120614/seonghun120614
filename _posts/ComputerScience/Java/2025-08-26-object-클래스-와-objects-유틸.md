---
layout: post
title:  Object 클래스 와 Objects 유틸
date:   2025-08-26 15:40:05 +0900
categories: ComputerScience Java
---

<!--more-->

## 📂 목차

- [Object](#object)
- [Objects](#objects)
    - [Object.equals(Object o)](#objectequalsobject-o)

---

## 📚 본문

### Object

모든 클래스의 수퍼 클래스이며, 보통 오버라이드하여 객체 동작을 커스터마이징한다.

**메서드**
- `toString()`: 객체를 문자로 표현하는 법 정의
- `equals(Object obj)`: 객체 비교 방법 정의
- `hash(Object... o)`:
- `hashCode()`: 객체 해시코드 반환
- `getClass()`: 객체의 `Runtime` 클래스 정보 반환
- `clone()`: 객체 복제 방법 정의(**깊은/얕은 복사** 가능)
- `finalize()`: GC가 객체를 수거하기 전에 호출
- `wait()`, `notify()`, `notifyAll()`: 스레드 동기화에 사용

### Objects

Object 를 다루기 위한 유틸성 함수들을 저장한다.

- `hash(Object... o)`: 여러 오브젝트로부터 하나의 해시코드를 만들어주는 유틸리티이다.
- `<T> T requireNonNull(T obj, String message)`: `null` 인지를 체크하고 아니면 반환한다. 만약 `null` 이라면 `message` 를 품은 `NullPointerException` 을 던진다
- `<T> T requireNonNullElse(T obj, T defaultObj)`: `null` 이라면 `defaultObj` 를 반환해주고 아니라면 그냥 해당 객체를 반환한다.
- `<T> int compare(T a, T b, Comparator<? super T> c)`: a와 b를 비교하고 a가 더 작으면 음수를 b가 더 작으면 양수를 반환하는 함수이다.

- `boolean deepEquals(Object a, Object b)`: 다차원의 Object 에 대한 깊이 있는 동등성을 비교한다.


#### Object.equals(Object o)

이번에는 `equals(Object o)` 에 대해 더 살펴본다. 개발자는 종종 `Object.equals()` 메서드를 오버라이드(override)하여 객체 고유의 동등성(equality) 기준을 정의해야 하는 순간이 온다. 이때 `equals()` 를 오버라이드할 때는 다음과 같은 5가지 **계약(contract)**을 준수해야 한다:

- 반사성(Reflexive): 모든 null이 아닌 참조 값 x에 대해, x.equals(x)는 true 여야 한다.
- 대칭성(Symmetric): 모든 null이 아닌 참조 값 x와 y에 대해, x.equals(y)가 true일 때만 y.equals(x)도 true여야 한다.
- 추이성(Transitive): 모든 null이 아닌 참조 값 x, y, z에 대해, x.equals(y)가 true이고 y.equals(z)가 true이면, x.equals(z)도 true여야 한다.
- 일관성(Consistent): 모든 null이 아닌 참조 값 x와 y에 대해, x.equals(y)를 반복적으로 호출해도 일관적으로 같은 값을 반환해야 한다.
- Null과의 비교: 모든 null이 아닌 참조 값 x에 대해, x.equals(null)은 false여야 한다.
- hashCode 오버라이딩: equals 를 구현하려면 해시코드를 오버라이딩 해야 한다.

위를 고려하여 코딩하자.

{% highlight java %}
class Car {
    private String brand;

    public Car(String brand) {
        this.brand = brand;
    }

    @Override
    public boolean equals(Object o) {
        // 1. 같은 객체인지 확인
        if (this == o) return true;
        // 2. null이거나 타입이 다른지 확인
        if (o == null || getClass() != o.getClass()) return false;
        // 3. 필드 값 비교
        Car car = (Car) o;
        return Objects.equals(brand, car.brand);
    }

    @Override
    public int hashCode() {
        return Objects.hash(brand);
    }
}
{% endhighlight %}