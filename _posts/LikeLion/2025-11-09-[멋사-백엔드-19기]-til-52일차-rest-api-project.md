---
layout: post
title:  "[멋사 백엔드 19기] TIL 52일차 REST API Project"
date:   2025-11-10 13:40:23 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차

- [Base Entity](#base-entity)
- [Paginated Response Wrapper](#paginated-response-wrapper)
- [@AuthenticationPrincipal](#authenticationprincipal)
- [HandlerMethodArgumentResolver 를 통한 커스텀 인자 받아보기](#handlermethodargumentresolver-를-통한-커스텀-인자-받아보기)
- [DTO Mapper](#dto-mapper)
- [Spring Cache(Redis)](#spring-cacheredis)
- [EntityGraph](#entitygraph)
- [ApplicationEvent 로 비동기 처리를 분리](#applicationevent-로-비동기-처리를-분리)
- []()

---

## 📚 본문

### Base Entity

모든 엔티티에서 반복되는 필드를 상속으로 정리할 수 있는 엔티티를 작성해보자. 이전에 `EnableJpaAuditing` 어노테이션을 보았다. 이를 사용하면 `CreatedDate`, `LastModifiedDate`, `CreatedBy` 등등 필드를 자동으로 채워줄 수 있는 어노테이션을 적용할 수 있게 되었다.

엔티티에게 

**공통**
- id(PK)
- createdAt, updatedAt
- createdBy updatedBy

{% highlight java %}
@Getter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
{% endhighlight %}

`@MappedSuperclass` 테이블은 없고, 필드만 자식 엔티티에 포함시키고 싶을때 사용할 수 있다. 내부적으로 시간을 기록할 수 있는 `@CreatedDate`, `@LastModifiedDate` 등등을 사용할 수 있겠다.

또 누가 수정했는지, 누가 갱신했는지도 `@LastModifiedBy`, `@CreatedBy` 어노테이션 만으로 추가할 수 있는데, `AuditorAware` 를 먼저 빈으로 등록해줘야 한다.

{% highlight java %}
@Configuration
@EnableJpaAuditing
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorAware() {
        return () -> Optional.of("system");
    }
}
{% endhighlight %}

**AwareAudit 동작**

{% highlight java %}
@Entity 저장/수정 발생
       ↓
Spring Data JPA AuditingHandler 작동
       ↓
AuditingHandler 가 AuditorAware.getCurrentAuditor() 호출
       ↓
AuditorAware 구현체가 "system" 반환
       ↓
AuditingHandler 가 엔티티의 @CreatedBy / @LastModifiedBy 필드를 자동으로 채움
{% endhighlight %}

따라서 system 은 따로 설정해줘야 한다.

### Paginated Response Wrapper

프로젝트에서 못해봤지만, 보통 페이지를 API 응답 보낼 때 공통 포맷을 만들면 프론트와 협업이 편해진다.

{% highlight java %}
public record ApiPageResponse<T>(
		List<T> content,
		int page,
		int size,
		long totalElements
) { }
{% endhighlight %}

### @AuthenticationPrincipal

또한 프로젝트를 할 때 굉장히 불편했던 것은 컨트롤러마다 들어오는 요청이 인증이 되었는지 안되었는지 등의 검증이 필요한데, 이를 컨트롤러의 인자에서 `@AuthenticationPrincipal` 만으로 받아올 수 있다.

{% highlight java %}
@GetMapping("/me")
public UserResponse me(@AuthenticationPrincipal CustomUserDetails user) {
    return new UserResponse(user.getId(), user.getEmail());
}
{% endhighlight %}

`CustomUserDetails` 뿐만 아니라 `Principal` 도 얻어올 수 있다.

#### HandlerMethodArgumentResolver 를 통한 커스텀 인자 받아보기

Spring MVC에서는 컨트롤러 메서드의 파라미터를 기본 타입이나 애노테이션으로 쉽게 주입할 수 있습니다. 하지만 직접 정의한 커스텀 객체를 주입하고 싶다면 `HandlerMethodArgumentResolver`를 구현하면 됩니다.

예를 들어, 로그인한 사용자 정보를 `@CurrentUser` 애노테이션으로 바로 받아오도록 만들어보겠습니다.

1. **커스텀 애노테이션 생성**

{% highlight java %}
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentUser { }
{% endhighlight %}

2. **Argument Resolver 구현**

{% highlight java %}
@Component
@RequiredArgsConstructor
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final UserRepository userRepository;

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.getParameterAnnotation(CurrentUser.class) != null
                && parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, 
                                  ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest,
                                  WebDataBinderFactory binderFactory) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
{% endhighlight %}

3. **Resolver 등록**

{% highlight java %}
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final CurrentUserArgumentResolver currentUserArgumentResolver;

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(currentUserArgumentResolver);
    }
}
{% endhighlight %}

이제 컨트롤러에서 다음과 같이 사용 가능하다.

{% highlight java %}
@GetMapping("/me")
public UserResponse me(@CurrentUser User user) {
    return new UserResponse(user.getId(), user.getEmail());
}
{% endhighlight %}

### DTO Mapper

`@Mapper` 은 MapStructor 에게 이 인터페이스에 대한 구현체를 만들어라고 지시하는 애노테이션이며, 직접 작성하지 않아도 MapStruct 가 컴파일 시점에 생성할 수 있도록 한다.

{% highlight java %}
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toDto(User user);
    User toEntity(CreateUserRequest req);
}
{% endhighlight %}

기본적으로 `toDto` 는 User 를 변환할텐데, 이때 필드명은 같은 명으로 매핑이 된다. 만약 필드명을 다르게 가져가고 싶다면 `@Mapping` 을 추가해서 조정해줘야 한다. `toEntity` 도 동일하다.

{% highlight java %}
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "email", target = "userEmail")
    UserResponse toDto(User user);
}
{% endhighlight %}

`source` 는 엔티티 쪽, 즉 원본, `target`은 목적지 쪽이다. 이런 기능 말고도 중첩된 객체에서도 꺼낼 수 있다.

{% highlight java %}
@Mapping(source = "address.city", target = "city")
UserResponse toDto(User user);
{% endhighlight %}

원하지 않는 필드는 무시하려면 `ignore` 속성을 사용한다.

{% highlight java %}
@Mapping(target = "password", ignore = true)
UserResponse toDto(User user);
{% endhighlight %}

특정 값이나 Java 코드로 계산하여 넣고 싶을때는 `constant`, `expression` 을 사용한다.

{% highlight java %}
@Mapping(target = "role", constant = "USER")

@Mapping(target = "createdAt", expression = "java(LocalDateTime.now())")
{% endhighlight %}

위 매핑 두 개를 동시에 지정하려면 `Mappings` 를 사용하면 된다.

{% highlight java %}
@Mappings({
    @Mapping(source = "email", target = "userEmail"),
    @Mapping(source = "address.city", target = "city"),
    @Mapping(target = "password", ignore = true)
})
UserResponse toDto(User user);
{% endhighlight %}

### Spring Cache(Redis)

조회 요청이 많은 엔드포인트에 캐싱을 걸면 효율이 올라가게 된다.

{% highlight java %}
@Cacheable(cacheNames = "user", key = "#id")
public User getUser(Long id) { ... }
{% endhighlight %}

### EntityGraph

`Page` 로 반환할때 가끔 fetch join 을 써도 최적화가 안먹히는 경우가 있다. 이럴때 N+1 문제를 해결하기 위해서 다음을 쓸 수 있다.

{% highlight java %}
@EntityGraph(attributePaths = {"posts", "comments"})
List<User> findAll();
{% endhighlight %}

### ApplicationEvent 로 비동기 처리를 분리

회원가입 직후 이메일 발송, 로그 생성 등과 같은 로직이 필요할 수 있다. 이때 application 수준에서 이벤트를 발행하여 어플리케이션 전체의 subscriber 들에게 알릴 수 있다.

{% highlight java %}
public class UserCreatedEvent {
    private final Long userId;

    public UserCreatedEvent(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}

applicationEventPublisher.publishEvent(new UserCreatedEvent(userId));
{% endhighlight %}

이로써 핵심 서비스 코드는 가벼워지고 확장성이 증가되게 된다. 여기서 중요한 점은 반드시 리스너(subscriber) 에 `@Async` 를 붙여줘야 한다.

{% highlight java %}
@Component
@RequiredArgsConstructor
public class UserCreatedListener {

    @Async
    @EventListener
    public void handle(UserCreatedEvent event) {
        // 이메일 발송, 로그 기록 등
    }
}
{% endhighlight %}

그리고 이게 동작할 수 있도록 설정에 다음 `Async` 활성화가 필요하다.

{% highlight java %}
@Configuration
@EnableAsync
public class AsyncConfig {}
{% endhighlight %}
