---
layout: post
title:  Custom Annotation
date:   2025-06-23 16:04:25 +0900
categories: ComputerScience Java
---

<!--more-->
개발자가 정의할 수 있는 코드의 동작에 직접 영향을 줄 수 있는 메타데이터를 보자.

## 🪛 한계점

기존 자바 어노테이션은 표준적인 용도에 국한되지만, 도메인 규칙이나 프로젝트별 특수한 요구사항을 반영하려면 개발자가 직접 어노테이션을 정의해야 하는 경우가 많다.

## 📂 목차
- [Annotation 정의](#annotation-정의)
    - [@Target](#target)
    - [@Retention](#retention)
    - [@Documented](#documented)
    - [@Inherited](#inherited)
- [Reflection을 활용한 커스텀 어노테이션 처리](#reflection을-활용한-커스텀-어노테이션-처리)
- [Reflection을 활용한 동적 프록시 설계](#reflection을-활용한-동적-프록시-설계)
    - [동적 프록시 설계 구현](#동적-프록시-설계-구현)
        - [Proxy Class 설계](#proxy-class-설계)
        - [⭐️Proxy Instance 생성](#️proxy-instance-생성)
            - [⭐️첫 번째 인자 설명](#️첫-번째-인자-설명)
            - [두 번째 인자 설명](#두-번째-인자-설명)
            - [세 번째 인자 설명](#세-번째-인자-설명)
- [Annotation Attribute 정의](#annotation-attribute-정의)

---

## 📚 본문

### Annotation 정의

`java.lang.annotation` 에 커스텀 어노테이션 정의에 필요한 기능들이 다 들어가 있다.

커스텀 어노테이션은 `@interface` 키워드로 선언되며, 이는 **클래스나 인터페이스에 부가적인 메타데이터를 제공하는 특수한 문법**이다. 어노테이션은 소스 코드의 의미를 확장하거나, **컴파일러 또는 런타임 프로세서**가 런타임에 특정 동작을 유도할 수 있도록 도와준다.


{% highlight java %}
@Target({ElementType.TYPE, ElementType.FIELD, ...}) // 적용 대상
@Retention(RetentionPolicy.RUNTIME)                // 유지 범위
@Documented                                         // javadoc 포함 여부
public @interface MyAnnotation {
    String value() default "";
    int count() default 0;
}
{% endhighlight %}


#### @Target

해당 어노테이션을 어디에 적용할지를 정한다.

- ElementType.FIELD: 필드에 적용
- ElementType.TYPE: 클래스, 인터페이스, enum 등에 적용
- ElementType.METHOD: 메서드에 적용
- ElementType.PARAMETER: 파라미터에 적용
- ElementType.CONSTRUCTOR: 생성자에 적용
...

#### @Retention

어노테이션의 lifecycle 을 어디까지 유지할지(**RetentionPolicy**) 정의한다.

JVM의 GC가 알아서 자원을 회수할 수 있도록 함.

- `RetentionPolicy.SOURCE`: 컴파일 까지만 존재하고, .class 파일에도 존재하지 않도록 함
- `RetentionPolicy.CLASS`: 컴파일 시 클래스 파일엔 남지만, JVM 런타임 시점에서는 참조가 불가능함
- `RetentionPolicy.RUNTIME`: 런타임에도 유지되어서 **[리플렉션(Reflection)](#reflection)** 가능, Bean Validation에는 필수로 들어가야 함
    - **Bean Validation**이나 **AOP**, **DI(의존성 주입)** 프레임워크들이 런타임에 어노테이션 정보를 읽어 동작하기 때문에 `RUNTIME` 설정은 필수이다.

Spring 프레임워크에서는 이 동적 프록시 기법을 사용해 **AOP(관점 지향 프로그래밍)**, **트랜잭션**, **Lazy loading** 등을 구현한다. 예를 들어, `@Transactional`이 붙은 메서드는 내부적으로 **프록시 객체가 DB 트랜잭션을 시작**하고, **예외 발생 시 롤백 처리를 수행**한다. 동적 프록시 기법은 이 밑에 다룬다.

#### @Documented

JavaDoc 문서 생성 시 포함되어야 함을 명시하고, 문서화가 필요한 공용 API를 만들 때 주로 사용한다.

#### @Inherited

자식 클래스에 상속시킬지 여부이다. 단, 필드/메서드에는 적용되지 않고 클래스 단위에서만 상속된다.

### Reflection을 활용한 커스텀 어노테이션 처리

Reflection은 그냥 메타 데이터를 읽을 수 있게 도와주는 패키지이다. Reflection 에서 제공하는 대표적인 기능들은 다음과 같다.

**핵심 기능**
- 클래스 로딩: `Class.forName(...)`
- 생성자 호출: `getDeclaredConstructor().newInstance()`
- 필드 접근/변경: `getDeclaredField()`, `setAccessible()`, `set()`
- 메서드 실행: `getDeclaredMethod()`, `invoke()`

실제로 밑과 같이 수행할 수 있다.

커스텀 어노테이션 정의
{% highlight java %}
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiredField {
    String message() default "This field is required.";
}
{% endhighlight %}

엔티티 클래스 정의
{% highlight java %}
public class User {
    @RequiredField
    private String name;

    private int age;
}
{% endhighlight %}

{% highlight java %}
public class ValidatorUtil {

    public static void validateRequiredFields(Object obj) throws IllegalAccessException {
        Class<?> clazz = obj.getClass();

        for (Field field : clazz.getDeclaredFields()) {
            if (field.isAnnotationPresent(RequiredField.class)) {
                field.setAccessible(true);
                Object value = field.get(obj);

                if (value == null) {
                    RequiredField ann = field.getAnnotation(RequiredField.class);
                    System.out.println("❌ Validation failed: " + ann.message());
                }
            }
        }
    }
}
{% endhighlight %}

### Reflection을 활용한 동적 프록시 설계

리플렉션을 활용하면 동적 프록시 설계에서 유용하게 쓸 수 있다.

이때 프록시라는 것은 클라이언트와 실제 객체 사이에서 상호작용을 관리하는 또 다른 객체로 보면 되겠다. 예를 들어 일상에서는 TV를 조종하기 위해서 우리는 리모컨을 사용하게 된다. 여기서 TV는 실제 객체이며, 우리는 클라이언트이다. 리모컨은 **proxy** 가 된다.

#### 동적 프록시 설계 구현

우선 인터페이스와, 실제 객체를 보자.

인터페이스 정의
{% highlight java %}
public interface AccountService {
    void deposit(int amount);
}
{% endhighlight %}

실제 객체 정의
{% highlight java %}
public class AccountServiceImpl implements AccountService {
    public void deposit(int amount) {
        System.out.println("💰 " + amount + "원 입금 완료");
    }
}
{% endhighlight %}

위는 우리가 조작하고 싶어하는 객체이다. 조작할 객체를 프록시로 연결시키자.


##### Proxy Class 설계
`InvocationHandler` 는 메서드를 호출할 때마다 invoke 라는 메서드가 중간에 가로채어서 실행할 수 있게 한다. 밑의 `InvocationHandler` 를 구현한 `LoggingHandler` 클래스 정의가 있고 여기서 handler 가 호출된다면, invoke가 실행된다.

{% highlight java %}
public class LoggingHandler implements InvocationHandler {
    private final Object target;

    public LoggingHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("🔍 호출 전: " + method.getName());
        Object result = method.invoke(target, args);
        System.out.println("✅ 호출 후: " + method.getName());
        return result;
    }
}
{% endhighlight %}

invoke로 오버라이딩 된 인자 proxy, method, args는 다음과 같은 의미를 가진다:
- proxy: 실제로 method.invoke()가 호출된 프록시 객체 자기 자신
- method: 호출된 메서드 정보(Method 클래스)
- args: 전달된 인자들

`InvocationHandler` 를 통해 실제 구현 객체와 클라이언트 사이에서 메서드를 수행하고 해당 메서드의 결과를 반환하도록 작성해주면 된다. 프록시를 만들기 위한 사전 설계가 끝난 상태이다. proxy 의 **`.getClass().getName()`** 을 하여서 이름까지 로깅에 출력해주면 더 좋다.


##### ⭐️Proxy Instance 생성

밑에서 Proxy Class 의 `newProxyInstance()` 통해 새로운 proxy 인스턴스를 만든다.

{% highlight java %}
AccountService target = new AccountServiceImpl();

AccountService proxy = (AccountService) Proxy.newProxyInstance(
        target.getClass().getClassLoader(),
        new Class[]{AccountService.class},
        new LoggingHandler(target)
);

proxy.deposit(5000);
{% endhighlight %}

반환하게 되는 것은 **`Object`** 이기 때문에 **강제 캐스팅** 수행을 통해 맞는 메서드를 수행 할 수 있도록 바꾼다.

###### ⭐️첫 번째 인자 설명

우선 이 프록시 설계는 **런타임 도중**에 **JVM**이 **'직접'** 생성해야한다(RAM에 적재시켜야 한다). 이때 JVM은 **프록시 클래스를 메모리에 로딩할 위치(클래스로더)**를 알아야 한다. **“어디서 로딩할지를 알려줘야”** 하므로 우리는 첫번째 인자를 클래스 로더를 입력하게 된다.

여기서 첫 번째 인자로 타겟 객체의 **Class Loader**를 그대로 사용하는 것이 일반적인데, 이렇게 하면 **JVM은 실제 구현체가 로딩된 환경과 동일한 위치에 프록시 클래스도 함께 로딩시킬 수 있게 되**고 **클래스 충돌이나 접근 제한을 방지**하는 데에도 유리하게 된다.

정리하면 여기서는 실제 객체인 target의 **Class Loader** 에다가 **Proxy Class** 를 올리기 위해 JVM이 해당 Class Loader를 찾아서 Proxy Class를 올리게 된다.

###### 두 번째 인자 설명

`new Class[]`에서는 생성할 프록시 객체가 어떤 인터페이스를 구현할 것인지를 명시한다.
해당 인터페이스를 기반으로 프록시 클래스가 생성되기 때문에, 반드시 구현할 대상 인터페이스를 지정해주어야 한다.

예를 들어, `AccountService` 인터페이스를 구현하도록 지정하면 프록시는 `AccountService`의 모든 메서드를 위임 처리할 수 있게 된다.

여러 개의 인터페이스도 동시에 지정할 수 있다. 예를 들어 `PaymentService` 등을 함께 등록하면, 프록시 확장성 및 재사용성이 높은 설계를 할 수 있다.

###### 세 번째 인자 설명

마지막 인자는 InvocationHandler를 구현한 객체를 넘겨주는 부분이다. 이 핸들러는 프록시 객체의 메서드가 호출될 때 중간에서 가로채는 역할을 수행한다.

핸들러 내부에서는 호출된 메서드 정보를 확인하고, 원하는 작업(**로깅, 보안 검사, 트랜잭션 처리** 등)을 수행한 뒤 실제 타겟 객체의 메서드를 실행시키고 그 결과를 반환한다.

이러한 구조를 통해 공통 기능을 프록시 레벨에서 일관성 있게 주입할 수 있게 된다.


### Annotation Attribute 정의

애너테이션 안에는 멤버 변수, 메서드가 존재하지 않는다. 대신에 attribute(element) 가 존재한다.

> 타입 이름();
> 타입 이름() default 값;

으로 attribute를 annotation 안에 정의할 수 있다. 또한 애너테이션은 다음 타입들을 속성으로 사용할 수 있다:

- primitives: int, long, float, boolean, double, char, byte, short, ...
- String
- Class<?>
- Enum
- Annotations
- 위 타입들에 대한 Class<?>[] 배열

{% highlight java %}
public @interface PrimitiveAttr {
    int age() default 0;
    boolean enabled() default true;
}
{% endhighlight %}

{% highlight java %}
public @interface StringAttr {
    String name() default “guest”;
}
{% endhighlight %}

{% highlight java %}
public @interface ClassAttr {
    Class<?> targetClass();
}
{% endhighlight %}

{% highlight java %}
public enum Level {
    LOW, MEDIUM, HIGH
}

public @interface EnumAttr {
    Level level() default Level.MEDIUM;
}
{% endhighlight %}

{% highlight java %}

public @interface MetaInfo {
    String value();
}

public @interface AnnotationAttr {
    MetaInfo info();
}
{% endhighlight %}

{% highlight java %}
public @interface ArrayAttr {
    String[] tags() default {};
    int[] numbers() default {1, 2, 3};
    Class<?>[] classes() default {};
}
{% endhighlight %}

---

## ✒️ 용어

###### Reflection

`java.lang.reflect`에서 런타임 시점에 클래스, 메서드, 필드, 생성자 등에 접근하고 조작할 수 있는 기능을 말하며, 일반적으로 코드 작성 시에 컴파일 타임에 어떤 클래스나 메서드를 호출할 지 결정하지만, 리플렉션은 실행 중에 동적으로 객체의 구조를 분석하여 수정할 수 있다.

{% highlight java %}
Class<?> clazz = Class.forName("com.example.User");

Object obj = clazz.getDeclaredConstructor().newInstance();

Field field = clazz.getDeclaredField("name");
field.setAccessible(true); // 접근 제어자 무시
field.set(obj, "홍길동");

Method method = clazz.getDeclaredMethod("getName");
Object result = method.invoke(obj);
System.out.println(result);  // "홍길동"
{% endhighlight %}

- setAccessible
- isAnnotationPresent
- getAnnotation
- Proxy.newProxyInstance

등등을 사용할 수 있다.