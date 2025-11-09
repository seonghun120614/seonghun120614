---
layout: post
title:  "[멋사 백엔드 19기] TIL 50일차 Spring Security2"
date:   2025-11-05 10:26:47 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차
- [Servlet Authentication Architecture]()
- []()

---

## 📚 본문

### Servlet Authentication Architecture

이제 security 가 Servlet 에서 어떻게 동작하는지 보자.

다음 클래스들을 기억하자:

- **SecurityContextHolder**: 인증된 사용자의 세부 정보를 저장하는 곳

- **SecurityContext**: **SecurityContextHolder** 에서 가져오는 객체이며, 현재 인증된 사용자의 **Authentication** 객체를 포함하게 된다.

- **Authentication**: 사용자가 로그인 시 입력한 자격 증명(`Credentials`) 를 담아 **AuthenticationManager** 에 전달하기 위해 입력으로 사용되거나 또는 현재 **SecurityContext** 에 저장되어 있는 현재 사용자 정보일 수도 있음

- **GrantedAuthority**: `Authentiation` 내의 `Principal`(주체, 즉 사용자) 에게 부여된 권한을 나타냄

- **AuthenticationManager**: Spring Security 의 `Filter` 들이 인증을 수행할 때 사용하는 인증 수행 API 이다.

- **ProviderManager**: **AuthenticationManager** 의 가장 일반적인 구현체

- **AuthenticationProvider**: **ProviderManager** 가 특정 종류의 인증을 수행하기 위해 사용하는 구체적인 인증 로직 담당자
    - 폼 로그인, OAuth2, JWT 등 각 방식별 인증 로직을 구현함

- Request Credentials with AuthenticationEntryPoint: 클라이언트에게 자격 증명을 요청할 때 사용하는 구성 요소이다.

- **AbstractAuthenticationProcessingFilter**: 인증 과정을 수행하는 `Filter` 클래스이며, 이 클래스는 인증이 어떻게 처리되는지 각 구성요소가 어떻게 상호작용하는지에 대한 고수준 흐름을 보여준다.

즉, `SecurityContextHolder` 에 사용자의 인증 정보가 저장되며, 그 과정을 `AuthenticationManager` -> `AuthenticationProvider` -> `SecurityContext` 순으로 거쳐 처리된다는 설명이다.

#### SecurityContextHolder

![assets/img/securitycontextholder.png]({{ site.baseurl }}/assets/img/securitycontextholder.png)

SecurityContextHolder 는 Spring Security 가 인증된 사용자의 세부정보를 저장하는 곳이며, SecurityContextHolder 가 어떻게 채워지는지에 대해서는 신경쓰지 않는다. 단, 값이 존재하면 그 값을 현재 인증된 사용자로 간주한다.

{% highlight java %}
SecurityContext context = SecurityContextHolder.createEmptyContext(); 
Authentication authentication =
    new TestingAuthenticationToken("username", "password", "ROLE_USER"); 
context.setAuthentication(authentication);

SecurityContextHolder.setContext(context);
{% endhighlight %}

위는 태스트용 가짜 정보를 만들어서 컨텍스트 홀더의 빈 컨텍스트에 Spring Security 가 관리하도록 가짜 정보를 넣어준다. 저장될 때 다음의 `Authentication` 구현이 들어가야 한다.

{% highlight java %}
public interface Authentication extends Principal, Serializable {
    
    Collection<? extends GrantedAuthority> getAuthorities();  // 권한 목록
    
    Object getCredentials();  // 비밀번호 (인증 후 보통 null)
    
    Object getDetails();  // 추가 정보 (IP, 세션 등)
    
    Object getPrincipal();  // 주체 (보통 UserDetails 또는 username)
    
    boolean isAuthenticated();  // 인증 여부
    
    void setAuthenticated(boolean isAuthenticated);
}
{% endhighlight %}

여기서 `credentials`, `details`, `principal` 는 Object 이고, 모든 값들이 저장될 수 있음을 볼 수 있다. `SecurityContext` 내부에는 `Authentication` 을 저장하기 위한 공간이 있는데, 이는 `ThreadLocal` 로 정의되어 있어서 각 요청마다 다른 스레드가 이 요청의 흐름을 맡게 되기 때문에 각 요청마다 독립된 저장소를 가지게 된다.

이때 현재 사용자의 요청 처리가 끝난 후 해당 스레드를 반드시 정리해야 안전하게 된다. Spring Security 의 `FilterChainProxy` 는 항상 `SecurityContext` 가 정리되도록 보장하기 때문에 개발자는 이를 신경쓰지 않아도 된다.

하지만 일부 어플리케이션은 `ThreadLocal` 을 사용하는 것이 적합하지 않을 수도 있는데, `Swing` 클라이언트는 JVM 내의 모든 스레드가 동일한 보안 컨텍스트를 사용하고 싶을 수도 있다. 이 경우는 다음 `SecurityContextHolder` 에게 명시해주어야 한다.

- 독립 실행형 어플리케이션인 경우: `SecurityContextHolder.MODE_GLOBAL`
- 보안 컨텍스트를 가진 스레드가 생성한 하위 스레드(sub-thread) 들도 동일한 보안 신원(security identity)을 상속받도록 하고 싶다면
    - `SecurityContextHolder.MODE_INHERITABLETHREADLOCAL` 전략을 사용

이를 적용하는 방법은 두 가지인데

1. 시스템 프로퍼티에 설정으로 넣음
    - JVM 시작옵션 `-Dspring.security.strategy=MODE_GLOBAL`
2. SecurityContextHolder 의 정적 메서드를 호출

{% highlight java %}
// MODE_GLOBAL, MODE_THREADLOCAL, MODE_INHERITABLETHREADLOCAL 중 선택 가능
SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_GLOBAL);
{% endhighlight %}

#### SecurityContext

`SecurityContextHolder` 가 가지고 있는 객체이며, 내부에는 `Authentication` 을 가지고 있다. 이 `Authentication` 이 중요하다.

##### Authentication

Authentication 은 크게 두 역할을 한다.

1. 사용자 인증 요청 시 입력값 역할
    - 사용자가 입력한 자격 증명을 `AuthenticationManager` 에 전달할 때 사용
    - 이 단게에서 `isAuthenticated()` 값은 `false`
    - 아직 인증이 완료되지 않은 상태를 의미

2. 현재 인증된 사용자 정보 표현
    - 인증이 완료 시, `Authentication` 객체를 통해 현재 로그인된 사용자 정보를 얻어올 수 있음

`Authentication` 은 위를 수행하기 위해 아래의 정보들을 가진다.

**Principal(주체)**

사용자를 식별하는 정보이며, 일반적으로 아이디/비밀번호 로그인의 경우 `UserDetails` 객체의 인스턴스가 여기에 들어가게 된다.

**Credentials(자격 증명)**

주로 비밀번호가 여기에 저장되게 된다. 보안 상의 이유로 사용자가 인증된 후에는 이 값이 지워지는 경우가 많다.

**Authorities**

`GrantedAuthority` 객체들의 집합, 사용자가 가진 상위 수준의 권한(Permission)들을 나타낸다. 대표적인 예로 역할(Role) 과 범위(Scope) 가 있다.

{% highlight java %}
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

public class SecurityExample {
    public static void main(String[] args) {

        // 1️⃣ 사용자 권한 설정 (예: ROLE_USER, ROLE_ADMIN)
        List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_USER"),
                new SimpleGrantedAuthority("ROLE_ADMIN")
        );

        // 2️⃣ 사용자 정보 (principal)와 비밀번호(credentials) 지정
        String username = "kim";
        String password = "1234"; // 보통 인증 후엔 이건 null로 설정함

        // 3️⃣ Authentication 객체 생성
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(username, password, authorities);

        // 4️⃣ SecurityContext에 설정
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // ✅ 확인
        var auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("현재 사용자: " + auth.getName());
        System.out.println("권한 목록: " + auth.getAuthorities());
        System.out.println("인증 여부: " + auth.isAuthenticated());
    }
}
{% endhighlight %}

여기서 `GrantedAuthority` 가 사용자가 부여받은 상위 수준의 `Permission` 을 나타낸다. 보통 `Authentication.getAuthorities()` 메서드를 통해 `GrantedAuthority` 들을 가져오게 되고, 컬렉션 형태로 반환하게 된다. 권한은 일반적으로 `ROLE_(이름)` 형태로 표현되게 된다.

위처럼 정의된 역할들은 이후에:
- 웹 요청 접근 제어
- 메서드 권한 제어
- 도메인 객체 권한 제어

에 사용되게 된다. 이런 권한은 그래서 어플리케이션 전역에서 다뤄지게 된다.

##### AuthenticationManager

Spring Security 의 필터들이 인증을 수행하는 방식을 정의하는 API 이며, `AuthenticationManager` 가 반환한 `Authentication` 객체는 이를 호출한 컨트롤러, 정확히는 Spring Security 의 필터 인스턴스에 의해 `SecurityContextHolder` 에 저장되게 된다.

만약 Spring Security 의 필터 체인을 사용하지 않는다면, `SecurityContextHolder` 에 직접 `Authentication` 을 설정할 수도 있고, 이 경우에는 `AuthenticationManager` 를 꼭 사용할 필요는 없다(그럴 일은 아직 없을 듯하다).

##### ProviderManager

![assets/img/providermanager.png]({{ site.baseurl }}/assets/img/providermanager.png)

여러 개의 `AuthenticationProvider` 인스턴스들을 `List` 형태로 가지고 있으며, 각 `AuthenticationProvider` 는 다음 중 하나를 결정할 수 있다.

1. 인증이 성공했다고 판단
2. 인증이 실패했다고 판단
3. 자신은 이 인증 타입을 처리할 수 없으므로 다음 `AuthenticationProvider` 가 판단하도록 위임

즉 인증 과정은 여러 `AuthenticationProvider` 를 순차적으로 거치며, 각 `Provider` 가 인증을 시도하다가 어느 하나가 성공을 반환하면 인증이 종료되게 된다. 만약 모든 `AuthenticationProvider` 가 인증을 처리하지 못하면 실패이다.

> 실패 예외는 `ProviderNotFoundException`

실제로 `AuthenticationProvider` 는 다양한 형태의 인증 방식을 처리하는 방법을 알고 있다(이미 제공해준다는 말).

- `AuthenticationProvider` 중에 아이디/비밀번호를 검증하는 Provider가 있을 수 있고
- **SAML 어서션** 을 통해 인증하는 Provider 도 있을 수 있다.

우리가 이를 Provider 를 추가하려면 하나의 `AuthenticationManager` 을 Bean 으로 등록만 하면 된다.

실제로 여러 개의 `ProviderManager` 인스턴스가 하나의 부모 `AuthenticationManager` 를 공유할 수도 있다.

![assets/img/providermanagers-parent.png]({{ site.baseurl }}/assets/img/providermanagers-parent.png)

일부 공통된 인증 로직은 공유된 부모 `AuthenticationManager` 가 처리하고, 각 체인마다 서로 다른 인증 방식을 적용해야 하는 경우는 공통 부모를 두어서 공유 가능한 로직만 `AuthenticationManager` 로 두어 처리하게 하고, `ProviderManager` 1, 2 가 서로 갈 길 가는 즉, 서로 각자의 `FilterChain` 을 거치도록 하면 된다.

##### AuthenticationProvider

실제 인증 로직을 수행하는 핵심 객체이며, `ProviderManager` 에 여러 개 주입할 수 있다.

- `DaoAuthenticationProvider`: 일반적인 아이디 / 비밀번호 인증
- `JwtAuthenticationProvide`: JWT 토큰 기반 인증

##### Request Credentials with AuthenticationEntryPoint

클라이언트에게 인증 정보를 요청할 때 사용되는 컴포넌트이며, 동작 방식을 보자:

1. 클라이언트 인증 없이 보호된 리소스를 요청하면, `AuthenticationEntryPoint` 가 호출
2. HTTP 응답으로 자격 증명 요구 -> 로그인 페이지 리다이렉트 혹은 `WWW-Authenticate` 헤더 등

> 예외: 클라이언트가 이미 인증 정보를 보내는 경우에는 `AuthenticationEntryPoint` 가 별도로 요청을 만들지 않음

##### AbstractAuthenticationProcessingFilter

사용자 인증 요청을 처리하는 Filter

![assets/img/abstractauthenticationprocessingfilter.png]({{ site.baseurl }}/assets/img/abstractauthenticationprocessingfilter.png)

**인증 과정**
1. 사용자가 인증 정보 제출
2. `AbstractAuthenticationProcessingFilter` 가 `HttpServletRequest` 로 부터 인증 정보 읽음
3. `AbstractAuthenticationProcessingFilter` 가 `Authentication` 객체를 생성, 이때 `Authentication` 객체의 타입은 서브 필터에 따라 다름
    - `UserPasswordAuthenticationFilter` -> `UsernamePasswordAuthenticationToken` 생성
    - API 토큰 필터라면 JWT 토큰 기반 `Authentication` 생성

4. 이 `Authentication` 을 `AuthenticationManager` 로 전달
5. 내부적으로 여러 `AuthenticationProvider` 가 순차적으로 인증 시도

**성공**
6. 성공 시
7. `SessionAuthenticationStrategy` 알림
    - 새 세션이 생성되거나 기존 세션 보호 등 세션 관련 처리
    - `SessionAuthenticationStrategy` 인터페이스
8. `SecurityContextHolder` 의 Authentication 설정
    - (선택) `SecurityContext` 저장
9. `RememberMeServices.loginSuccess` 호출
    - 없으면 동작 X
10. `InteractiveAuthenticationSuccessEvent` 발행
11. `AuthenticationSuccessHandler` 호출

**실패**
6. 실패 시
7. `SecurityContextHolder` 초기화
8. `RememberMeServices.loginFail()` 호출
9. `AuthenticationFailureHandler` 호출
    - 인증 실패 시 추가 처리(리다이렉트, 에러 메시지 등)
