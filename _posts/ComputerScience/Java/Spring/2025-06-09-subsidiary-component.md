---
layout: post
title:  보조. Component
date:   2025-06-09 18:45:16 +0900
categories: ComputerScience Java Spring
---

<!--more-->

## 📂 목차
- [@Service](#service)
- [@Repository](#repository)
- [@Controller](#controller)
- [@Component 와 @Bean 과의 차이](#component-와-bean-과의-차이)

---

## 📚 본문

`@Component` 는 클래스 위에 붙는 애너테이션이며, Spring 이 해당 클래스를 `@ComponentScan` 시 자동으로 빈으로 등록하도록 만든다.

@Component 만이 아니라 이를 구현하는 다른 interface 또한 있다.

### @Service

@Component의 특수한 형태로

- 비즈니스 로직을 수행하는 클래스에 사용
- @Component 의 기능을 포함하고 서비스 클래스 임을 명시
- **[AOP(예: 트랜잭션 처리)](#aop)**와 같은 부가 기능을 적용할 수 있는 힌트로 활용

{% highlight java %}
@Service
public class OrderService {
    public void processOrder() { ... }
}
{% endhighlight %}

### @Repository

@Component의 특수한 형태로

- 데이터베이스에 접근하는 **[DAO(Data Access Object) 클래스](#dao)**에 사용
- 데이터 접근 계층에 대한 예외를 `Spring DataAccessException`으로 통일
- **[JPA](#jpa)**나 **[MyBatis](#mybatis)**와 같이 **[ORM](#orm)** 또는 **SQL 매퍼 라이브러리**와 함께 사용

### @Controller

@Component의 특수한 형태로

- 웹 요청을 처리하는 프레젠테이션 계층(Controller Layer) 클래스에 사용
- Spring MVC에서 요청을 받아 처리하고 뷰에 결과를 반환하는 역할
- `@RequestMapping` 등의 애너테이션과 함께 사용(나중에 나옴)

### @Component 와 @Bean 과의 차이

`@Bean`은 수동 등록이며 `@Configuration` 클래스 내의 메서드에 붙여서 해당 메서드의 리턴값을 Bean 으로 등록한다.

{% highlight java %}
@Configuration
public class AppConfig {
    @Bean
    public MyService myService() {
        return new MyService();
    }
}
{% endhighlight %}

이는 외부 라이브러리 클래스의 수정이 불가할 때, 즉 **@Component 를 직접 사용할 수 없을 때 해당 외부 클래스를 Bean으로 등록하는 경우** 유용하다. 복잡한 초기화 로직이 필요한 객체를 생성하는 경우에도 사용한다.

---

## 📁 관련 글

- [4. Spring Boot Application Initialization][spring-boot-initialization]

---

## ✒️ 용어

###### AOP
관점 지향 프로그래밍(Aspect-Oriented Programming)의 줄임말로, 로깅, 트랜잭션, 보안 등 부가 기능을 핵심 로직과 분리하여 모듈화할 수 있게 해주는 프로그래밍 패러다임

###### JPA
자바 진영의 ORM(Object-Relational Mapping) 표준 인터페이스이며 개발자가 **직접 SQL을 작성하지 않고도 Java 객체와 데이터베이스 테이블을 매핑**하여 다룰 수 있게 해준다.

###### DAO
Data Access Object의 약자로, 데이터베이스에 접근하는 로직을 담당하는 객체이고 **비즈니스 로직과 데이터 접근 로직을 분리하여 코드의 책임을 명확히** 할 수 있다.

###### MyBatis
SQL 기반의 **데이터 매퍼 프레임워크**로, XML 또는 애너테이션을 사용하여 SQL 문을 작성하고 Java 객체와 매핑한다. 복잡한 SQL 작성이 필요한 경우 유용하다.

###### MVC
Model-View-Controller의 약자로, 사용자 인터페이스와 로직을 분리하기 위한 소프트웨어 아키텍처 패턴이다. 전공 공부에서도 나오고, 정처기에서도 나온다.

###### ORM
Object-Relational Mapping의 약자로, 객체 지향 프로그래밍 언어를 사용하여 **관계형 데이터베이스의 데이터를 객체처럼 다룰 수 있게** 해주는 기술

[spring-boot-initialization]: {{ site.baseurl }}/java/spring/2025/06/09/4.-spring-boot-application-initialization