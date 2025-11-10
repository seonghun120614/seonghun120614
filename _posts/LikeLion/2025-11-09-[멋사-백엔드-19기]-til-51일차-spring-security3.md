---
layout: post
title:  "[멋사 백엔드 19기] TIL 51일차 Spring Security3"
date:   2025-11-09 13:40:12 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차

- [UsernamePasswordAuthentication](#usernamepasswordauthentication)
    - [Publish an AuthenticationManager bean](#publish-an-authenticationmanager-bean)

---

## 📚 본문

이전에는 이론만 봤다면 여기서는 실습이 위주가 된다.

### UsernamePasswordAuthentication

인증 방법 중에 가장 흔하고 일반적인 방식은 사용자 이름과 비밀번호를 검증하는 것이다.

**예시**

{% highlight java %}
@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http)
			throws Exception {
		http
				.authorizeHttpRequests(authorize -> authorize
						.anyRequest()
						.authenticated()
				)
				.httpBasic(Customizer.withDefaults())
				.formLogin(Customizer.withDefaults());

		return http.build();
	}

	@Bean
	public UserDetailsService userDetailsService() {
		UserDetails userDetails = User.withDefaultPasswordEncoder()
				.username("user")
				.password("password")
				.roles("USER")
				.build();
		return new InMemoryUserDetailsManager(userDetails);
	}
}
{% endhighlight %}

#### Publish an AuthenticationManager bean

이때 사용자 정의 인증을 위해 보통 `AuthenticationManager` 빈을 직접 커스터마이징하여서 등록할 수 있다. 커스터마이징 하기 위해 `AuthenticationManager` 를 들고와서 `Bean` 으로 등록하게 하자.

{% highlight java %}
@Bean
public AuthenticationProvider authenticationProvider() {
    // TODO
}
{% endhighlight %}

여기서는 `AuthenticationProvider` 내부적으로