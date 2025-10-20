---
layout: post
title:  "[멋사 백엔드 19기] TIL 35일차 Spring Core Container"
date:   2025-10-14 11:29:18 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차
- [Spring Core](#spring-core)
    - [IoC](#ioc)
        - [Dependency Injection](#dependency-injection)
    - [Bean](#bean)
        - [Bean 등록](#bean-등록)
        - [Bean Scope](#bean-scope)
    - [ComponentScan](#componentscan)
        - [Annotation 정의](#annotation-정의)
        - [@SpringBootApplication](#springbootapplication)
        - [ComponentScan 어노테이션 정의](#componentscan-어노테이션-정의)
        - [SpringBootApplication 의 ComponentScan](#springbootapplication-의-componentscan)
    - [@Configuration](#configuration)
        - [⭐️ @Configuration 의 CGLIB 프록시 메서드 proxyBeanMethods()](#️-configuration-의-cglib-프록시-메서드-proxybeanmethods)
    - [@Scope 애너테이션으로 Bean 생명주기와 공유 범위 제어](#scope-애너테이션으로-bean-생명주기와-공유-범위-제어)
        - [@PostConstruct 와 @PreDestroy 사용하여 생명주기에 대한 로그 찍어보기](#postconstruct-와-predestroy-사용하여-생명주기에-대한-로그-찍어보기)
    - [Properties 를 사용해 키 값을 Config 로 등록하기](#properties-를-사용해-키-값을-config-로-등록하기)
        - [@Value 로 프로퍼티 주입해보기](#value-로-프로퍼티-주입해보기)
        - [@ConfigurationProperties 를 사용해 key 를 기준으로 값 들고오기](#configurationproperties-를-사용해-key-를-기준으로-값-들고오기)
    - [DI 시 주의점](#di-시-주의점)
        - [@Lazy](#lazy)
    - [Spring Application 의 실행 과정 중 실행 코드 넣기](#spring-application-의-실행-과정-중-실행-코드-넣기)
        - [CommandLineRunner](#commandlinerunner)
    - [⭐️ Spring Event System](#️-spring-event-system)
        - [Asynchronized Event 로 구성하기](#asynchronized-event-로-구성하기)
        - [Transaction Event Listener](#transaction-event-listener)
        - [Spring 내장 EventListener](#spring-내장-eventlistener)

---

## 📚 본문

### Spring Core

IoC, DI 에 대해 살펴본다.

#### IoC 

객체의 생성과 의존성 관리를 개발자가 직접하는 것이 아니라 프레임워크가 대신 관리해주는 원리를 IoC 라고 한다.

전통적으로는 new 를 통해 객체의 생성과 의존성을 개발자가 관리했지만, 프레임워크가 객체를 생성하고 연결시키는 책임을 받게 된다.

**장점**
- 객체 간 결합도를 낮추고, 유지보수를 쉽게 할 수 있음
- 코드 재사용성을 높이고 테스트를 쉽게 할 수 있음

IoC 를 달성하기 위해서는 주로 **DI(Dependency Injection)** 기술로 구현하게 된다.

##### Dependency Injection

스프링에서는 3가지의 의존성 주입이 있다. 마지막 방식은 안쓰이니 그냥 삭제한다.

**생성자 주입**

{% highlight java %}
@Component
public class Car {
    private final Engine engine;

    @Autowired
    public Car(Engine engine) {
        this.engine = engine;
    }
}
{% endhighlight %}

**세터 주입**

{% highlight java %}
@Component
public class Car {
    private Engine engine;

    @Autowired
    public void setEngine(Engine engine) {
        this.engine = engine;
    }
}
{% endhighlight %}

> 생성자가 하나인 경우에는 `@Autowired` 를 생략 가능하다.

#### Bean

`IoC` 가 관리하는 객체를 `Bean` 이라고 하고, 이 Bean 이 살고 있는 곳이 IoC 컨테이너이다. Bean 은 그냥 구현체이며 Bean 으로 등록된 객체들은 다음 특징을 가진다:
- 생명주기 관리 대상: IoC 컨테이너가 객체의 생성부터 소멸까지 관리
- 재사용 가능: 필요할 때마다 컨테이너에서 가져다 쓸 수 있음
- 의존성 주입 지원: 다른 Bean 과 연결할 때 DI 를 통해 주입 가능

결국에는 `Bean` 으로 등록되어야 DI 의 대상이 된다는 것이다.

##### Bean 등록

IoC 컨테이너에 Bean 을 등록하기 위해 3가지 방법이 있다.

**어노테이션 기반**
{% highlight java %}
@Component      // 일반적인 Bean
@Service        // 비즈니스 로직 Bean
@Repository     // DAO Bean
@Controller     // MVC Controller Bean
{% endhighlight %}

**Java Config 기반**
{% highlight java %}
@Configuration
public class AppConfig {

    @Bean
    public Car car() {
        return new Car(engine());
    }

    @Bean
    public Engine engine() {
        return new Engine();
    }
}
{% endhighlight %}

> 함수를 빈으로 하여서 함수 시그니처(함수명, 반환값) 을 토대로 의존성 주입을 할 수 있다. `ApplicationContext.getBean()` 메서드를 통해 들고 올 수 있다.

**XML 기반**

옛날 방식이며 지금은 잘 안쓰인다.

{% highlight xml %}
<bean id="car" class="com.example.Car"/>
<bean id="engine" class="com.example.Engine"/>
{% endhighlight %}

##### Bean Scope

보통 `Bean` 으로 등록된 객체들은 `Singleton` 패턴을 따르게 된다. 따라서 `@Bean`, `@Component`, `@Service` 등등에는 다음 어노테이션이 포함되어 있다.

{% highlight java %}
@Component
@Scope("singleton") // 생략 가능, 기본값이 singleton
public class Car { }
{% endhighlight %}

`@Scope` 어노테이션은 인자로 다음을 넣을 수 있다.

- `prototype`: 요청할 때마다 새로운 Bean 생성
- `request`: HTTP 요청 당 하나의 Bean 생성
- `session`: HTTP 세션 당 하나의 Bean 생성
- `application`: `ServletContext` 범위에서 하나의 Bean 생성
- `websocket`: `WebSocket` 세션 당 하나의 Bean 생성

#### ComponentScan

빈만 이렇게 선언해놓고 전부 등록된다면 정말 좋겠지만, Bean 들이 각 파일들로 흩어져 있는 것을 Spring Boot 가 일일히 전부 들어가서 찾아내진 않는다. 우리가 찾을 범위를 지정해주어야 한다. 이를 `ComponentScan` 어노테이션이 하는 일인데 이는 `SpringBootApplication` 어노테이션이 가지고 있으므로 그 내부를 파헤쳐보자.

##### Annotation 정의

자바에서는 특별한 형태의 인터페이스가 있는데 바로 애너테이션이다. 애너테이션은 보통 클래스, 메서드, 필드 등에 대한 **부가 정보(메타 데이터)**를 제공하고 싶을 때 사용하는 문법이며, 프로그램의 실행 로직에는 직접 영향을 주지 않지만, 컴파일러나 프레임워크가 해석할 때 특별한 동작을 수행하도록 할 수 있다. 즉, **런타임 이전에 특수한 동작을 하여 런타임 때 의도한 동작을 수행하도록 할 수 있다**는 것이다.

애너테이션의 선언은 다음과 같다.

{% highlight java %}
// @interface 가 선언 키워드
public @interface MyAnnotation {
    String value(); // <- 속성임, 요소라고도 불림
    int count() default 1; // default 로 기본값 지정 가능
}
{% endhighlight %}

개념을 보자면 애너테이션 정의 내부에 들어가는 함수를 보통 속성 이라고 하며 이 속성은 필드와 유사하여 어노테이션의 소괄호 블록에 들어갈 인자로 사용되게 된다.

여기서 `value()` 는 무조건 있어야 하며, `@MyAnnotation("value 입니다.")` 처럼 붙일 수 있다(암묵적 표기). 명시적으로 다음과 같이 선언하는 것도 동일한 결과이다.

{% highlight java %}
@MyAnnotation("value 입니다.") // == @MyAnnotation(value = "value 입니다.")
class Hello {
    ...
{% endhighlight %}

특히 애너테이션을 정의할 때 그 위에 붙이는 자주 쓰이는 메타 애너테이션 4개가 있다.

**Meta Annotation**
- `@Target`: 애너테이션을 붙일 수 있는 범위 지정, `ElementType` 열거형 클래스를 통해 상수 설정
    - `ElementType.TYPE`
    - `ElementType.FIELD`
    - `ElementType.PARAMETER`
    - `ElementType.CONSTRUCTOR`
    - `ElementType.ANNOTATION_TYPE`
    - `ElementType.PACKAGE`
    - 기본값은 모든 곳 사용 가능
- `@Retention`: 애너테이션의 생명주기가 어디까지 유지가 되는지 `RetentionPolicy` 설정
    - `RetentionPolicy.RUNTIME`
    - `RetentionPolicy.CLASS`
    - 기본값은 `CLASS`
- `@Documented`: javadoc 등 문서에 포함되도록 표시
    - 기본값은 docs 에 안나타나도록
- `@Inherited`: 이 애너테이션이 서브 클래스에 자동 상속되도록 함
    - 기본값은 없는 걸로, 상속되지 않는게 기본값

위를 토대로 아래를 읽어보자.

##### @SpringBootApplication

스프링부트 어플리케이션 애너테이션은 `@SpringBootConfiguration` 을 가지며, 이 `Configuration` 은 위에 배웠던 IoC 의 기술 중 한 방법으로 Config 방식임을 볼 수 있다.

{% highlight java %}
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Inherited

@SpringBootConfiguration
@EnableAutoConfiguration
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
public @interface SpringBootApplication {
{% endhighlight %}

여기서 `SpringBootConfiguration` 이 있음을 볼 수 있는데, `SpringBootConfiguration` 은 다시 `@Configuration` 애너테이션이 붙어있음을 볼 수 있다. 즉,` @SpringBootConfiguration` 자체가 스프링 설정 클래스로 인식을 하며, 추가로 `@SpringBootConfiguration` 은 인자로 `proxyBeanMethods` 를 받을 수 있으며, `true`, `false` 를 가짐을 볼 수 있다.

> `proxyBeanMethods` - [CGLIB 프록시](#cglib-프록시)를 통해 `@Bean` 메서드 간 호출 시 싱글톤 보장, true 가 기본값이며, 이때 `Bean` 들은 `Singleton` 이게 됨

또 `ComponentScan` 이 있음을 볼 수 있다. 이름 그대로 컴포넌트들을 스캔하는 방식을 지정하는 역할을 한다.

##### ComponentScan 어노테이션 정의

`SpringBootApplication` 이 쓰는 `ComponentScan` 어노테이션을 이해하기 전에 `ComponentScan` 을 파헤쳐보자

{% highlight java %}
@AliasFor("basePackages")
String[] value() default {};

@AliasFor("value")
String[] basePackages() default {};

Class<?>[] basePackageClasses() default {};

Filter[] includeFilters() default {};

Filter[] excludeFilters() default {};

boolean lazyInit() default false;
{% endhighlight %}

자주 쓰이는 것들만 모았다. 우선 `AliasFor` 은 "이 속성은 다른 속성과 의미적으로 동일하다" 라는 의미를 가지는 어노테이션임을 알려준다. 따라서 `value=` 로 하던 `basePackages=` 로 선언하던 동일하다(value 이기에 명시적 속성 표기 생략 가능).

- `basePackages`: `String[]` 을 인자로 받고, `package` 명들을 넣어주면 해당 패키지들을 스캔 
대상으로 `Component` 들을 가져오게 된다.

- `basePackageClasses`: 위 기능과 유사하지만 단위를 클래스 별로 가져오게 할 수 있다. `@ComponentScan(basePackageClasses = MyApp.class)`, 문자열보다는 컴파일 단계에서 타입 안전성을 보장 받기 때문에 안전하다

- `includeFilters`: `ComponentScan` 내부에 선언되어져 있는 `Filter` 어노테이션 을 보면 알 수 있다. 예제를 보면서 설명한다.

**Filter 어노테이션 정의**
{% highlight java %}
@Retention(RetentionPolicy.RUNTIME)
@Target({})
@interface Filter {
    FilterType type() default FilterType.ANNOTATION;
    Class<?>[] classes() default {};
    String[] pattern() default {};
}
{% endhighlight %}

위는 필터 가 정의되어 있는 방식을 볼 수 있다.

- `type`: 필터를 거를 방식에서 조건의 대상에 대한 형태를 정한다.
- `classes`: 그 type 을 가지는 class 를 넣어준다.
- `pattern`: 클래스 이름을 기준으로 정규식(Regex) 매칭, 배열 가능

이제 컴포넌트 스캔을 보자.

{% highlight java %}
@ComponentScan(
    includeFilters = @ComponentScan.Filter(
        type = FilterType.ANNOTATION,
        classes = CustomAnnotation.class
    )
)
{% endhighlight %}

`type` 은 필터 방식을 지정하는 옵션인데 아래에 정리해 두었다, `classes` 로 `@CustomAnnotation` 이 붙은 클래스도 Bean 등록 대상에 포함하겠다는 의미이다.

- `FilterType.ANNOTATION`: 지정한 애너테이션이 붙은 경우에만 필터
- `FilterType.ASSIGNABLE_TYPE`: 지정한 클래스 또는 그 자식 클래스만 필터
- `FilterType.REGEX`: 클래스 이름이 정규식과 매칭되는 경우 필터
- `FilterType.ASPECTJ`: `AspectJ` 라는 표현식에 맞는 필터
- `FilterType.CUSTOM`: `TypeFilter` 를 구현한 커스텀 필터 클래스 사용

따라서 맨 위 `includeFilters` 는 `CustomAnnotion` 이 붙은 클래스만 포함하겠다 라는 의미가 된다.

- `excludeFilters`: include 와 동일하지만 제외하는 경우다

> `ComponentScan` 은 그냥 스캔만 할 뿐이다. 해당 어노테이션이 붙었다고 하여서 그 클래스가 Bean 으로 등록되는건 아니다. 따라서 다음과 같이 사용한다고 하여서 config 가 bean 으로 등록되진 않는다.

{% highlight java %}
@ComponentScan(basePackages = {"sample"})
public class UserConfig { }
{% endhighlight %}

##### SpringBootApplication 의 ComponentScan

아래 애너테이션을 토대로 `SpringApplication` 이 컴포넌트를 읽게 된다. 컴포넌트를 읽는 범위는 **자기 자신 클래스가 있는 패키지와 그 하위 패키지를 기본적으로 스캔하는 방식**이다.

{% highlight java %}
@ComponentScan(excludeFilters = { @Filter(type = FilterType.CUSTOM, classes = TypeExcludeFilter.class),
		@Filter(type = FilterType.CUSTOM, classes = AutoConfigurationExcludeFilter.class) })
{% endhighlight %}

`CUSTOM` 으로 `Filter` 타입이 지정되었다면, `classes` 에 오는 클래스들은 전부 `TypeFilter` 인터페이스를 구현하는 클래스가 와야 한다.

{% highlight java %}
@FunctionalInterface
public interface TypeFilter {

    boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
            throws IOException;
}
{% endhighlight %}

타입 필터는 `match` 를 구현하도록 되어 있다. 이제 `SpringBootApplication` 에서의 `TypeExcludeFilter` 를 보자.

{% highlight java %}
public class TypeExcludeFilter implements TypeFilter, BeanFactoryAware {
...(중간 생략)

@Override
public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
        throws IOException {

    if (this.beanFactory instanceof ListableBeanFactory 
    && getClass() == TypeExcludeFilter.class) {

        for (TypeExcludeFilter delegate : getDelegates()) {

            if (delegate.match(metadataReader, metadataReaderFactory)) return true;
        }
    }
    return false;
}
{% endhighlight %}

각 클래스에서 필터 조건에 해당하는지 확인하는 매서드인데, true 면 스캔에서 제외되고, `false` 면 포함되는 형태이다. 인자를 먼저 보자.

- `metadataReader`: 현재 검사 중인 클래스의 메타데이터(클래스명, 어노테이션 등) 을 읽어들이는 객체
- `metadataReaderFactory`: 다른 클래스 정보를 가져오는 도구

1. beanFactory 가 `ListableBeanFactory` 인지 확인
    - Bean 목록을 조회할 수 있는 타입인지 체크한다.
2. 현재 객체가 정확히 `TypeExcludeFilter` 클래스인지 확인
    - `getClass() == TypeExcludeFilter.class`

따라서 기본 `TypeExcludeFilter` 만 처리하고, **서브 클래스는 여기서 패스**하게 된다.

> 필터도 여러 개 일텐데 TypeExcludeFilter 인 애만 처리하고 그 하위 클래스는 넘어가겠다는 의미이다.

`AutoConfigurationExcludeFilter` 에 대한 것도 그러면 유추해볼 수 있을 것이다. Spring Boot 에서는 기본적으로 IoC 에 대한 자동적인 Bean 설정이 들어가기에 내부 구현을 따로 읽어서 어떤걸 제외시키고 있는지 보면 될 것이다.

이렇게 `SpringBootApplication` 이 동작하게 된다.

#### @Configuration

이제 `Configuration` 을 이해할 수 있다. `Configuration` 의 의미는 구성, 설정이다. 구성은 객체 간의 이루어져있는 다이어그램 형태를 의미할 수 있다. Spring 에서의 객체는 Bean 이기 때문에 Bean 간의 이루어져있는 관계들을 말할 수 있다. 따라서 `Configuration` 애너테이션은 Bean 의 구성 관계들을 전부 아우르는 책임을 가지는 클래스여야 한다. 따라서 `@Configuration` 과 `@Bean` 애너테이션을 통해 이 클래스는 configuration 이며, 그 내부에 bean 들을 토대로 구성 설정을 할 것이다 라는 의미이다.

{% highlight java %}
@Configuration
public class AppConfig {

    @Bean
    public Engine engine() {
        return new Engine();
    }

    @Bean
    public Car car() {
        // car는 engine Bean을 의존
        return new Car(engine());
    }
}
{% endhighlight %}

따라서 `SpringBootApplication` 에 `SpringBootConfiguration` 애너테이션이 들어가 있었음을 알 수 있다.

##### ⭐️ @Configuration 의 CGLIB 프록시 메서드 proxyBeanMethods()

실습을 하면서 느꼈던 의아했던 점을 적어본다. 중요한 내용일 수 있고, IoC 의 핵심 동작 부분을 건드린거 같기도 하다.

{% highlight java %}
@Configuration
public class OrderConfig {
	@Bean
//	@Scope("prototype")
	public Drink coffee() {
		return new Coffee();
	}

	@Bean
//	@Scope("prototype")
	public Drink tea() {
		return new Tea();
	}

	@Bean
//	@Scope("singleton")
	public OrderHistory orderHistory() {
		return new OrderHistory();
	}

	@Bean
	@Scope("prototype")
	public OrderService orderService() {
		return new OrderServiceImpl(orderHistory());
	}
}
{% endhighlight %}

위 코드는 그냥 Config 를 통한 의존성 주입을 위해 bean 을 정의하는 클래스이다. 실습 문제는 다음과 같다.

> 여러 `OrderService` 에서 주문해도 주문 내역이 공유되도록 구현하세요

그냥 `Scope` 를 prototype 으로 만들고 해버리면 되긴 된다. 여기서 궁금했던 점은 만약 `@Configuration` 을 없앴을 때 어떤 동작을 하는지이다. 실제로 `@Configuration` 을 없애도 기본적으로 context 를 통해 `getBean` 을 하면 `@Scope("prototype")` 이 없는 이상 동일한 bean 을 반환하게 된다. 즉 기능은 아무 이상이 없었다.

하지만, 서비스를 여러개 만들었을때 서비스 간에 가지고 있는 `orderHistory` 의 주입이 다 다른 객체로 들어가게 되었다. 즉 `@Scope("singleton")` 이었음에도 불구하고 여러 객체가 생성되어 주입이 된 것이다. 이에 대한 분석으로는 다음과 같다.

우선 Configuration 이 있을때를 보자. `@Configuration` 이 붙은 클래스는 Spring 이 **CGLIB 프록시** 를 만들어서 관리한다(중요). 이때 `@Bean` 메서드 호출이 내부적으로 프록시를 거치므로, **스프링 컨테이너에서 관리되는 싱글톤(@Bean 기본 scope)**을 항상 반환하게 된다.

> 예: `orderService()` 에서 `orderHistory()`를 호출해도, 이미 생성된 singleton `OrderHistory` 를 주입받음

그래서 `@Configuration` 이 없는 클래스에서 `@Bean` 메서드를 호출하면, 단순한 일반 메서드 호출처럼 동작하며, 따라서 `orderHistory()` 를 호출할 때 새로운 인스턴스가 생성됨. 결과적으로 prototype `OrderService` 가 생성될 때마다 각기 다른 `OrderHistory` 를 참조하게 되어, 스레드별로 다른 저장소처럼 동작하는 현상이 발생할 수 있음.

핵심 요약:
- `@Configuration` + `@Bean` → 프록시가 호출을 가로채고 스코프 규칙 적용 → singleton 보장
- 일반 클래스 + `@Bean` → 프록시 없음 → 단순 메서드 호출 → 매번 새 객체 생성
    - 매번 새 객체 생성이지만 `@Scope` 는 적용됨
    - ⭐️ 하지만, `getBean` 을 사용할 때 가져오는 것은 동일 인스턴스를 가져오게 된다. 이건 getBean 내부에서 일어나는 어떤 과정이 있어서 그런 듯하다.
- 따라서 singleton 을 보장하고 prototype 빈에서 주입받도록 하려면 `@Configuration` 을 반드시 사용해야 함

이제 다음으로 `@Bean` 과 함수 정의 스니펫 사이에 `@Scope` 를 통해 조금이나마 생명주기를 제어할 수 있다.

#### @Scope 애너테이션으로 Bean 생명주기와 공유 범위 제어

`SpringBootApplication` 이 `Configuration` 을 가지고 `ComponentScan` 을 통해 `Configuration` 에 Bean 으로 등록될 각각의 클래스들을 스캔하는 것을 보았다.

이번에는 `Bean` 의 생명주기를 제어해보자.` @Scope` 애너테이션은 class 와 method 범위에 사용할 수 있는 애너테이션이며, 다음 value 를 가진다.

| Scope        | 설명                                 | 사용 환경          |
|--------------|------------------------------------|------------------|
| singleton    | 컨테이너당 하나의 Bean만 생성 (기본값) | 모든 환경         |
| prototype    | 요청할 때마다 새 Bean 생성             | 모든 환경         |
| request      | HTTP 요청당 하나의 Bean 생성           | 웹 애플리케이션    |
| session      | HTTP 세션당 하나의 Bean 생성           | 웹 애플리케이션    |
| application  | ServletContext 단위로 하나의 Bean 생성 | 웹 애플리케이션    |
| websocket    | WebSocket 세션당 하나의 Bean 생성     | 웹 애플리케이션    |

##### @PostConstruct 와 @PreDestroy 사용하여 생명주기에 대한 로그 찍어보기

1. Bean 정의 읽기: `@Component` 애너테이션 및 `@Bean` 메서드 등, XML 설정 파일을 읽어 Bean 정의를 스프링이 파악
2. Bean 인스턴스 생성: 컨테이너가 실제 객체를 생성
3. 의존성 주입: 필요한 의존성 주입: `@Autowired` 나 생성자 / 세터를 통하여 차례차례 필요한 다른 Bean 주입
4. 초기화: `@PostConstruct` 메서드 실행: Bean 이 생성되고 의존성이 주입된 후에 실행
5. 사용: 애플리케이션에서 Bean 사용
6. 소멸: Bean 이 종료될 때 호출(실질적으로는 IoC 컨테이너가 종료될 때 함께 소멸되기 때문에 IoC 컨테이너가 종료될때 호출)

{% highlight java %}
@Component
public class LifecycleBean {

    public LifecycleBean() {
        System.out.println("1. Constructor called");
    }

    @PostConstruct
    public void init() {
        System.out.println("2. @PostConstruct - Bean initialized");
    }

    public void doSomething() {
        System.out.println("3. Bean is being used");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("4. @PreDestroy - Bean cleanup");
    }
}
{% endhighlight %}


#### Properties 를 사용해 키 값을 Config 로 등록하기

`Config` 는 Bean 을 위한 파일이다. Bean 에 대한 책임만을 가지지 얘가 key-value 와 같이 env 변수나 그런 형태의 값을 저장하는 것은 따로 없다. 이를 하고자 순수 자바 라이브러리는 표준 클래스로 `Properties` 라는게 있다(`java.util.Properties`).

`Key-Value` 쌍으로 데이터를 저장하는 특수한 `Map` 이다. 주로 설정 파일(`.properties`) 을 읽어오거나 환경 변수 같은 설정을 관리하고 싶을 때 사용한다.

{% highlight java %}
// 마비노기 최고
Properties props = new Properties();
props.setProperty("game.name", "Mabinogi");
props.setProperty("game.level.max", "50");

String name = props.getProperty("game.name"); // "Mabinogi"
{% endhighlight %}

프로퍼티는 코드 단에서 뿐 아니라 파일을 자동으로 읽어들여서 사용할 수도 있다.

{% highlight java %}
public class Exam {
	public static void main(String[] args) throws IOException {
		Properties props = new Properties();
		props.load(new FileInputStream("config.properties"));
	}
}
{% endhighlight %}

이제 `application.properties` 를 어떻게 읽어들이는지 파악될 것이다.

##### @Value 로 프로퍼티 주입해보기

Spring Boot 에서는 기본적으로 `application.properties` 를 자동으로 읽어온다(따로 어디에도 이를 읽는 코드를 찾을 수 없지만, 내부적으로 어딘가에 읽는 코드가 있을 것이다). 이를 Bean 으로 정의된 클래스 내부에 `@Value` 를 통해 간단하게 읽어들여서 쓸 수 있다.

**application.properties 파일**
{% highlight properties %}
# 서버 설정
server.port=8080
server.servlet.context-path=/api

# DB 설정
spring.datasource.url=jdbc:mysql://localhost:3306/shop
spring.datasource.username=root
spring.datasource.password=1234

# 커스텀 프로퍼티
shop.name=MyCafe
shop.owner=Seonghun
shop.maxCustomers=50
{% endhighlight %}

**코드**
{% highlight java %}
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ShopInfo {

    @Value("${shop.name}")
    private String name;

    @Value("${shop.owner}")
    private String owner;

    @Value("${shop.maxCustomers}")
    private int maxCustomers;

    public void printInfo() {
        System.out.println("Shop: " + name);
        System.out.println("Owner: " + owner);
        System.out.println("Max Customers: " + maxCustomers);
    }
}
{% endhighlight %}

실무에서는 커스텀 프로퍼티(`application.properties` 를 제외한 개발자가 서비스를 위해 임의로 만든 프로퍼티들)을 `@ConfigurationProperties`로 그룹화하여 설정 주입을 한다.

##### @ConfigurationProperties 를 사용해 key 를 기준으로 값 들고오기

아래를 보면 알겠지만 `ConfigurationProperties` 는 key 의 prefix 를 기준으로 쌍을 들고올 수 있다. 이는 전부 필드와 매핑되게 되는데, `shop.name`, `shop.owner`, `shop.maxCustomers` 로 매핑됨을 볼 수 있다.

{% highlight java %}
@Component
@ConfigurationProperties(prefix = "shop")
public class ShopProperties {

    private String name;
    private String owner;
    private int maxCustomers;

    // getter / setter 필수
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    public int getMaxCustomers() { return maxCustomers; }
    public void setMaxCustomers(int maxCustomers) { this.maxCustomers = maxCustomers; }
}

// ============================

@Service
public class ShopService {

    private final ShopProperties shopProperties;

    public ShopService(ShopProperties shopProperties) {
        this.shopProperties = shopProperties;
    }

    public void info() {
        System.out.println("Shop: " + shopProperties.getName());
        System.out.println("Owner: " + shopProperties.getOwner());
        System.out.println("Max Customers: " + shopProperties.getMaxCustomers());
    }
}
{% endhighlight %}

이렇게 가져간다면 컴파일 수준에서 타입 안전성을 가져갈 수 있어 실무에서 자주 사용한다.

> `@PropertySource` 라는 것도 있는데, 굳이 싶다. `application.properties` 혹은 `application.yml` 에 key-value 를 체계적으로 써 놓고, 그걸 가져오는 편이 더 좋을 듯하다. 개발자 마음대로 사용하면 되는 듯하다. 하지만 만약 Spring 이 자동으로 로드하지 않는 별도의 `properties` 나 `yml` 파일을 읽어들이고 싶을때 사용할 수 있을거 같다. 또한 `Property` 를 따로 클래스를 두어 가져간다면 Bean 으로 등록하여 POJO 를 Bean 으로 연결시킬 수도 있을거 같다.

#### DI 시 주의점

기본적으로 다음 규칙이 있다.

- 생성자 주입은 생성자 하나에 대해 주입 동작이 실행된다. 만약 2개가 있다면 **default 생성자**를 기준으로 한다(인자가 없는).
- `@Autowired` 를 생성자에 명시하면, 여러 생성자 중 어디에 주입할지 명확히 지정 가능하다.
- 세터 주입은 선택적 의존성(optional) 주입에 유용하며, 순환 의존성이 있는 경우 유리하다.

> 순환 의존성(Circular Dependency): 두 개 이상의 Bean 이 서로를 참조하는 경우 생성자 주입에서는 에러가 발생할 수 있으므로 세터 주입이나 `@Lazy` 옵션을 고려해야 함

##### @Lazy

Bean 의 초기화 시점을 늦춰 순환 참조를 막고자 할 때 사용하는 어노테이션이다. Bean 의 생성을 실제 사용 시점때 생성해달라고 스프링에게 요청하는 것이다.

**대상**
- 무거운 초기화 작업이 필요한 Bean
- 순환 의존성을 피하고 싶은 Bean

**클래스 레벨에서 사용**
{% highlight java %}
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@Lazy
public class HeavyBean {

    public HeavyBean() {
        System.out.println("HeavyBean 생성됨!");
    }
}
{% endhighlight %}

**의존성 주입에 Lazy 사용**
{% highlight java %}
@Component
public class UserService {

    private final HeavyBean heavyBean;

    public UserService(@Lazy HeavyBean heavyBean) {
        this.heavyBean = heavyBean;
    }
}
{% endhighlight %}

**Bean 에 사용**
{% highlight java %}
@Configuration
public class AppConfig {

    @Bean
    @Lazy
    public HeavyBean heavyBean() {
        return new HeavyBean();
    }
}
{% endhighlight %}

**에러 발생**
{% highlight java %}
@Component
public class A {
    private final B b;

    @Autowired
    public A(B b) {
        this.b = b;
    }
}

@Component
public class B {
    private final A a;

    @Autowired
    public B(A a) {
        this.a = a;
    }
}
{% endhighlight %}

**세터로 해결**

해결 방법: Spring 이 Bean 인스턴스를 생성(생성자 실행) -> 세터를 통해 서로 주입

{% highlight java %}
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class A {
    private B b;

    @Autowired
    public void setB(B b) {
        this.b = b;
    }
}

@Component
public class B {
    private A a;

    @Autowired
    public void setA(A a) {
        this.a = a;
    }
}
{% endhighlight %}

**Lazy 를 통해 해결**

한쪽만 붙이면 된다.

{% highlight java %}
@Component
public class A {
    private final B b;

    @Autowired
    public A(@Lazy B b) {
        this.b = b;
    }
}

@Component
public class B {
    private final A a;

    @Autowired
    public B(A a) {
        this.a = a;
    }
}
{% endhighlight %}

**장점**
- 어플리케이션 시작 속도 향상
- 순환 의존성 해결
- 메모리 최적화

**주의점**
- 싱글톤 Bean 과 잘 맞지만, 프로토타입 Bean 에는 사용 안함

#### Spring Application 의 실행 과정 중 실행 코드 넣기

가끔 어플리케이션이 실행되는 도중에 특정 시점에 특정 코드를 실행시키고 싶을 수 있을 것이다. 이를 위해 Spring Application 의 실행과정을 먼저 살펴보자.

**Spring Application**

순수 스프링은 보통 `AnnotationConfigApplicationContext`(컨피그를 넣어서 사용) 나 `ClassPathXmlApplicationContext`(xml 파일 넣어서 사용) 를 통해 IoC 를 직접 띄우게 된다.

실행 순서는 다음과 같다:

**순수 Spring**
1. `SpringApplication` 실행(`SpringAppication.run()`)
    - `ClassPathXmlApplicationContext` 또는 `AnnotationConfigApplicationContext` 생성
    - `BeanFactory` 생성
2. `Bean Definition` 메타데이터 읽기
    - XML 파싱 또는 Java Config 클래스 스캔
    - `@Component`, `@Service`, `@Repository` 등 어노테이션 스캔
    - Bean 메타데이터를 `BeanDefinition` 객체로 변환
3. Bean 생성 및 의존성 주입
    - `BeanFactory` 에서 Bean 인스턴스 생성
    - 생성자 주입, 세터 주입, 필드 주입 처리
    - `BeanPostProcessor` 실행
4. 초기화 콜백
    - `@PostConstruct` 메서드 실행
    - `InitializingBean.afterPropertiesSet()` 실행
    - `init-method` 실행

**Spring Boot Application**

1. `SpringApplication` 실행
   - `SpringApplication.run(MyApplication.class, args)` 호출
   - 실행 환경(Web, Reactive, None) 결정
   - `ApplicationContextInitializer` 로 초기화 인스턴스 로드
   - `ApplicationListener` 로 이벤트 리스너 로드
   - 메인 애플리케이션 클래스 결정

2. `Environment` 준비
   - `application.properties` / `application.yml` 로딩
   - 활성 프로파일(`Profile`) 적용
   - 커맨드라인 인자, 시스템 프로퍼티, 환경 변수 바인딩
   - `PropertySource` 우선순위 적용

3. `ApplicationContext` 생성
   - 웹 애플리케이션: `AnnotationConfigServletWebServerApplicationContext`
   - 리액티브: `AnnotationConfigReactiveWebServerApplicationContext`
   - 일반(non-web): `AnnotationConfigApplicationContext`

4. Auto-Configuration 적용
    - `@EnableAutoConfiguration` 처리
    - `spring.factories`에서 Auto-Configuration 클래스 로드
    - 조건부 빈 등록:
        - `@ConditionalOnClass`: 특정 클래스 존재 여부
        - `@ConditionalOnMissingBean`: 특정 빈 부재 여부
        - `@ConditionalOnProperty`: 프로퍼티 값 존재 여부

5. `ComponentScan`
   - `@SpringBootApplication` 위치 기준 하위 패키지 스캔
   - `@Component`, `@Service`, `@Repository`, `@Controller` 등 감지

6. Bean 생성 및 의존성 주입
   - 일반 Spring과 동일
   - Auto-configured Bean들이 먼저 등록
   - 생성자 주입, 세터 주입, 필드 주입 수행
   - `BeanPostProcessor` 실행

7. 내장 웹 서버 시작
   - `ServletWebServerFactory` 빈을 통해 Tomcat/Jetty/Undertow 시작
   - 기본 포트 8080, `server.port` 프로퍼티로 변경 가능

8. `CommandLineRunner` / `ApplicationRunner` 실행
   - 모든 Bean 초기화 완료 후 실행
   - 애플리케이션 시작 직후 초기화 로직 수행 가능

{% highlight java %}
@Component
public class MyRunner implements CommandLineRunner {
    @Override
    public void run(String... args) throws Exception {
        System.out.println("애플리케이션 시작 후 실행되는 코드");
    }
}
{% endhighlight %}

이 흐름을 가지고 다음을 읽자.

##### CommandLineRunner

Spring Boot 어플리케이션이 완전히 실행된 직후(의존서 주입이 끝난 뒤) 자동으로 실행되는 초기화용 인터페이스이며, `@FunctionalInterface`이다.

{% highlight java %}
@FunctionalInterface
public interface CommandLineRunner {
    void run(String... args) throws Exception;
}
{% endhighlight %}

- Spring Boot 가 실행될 때, `SpringApplication.run()` 이 끝난 뒤에 모든 `CommandLineRunner` Bean 들의 `run()` 메서드를 자동으로 호출한다.
- `@Order` 을 통해 실행 순서도 지정할 수 있다.

{% highlight java %}
@Component
@RequiredArgsConstructor
public class StartupRunner implements CommandLineRunner {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private final KafkaTemplate<String, String> kafkaTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        // 1. Redis 연결 확인
        try {
            redisTemplate.opsForValue().set("health:check", "ok");
            System.out.println("✓ Redis 연결 성공");
        } catch (Exception e) {
            System.err.println("✗ Redis 연결 실패");
        }
        
        // 2. Kafka 연결 확인
        try {
            kafkaTemplate.send("health-check", "ping");
            System.out.println("✓ Kafka 연결 성공");
        } catch (Exception e) {
            System.err.println("✗ Kafka 연결 실패");
        }
        
        // 3. 초기 데이터 로딩
        loadInitialData();
    }
    
    private void loadInitialData() {
        System.out.println("초기 데이터 로딩 중...");
    }
}
{% endhighlight %}

> 기본적으로 `CommandLineRunner` 는 Bean 으로 등록되어야 실행이 되게 된다.

#### ⭐️ Spring Event System

Spring의 이벤트 시스템은 **Publisher-Subscriber 패턴**을 구현한다. 이는 이벤트 기반 통신 구조를 구현하는 디자인 패턴이며, 역할은 다음과 같다.

- Publisher(발행자): 이벤트를 발생시키는 주체
- Subscriber(구독자): 이벤트가 발생하면 이를 감지하고 처리하는 주체들

즉 이벤트라는 매개체로만 소통하는 구조이다.

**장점**
- 느슨한 결합
- 코드의 유연성
- 이벤트 발생 시 여러 구독자가 동시에 반응 가능

**이벤트 정의**

{% highlight java %}
// 1. 이벤트 클래스 정의 (POJO)
public class UserRegisteredEvent {
    private final String email;
    private final String username;
    private final LocalDateTime registeredAt;
    
    public UserRegisteredEvent(String email, String username) {
        this.email = email;
        this.username = username;
        this.registeredAt = LocalDateTime.now();
    }
    
    // Getters
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
}
{% endhighlight %}

**Publisher**
{% highlight java %}
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    public User registerUser(String email, String username) {
        // 1. 비즈니스 로직 실행
        User user = new User(email, username);
        userRepository.save(user);
        
        // 2. 이벤트 발행
        UserRegisteredEvent event = new UserRegisteredEvent(email, username);
        eventPublisher.publishEvent(event);
        
        return user;
    }
}
{% endhighlight %}

**Subscriber**

구독자의 구현은 다양하다. 선호에 따라 사용하자.

{% highlight java %}
@Component
@Slf4j
public class UserEventListener {
    
    @Autowired
    private EmailService emailService;
    
    // 회원가입 시 환영 이메일 발송
    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("새로운 사용자 등록: {}", event.getUsername());
        emailService.sendWelcomeEmail(event.getEmail());
    }
    
    // 조건부 리스너
    @EventListener(condition = "#event.email.endsWith('@company.com')")
    public void handleCompanyUserRegistered(UserRegisteredEvent event) {
        log.info("회사 이메일로 등록: {}", event.getEmail());
        // 특별한 처리
    }
}
{% endhighlight %}

{% highlight java %}
@Component
public class LegacyUserEventListener 
        implements ApplicationListener<UserRegisteredEvent> {
    
    @Override
    public void onApplicationEvent(UserRegisteredEvent event) {
        System.out.println("레거시 방식 리스너: " + event.getUsername());
    }
}
{% endhighlight %}

##### Asynchronized Event 로 구성하기

이벤트의 동작이 너무 무겁거나 오래 걸리는 작업이면 원래 작업이 지연되기 때문에 비동기로 처리할 수 있다.

{% highlight java %}
@Configuration
@EnableAsync
public class AsyncConfig {
    
    @Bean
    public TaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("event-");
        executor.initialize();
        return executor;
    }
}
{% endhighlight %}

`@EnableAsync` 는 Spring 에서 비동기 메서드를 실행을 활성화시키는 어노테이션인데, 쉽게 말하여 특정 메서드를 별도의 스레드에서 동시에 실행하도록 허용하는 기능이다. 이렇게 해두고 비동기 메서드에 `@Async` 만 붙이면 간단하게 비동기로 실행이 가능하게 된다. 우선 실행할 스레드 풀을 커스터마이징하여 선언해놓고, `Subscriber` 를 구현하면 된다.

{% highlight java %}
@Component
@Slf4j
public class AsyncEventListener {
    
    // 비동기로 처리 - 메인 스레드 블로킹 없음
    @Async
    @EventListener
    public void handleUserRegisteredAsync(UserRegisteredEvent event) {
        log.info("비동기 이벤트 처리 시작: {}", Thread.currentThread().getName());
        
        // 시간이 오래 걸리는 작업
        try {
            Thread.sleep(3000);
            sendSlackNotification(event);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        log.info("비동기 이벤트 처리 완료");
    }
    
    private void sendSlackNotification(UserRegisteredEvent event) {
        // Slack 알림 발송
    }
}
{% endhighlight %}

##### Transaction Event Listener

스프링은 트랜잭션 별로 세세한 컨트롤이 가능하도록 각 생명주기 사이사이에 코드를 실행할 수 있는 애너테이션들을 제공한다.

{% highlight java %}
@Component
@Slf4j
public class TransactionalEventListener {
    
    // 트랜잭션 커밋 후에만 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleAfterCommit(UserRegisteredEvent event) {
        log.info("트랜잭션 커밋 후 실행: {}", event.getUsername());
        // 외부 API 호출, 메시지 큐 발송 등
    }
    
    // 트랜잭션 롤백 시 실행
    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void handleAfterRollback(UserRegisteredEvent event) {
        log.error("트랜잭션 롤백됨: {}", event.getUsername());
        // 롤백 처리
    }
    
    // 트랜잭션 완료 후 실행 (커밋/롤백 상관없이)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMPLETION)
    public void handleAfterCompletion(UserRegisteredEvent event) {
        log.info("트랜잭션 완료: {}", event.getUsername());
    }
    
    // 트랜잭션 시작 전 실행
    @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
    public void handleBeforeCommit(UserRegisteredEvent event) {
        log.info("트랜잭션 커밋 직전: {}", event.getUsername());
    }
}
{% endhighlight %}

**활용 예시**

{% highlight java %}
// 이벤트 정의
public class OrderCreatedEvent {
    private final Long orderId;
    private final Long userId;
    private final BigDecimal amount;
    private final LocalDateTime createdAt;
    
    public OrderCreatedEvent(Long orderId, Long userId, BigDecimal amount) {
        this.orderId = orderId;
        this.userId = userId;
        this.amount = amount;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters...
}

// 서비스에서 이벤트 발행
@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final ApplicationEventPublisher eventPublisher;
    
    public Order createOrder(OrderRequest request) {
        // 주문 생성
        Order order = Order.builder()
                .userId(request.getUserId())
                .amount(request.getAmount())
                .status(OrderStatus.PENDING)
                .build();
        
        orderRepository.save(order);
        
        // 이벤트 발행
        eventPublisher.publishEvent(
            new OrderCreatedEvent(order.getId(), order.getUserId(), order.getAmount())
        );
        
        return order;
    }
}

// 다양한 리스너들
@Component
@Slf4j
@RequiredArgsConstructor
public class OrderEventHandlers {
    
    private final EmailService emailService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    private final SlackService slackService;
    
    // 1. 재고 차감 (동기)
    @EventListener
    public void handleInventoryDeduction(OrderCreatedEvent event) {
        log.info("재고 차감 시작: Order {}", event.getOrderId());
        inventoryService.deductInventory(event.getOrderId());
    }
    
    // 2. 결제 처리 (트랜잭션 커밋 후)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePayment(OrderCreatedEvent event) {
        log.info("결제 처리 시작: Order {}", event.getOrderId());
        paymentService.processPayment(event.getOrderId(), event.getAmount());
    }
    
    // 3. 이메일 발송 (비동기)
    @Async
    @EventListener
    public void sendOrderConfirmationEmail(OrderCreatedEvent event) {
        log.info("주문 확인 이메일 발송: Order {}", event.getOrderId());
        emailService.sendOrderConfirmation(event.getUserId(), event.getOrderId());
    }
    
    // 4. Slack 알림 (비동기, 고액 주문만)
    @Async
    @EventListener(condition = "#event.amount.compareTo(new java.math.BigDecimal('1000000')) > 0")
    public void notifyLargeOrder(OrderCreatedEvent event) {
        log.info("고액 주문 알림: Order {} - {}", event.getOrderId(), event.getAmount());
        slackService.sendMessage("고액 주문 발생: " + event.getAmount() + "원");
    }
}
{% endhighlight %}

##### Spring 내장 EventListener

{% highlight java %}
@Component
@Slf4j
public class ApplicationEventListener {
    
    // 1. 애플리케이션 시작 중
    @EventListener
    public void handleContextRefreshed(ContextRefreshedEvent event) {
        log.info("1. ApplicationContext가 초기화되거나 리프레시됨");
    }
    
    // 2. 애플리케이션 준비 완료
    @EventListener
    public void handleApplicationReady(ApplicationReadyEvent event) {
        log.info("2. 애플리케이션이 요청을 처리할 준비가 됨");
        // 헬스체크, 외부 시스템 연결 등
    }
    
    // 3. 애플리케이션 시작 완료
    @EventListener
    public void handleApplicationStarted(ApplicationStartedEvent event) {
        log.info("3. 애플리케이션이 시작됨 (리스너 호출 전)");
    }
    
    // 4. 애플리케이션 종료 시작
    @EventListener
    public void handleContextClosing(ContextClosedEvent event) {
        log.info("4. ApplicationContext가 닫히는 중");
        // 리소스 정리, 연결 종료 등
    }
}
{% endhighlight %}

---

## ✒️ 용어

###### CGLIB 프록시

Spring에서 실제 클래스 자체를 상속받아 동적으로 프록시 객체를 생성하는 기술을 의미한다.

- `Spring AOP`, `@Configuration(proxyBeanMethods = true)` 등에서 사용
- 클래스 기반 프록시이기 때문에 인터페이스가 없어도 프록시를 만들 수 있음

1. Spring이 대상 클래스(예: AppConfig)를 상속한 서브클래스를 런타임에 생성
2. Bean 메서드 호출 시 원래 객체가 아닌 **프록시 객체를 통해 호출**
3. 프록시가 메서드 호출을 가로채어 싱글톤 보장, AOP 적용 등 추가 기능 수행

> 프록시 객체를 호출한다는 점이 핵심, proxyBeanMethods = true → CGLIB 프록시를 통해 `Bean 메서드 간` 호출 시 동일한 싱글톤 인스턴스 반환

제일 중요한 것은 ⭐️ **Bean 메서드 간 호출 시 동일한 싱글톤 인스턴스 반환** 의 문장이다.