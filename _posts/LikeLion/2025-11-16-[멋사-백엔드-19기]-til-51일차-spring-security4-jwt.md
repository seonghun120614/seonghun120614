---
layout: post
title:  "[멋사 백엔드 19기] TIL 51일차 Spring Security4 JWT"
date:   2025-11-09 13:41:12 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차

- [JWT](#jwt)
  - [JWT 구조](#jwt-구조)
  - [JWT 인증 흐름](#jwt-인증-흐름)
  - [Spring Security 에서의 JWT 구현 시 관련된 필터](#spring-security-에서의-jwt-구현-시-관련된-필터)
- [JWT 구현](#jwt-구현)
  - [OncePerRequestFilter](#onceperrequestfilter)
  - [JwtProperties](#jwtproperties)
  - [JwtTokenizer](#jwttokenizer)
  - [doFilterInternal](#dofilterinternal)
  - [JwtAuthenticationToken](#jwtauthenticationtoken)
    - [테스트: authorization 의 헤더는 없지만, 아이디와 비밀번호는 전부 맞을때 refresh token 과 access token 을 반환](#테스트-authorization-의-헤더는-없지만-아이디와-비밀번호는-전부-맞을때-refresh-token-과-access-token-을-반환)
    - [테스트: 받은 헤더를 토대로 login 을 다시 진행](#테스트-받은-헤더를-토대로-login-을-다시-진행)
    - [테스트: 받은 헤더를 토대로 welcom 요청](#테스트-받은-헤더를-토대로-welcom-요청)
    - [테스트: 토큰이 없다면 403](#테스트-토큰이-없다면-403)

---

## 📚 본문

### JWT

JWT 는 클라이언트와 서버 간에 인증 정보를 주고받기 위해 사용되는 토큰 기반 인증방식이며, 서명에는 단방향 암호화 알고리즘을 사용하게 된다.

#### JWT 구조

JWT 는 .으로 구분되어져 있는 3개의 파트로 구분한다.

1. `Header`
    - 알고리즘 및 토큰 타입 지정

{% highlight json %}
{
  "alg": "HS256",
  "typ": "JWT"
}
{% endhighlight %}

2. `Payload`

실제로 담을 데이터가 들어가게 되며, 클레임이라는 구조적인 데이터가 보통 들어가며, 이는 단순히 `Base64URL` 인코딩이 들어간다. 이는 누구나 열어볼 수 있다.

**Claim**

- `sub`: 유저 식별자(ID)
- `iat`: 발행 시간
- `exp`: 만료 시간
- `roles`: 권한 정보

3. `Signature`

서버가 **Secret Key**로 서명한 값이 들어가며, 토큰 위변조 방지를 위해 넣게 된다. 이는 위 Header 에서 쓰이는 알고리즘에 따라 암호화되어 들어가게 된다.

> 시크릿 키는 서명을 만들 때 사용하는 비밀값인데, 이는 환경변수에 저장되거나 개발 환경일 때는 보통 `application.yml` 에 저장되어서 주입받게 된다.

#### JWT 인증 흐름

1. 사용자가 로그인 요청
2. 서버가 로그인 성공 시 JWT 생성하여 반환
3. 클라이언트는 JWT 를 저장
4. API 요청 시 `Authorization` 헤더에 JWT 포함시켜 보내어 인가 수행

#### Spring Security 에서의 JWT 구현 시 관련된 필터

- `AuthenticationFilter`: 로그인 요청을 가로채어 ID/PW 검증 후 JWT 를 발급하도록 만들어야 함
- `JwtAuthenticationFilter`: 모드 요청마다 `Authorization` 헤더의 `JWT` 유효성 검증을 해야 함, 만약 유효하다면 `SecurityContextHolder` 에 `Authentication` 생성
- `AuthenticationEntryPoint`: 인증 실패 시 `401 Unauthorized` 응답으로 처리
- `AccessDeniedHandler`: 인가 실패 시 `403 Forbidden` 응답으로 처리
- `TokenProvider`: JWT 생성/검증 기능을 담당

이제 구현을 해보자.

### JWT 구현

JWT 를 하기 전에 보통 JWT 는 중간에 탈취하면 위험해진다. 이를 방지하기 위한 차선책으로 보통 JWT 토큰의 유효 시간을 부여하게 되며, `Access Token` 이라고 불리는 토큰에는 만료 시간을 보통 5-30분으로 하게 된다.

하지만, 유저가 계속 이를 재발급해야 하는 사용자 경험 때문에 `Refresh Token` 이라는 것을 따로 만들어 이를 토대로 `Access Token` 의 갱신을 신경 안써도 서비스를 원할히 이용할 수 있도록 한다. 보통 갱신 토큰도 만료 시간이 있는데, 7일 이상 30일까지도 가는 경우가 있다.

이 `Access Token` 은 보통 유저가 가지며, `Refresh Token` 은 서버가 가지게 된다(`Refresh Token` 을 유저가 가질 때도 있다).

여기서는 `Access Token` 를 유저만 가질 때를 볼 것이다.

#### OncePerRequestFilter

보통 일반적인 필터는 `GenericFilterBean` 를 상속받아 구현하면 된다. 내부 코드는 알아서 파보길 바란다. 여기서는 다 다룰 수가 없다. 필터의 `doFilterInternal` 을 구현해주어야 한다.

{% highlight java %}
public class JwtFilter extends OncePerRequestFilter {
	@Override
	protected void doFilterInternal(HttpServletRequest request,
	                                HttpServletResponse response,
	                                FilterChain filterChain)
			throws ServletException, IOException {

	}
}
{% endhighlight %}

이때, 할 동작으로는 request 의 데이터를 추출하는 것일거다. 헤더쪽에 `Authorization` 에 보통 `Bearer` 로 토큰이 들어가게 된다.

이는 HTTP 표준(RPC)과 OAuth 2.0 규격에서 정한 관습인데, 헤더 쪽에 들어갈 데이터의 스킴을 어떻게 쓸지를 규정해놨다. 보통 `Basic (유저이름 및 패스워드)` 은 `Basic` 기본 인증 방식을 쓰도록 하며, 토큰 기반 인증 방식은 `Bearer (토큰)` 으로 명시하도록 scheme 가 짜여져 있다.

따라서 다음과 같이 코드를 짜자.

{% highlight java %}
private String getRawToken(HttpServletRequest request) throws JwtException {
  String authHeader = request.getHeader("Authorization");
  if (authHeader == null || !authHeader.startsWith("Bearer "))
    return null;
  return authHeader.substring("Bearer ".length());
}
{% endhighlight %}

`doFilterInternal` 은 다음을 추가한다.

{% highlight java %}
String rawToken = getRawToken(request);

if (rawToken == null || rawToken.isEmpty()) {
  filterChain.doFilter(request, response);
  return;
}
{% endhighlight %}

이제 이 `rawToken` 으로 토큰화 되어있는 JWT 를 복호화 해줘야 한다. 이때 `JwtTokenizer` 클래스가 필요할 수 있다. tokenizer 가 알아야 할 값은 시크릿 키이다. 임의로 발급되어 저장된 Access Secret Key 와 Refresh Secret Key 두 개의 비밀 키가 필요할 것이다. 보통 이는 환경변수로 가져올 수 있고, 아니면 개발 단계에서는 `application.yml` 에서 들고와도 된다.

#### JwtProperties

{% highlight java %}
public class JwtProperties {
	private String issuer;
	private String accessKey;
	private String refreshKey;

	private long accessExpirationMs;
	private long refreshExpirationMs;

	public byte[] getAccessKeyBytes() {
		return accessKey.getBytes(StandardCharsets.UTF_8);
	}

	public byte[] getRefreshKeyBytes() {
		return refreshKey.getBytes(StandardCharsets.UTF_8);
	}
}
{% endhighlight%}

여기서 보통 Mac 과 Linux 는 대부분 `UTF-8` 의 인코딩 방식을 사용하니 가져올 때 charset 을 그렇게 지정해주자. 이 뿐 아니라 만료 기간도 필요할 수 있으니 이 또한 설정 파일을 토대로 수정되도록 `Value` 를 써서 주입시켜주자. 이제 이를 주입받는 `JwtTokenizer` 를 선언한다.

#### JwtTokenizer

{% highlight java %}
@RequiredArgsConstructor
public class JwtTokenizer {
	private final JwtProperties jwtProperties;

  // ...
}
{% endhighlight %} ㄴ

토크나이저는 일단 토큰을 생성하는 기능이 있어야 한다. 생성할 때는 다음과 같은 데이터가 전부 필수가 아니지만 있어야 한다.

- Header
  - `alg`
  - `type`
- Payload
  - `sub`: 유저 식별자(ID)
  - `iat`: 발행 시간
  - `exp`: 만료 시간
  - `roles`: 권한 정보
  - 추가 유저 정보
- Signature
  - 시크릿 키

따라서 위를 인자로 받아주는 토큰을 생성하는 함수를 만들어주자. 만들기 전에 이를 만들어주는 jwt 의존성을 추가해준다.

{% highlight java %}
implementation 'io.jsonwebtoken:jjwt-api:0.12.6'  // JWT 표준 API 인터페이스
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.6'  // JWT 생성/검증 로직 구현체
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.6' // JSON 직렬화/역직렬화를 위한 Jackson 기반 모듈
{% endhighlight %}

이제 토큰을 생성하는 함수를 정의하자. 토큰은 . 을 기준으로 `header`, `payload`, `signature` 의 String 으로 되어있기 때문에 반환은 String 으로 해준다.

{% highlight java %}
private String tokenize(
    long expiration,
    String loginId,
    Collection<? extends GrantedAuthority> roles,
    byte[] secretKey
) {
  // ...
}
{% endhighlight %}

`Jwts` 에는 각종 유틸 함수들이 들어가 있다. builder 로 JWT 를 생성하도록 할 수 있으며, 다양한 옵션들을 넣을 수 있다(헤더도 넣을 수 있는 것으로 알고 있다).

여기서 `signWith` 을 할 때는 `signature` 가 들어가야하며 `byte[] key` 가 들어가면 안되고, SecretKey 가 들어가야 한다. `Keys` 유틸성 함수를 통해 단방향 암호화 알고리즘을 사용해 생성해주자.

{% highlight java %}
private SecretKey createSecretKey(byte[] key) {
  return Keys.hmacShaKeyFor(key);
}

private String tokenize(
    long expiration,
    String loginId,
    Collection<? extends GrantedAuthority> roles,
    byte[] secretKey
) {
  Date expiry = new Date(System.currentTimeMillis() + expiration);
  return Jwts.builder()
              .issuer(jwtProperties.getIssuer())
              .expiration(expiry)
              .claim("loginId", loginId)
              .claim("roles", roles)
              .signWith(createSecretKey(secretKey))
              .compact();
}
{% endhighlight %}

이제 토큰 생성이 끝났다. access, refresh 별로 나눠주자.

{% highlight java %}
public String accessTokenize(
    String loginId,
    Collection<? extends GrantedAuthority> roles
) {
  return tokenize(jwtProperties.getAccessExpirationMs(),
                  loginId,
                  roles,
                  jwtProperties.getAccessKeyBytes());
}

public String refreshTokenize(
    String loginId,
    Collection<? extends GrantedAuthority> roles
) {
  return tokenize(jwtProperties.getRefreshExpirationMs(),
                  loginId,
                  roles,
                  jwtProperties.getRefreshKeyBytes());
}
{% endhighlight %}

토큰화 하는게 끝났다면 토큰을 다시 파싱하여 plain 형태로 되돌리는 것도 필요하다.

{% highlight java %}
public Claims parse(String token) throws JwtException {
  log.info("👾 token({}) 유효 검증 중...", token);
  try {
    return Jwts.parser()
                .verifyWith(createSecretKey(jwtProperties.getAccessKeyBytes()))
                .requireIssuer(jwtProperties.getIssuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
  } catch (MissingClaimException | IncorrectClaimException e) {
    throw new BadCredentialsException(".requiredIssuer 처리 중 오류 " + e.getMessage());
  } catch (UnsupportedJwtException e) {
    throw new BadCredentialsException("the jwt argument does not represent a signed Claims JWT");
  } catch (IllegalArgumentException e) {
    throw new BadCredentialsException("the jwt string is null or empty or only whitespace");
  }
}
{% endhighlight %}

이제 이걸 filter 에서 쓰고, authentication 을 만들어주는 것을 선언하자.

#### doFilterInternal

{% highlight java %}
public class JwtAuthenticationFilter extends OncePerRequestFilter {
	private final static List<GrantedAuthority> DEFAULT_ROLES
			= List.of(new SimpleGrantedAuthority("ROLE_USER"));
	private final JwtTokenizer jwtTokenizer;
  
  ...

  	protected void doFilterInternal(HttpServletRequest request,
	                                HttpServletResponse response,
	                                FilterChain filterChain)
			throws ServletException, IOException {
    
    String loginId = null;
		boolean isAuthenticated = false;
		String rawToken = getRawToken(request);
    
    // ...

		try {
			var claims = jwtTokenizer.parse(rawToken);
			loginId = claims.get("loginId", String.class);
			isAuthenticated = true;

		}
{% endhighlight %}

여기서 토큰을 파싱할 때 만료된 토큰이라면 여기서 예외를 발생시키게 된다. 따라서 이를 try 문으로 감싸주고 catch 절을 추가해준다.

{% highlight java %}
} catch (ExpiredJwtException e) {
  loginId = getLoginIdWithoutAuth(rawToken);
  refreshTokenRepository
      .findByLoginId(loginId)
      .orElseThrow(() -> new BadCredentialsException("없는 사용자"));
  // refreshToken 검증을 위한 추가 처리
  String accessToken = jwtTokenizer.accessTokenize(loginId, DEFAULT_ROLES);
  response.setStatus(HttpServletResponse.SC_OK);
  response.setHeader("Authorization", "Bearer " + accessToken);
  isAuthenticated = true;
{% endhighlight %}

이때 여기서는 그냥 단순히 `refreshToken` 이 있는지 없는지만을 확인하고 넘어가며, 나중에 이에 대한 추가적인 인증 처리가 저기에 필요할 것이다. 또한 저기서 rawToken 에 대한 인증이 없을 때, `loginId` 만을 빼오게 할 수 있다. 이는 따로 함수로 만들어서 한다(`ObjectMapper` 가 필요할 것이다). 이제 auth 를 만들어 컨텍스트에 저장해주고 넘겨주자.

#### JwtAuthenticationToken

{% highlight java %}
@Getter
@Builder
public class JwtAuthenticationToken implements Authentication {
	private Object principal;
	private Object credentials;
	private Object details;
	private Collection<? extends GrantedAuthority> authorities;
	@Setter
	private boolean isAuthenticated;

	@Override
	public String getName() {
		return this.principal.toString();
	}
}
{% endhighlight %}

위와 같이 만들어준다.

{% highlight java %}
} finally {
  Authentication auth = JwtAuthenticationToken.builder()
                                              .principal(loginId)
                                              .credentials(null)
                                              .authorities(DEFAULT_ROLES)
                                              .isAuthenticated(isAuthenticated)
                                              .build();
  SecurityContextHolder.getContext()
                        .setAuthentication(auth);
  filterChain.doFilter(request, response);
}
{% endhighlight %}

이제 필터는 다 만들었으므로 이를 추가해주자.

{% highlight java %}
				.addFilterAfter(jwtAuthenticationFilter, LogoutFilter.class)
{% endhighlight %}

이 이후에는 json 의 loginId, password 를 처리하도록 해주는 security3 포스팅을 보고 이를 **"잘"** 들고온다. 이제 테스트를 수행하자.

##### 테스트: authorization 의 헤더는 없지만, 아이디와 비밀번호는 전부 맞을때 refresh token 과 access token 을 반환

{% highlight bash %}
curl -L -i -H "Content-Type: application/json" \
-d '{"loginId":"test","password":"1234"}' \
http://localhost:8080/login
{% endhighlight %}

본인은 그냥 application 에 repo를 들고와서 임의로 값을 넣었다.

##### 테스트: 받은 헤더를 토대로 login 을 다시 진행

{% highlight bash %}
curl -L -i \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer (Bearer Token)" \
     -d '{"loginId":"test","password":"1234"}' \
     http://localhost:8080/login
{% endhighlight %}

이때는 refreshToken 과 accessToken 이 이미 발급됐기 때문에 다시 발급하는 일이 없어야 하며, 로그인이 정상적으로 처리돼어 로그인 처리 이후 default url 인 `/welcome` 으로 넘기도록 해줘야 한다.

##### 테스트: 받은 헤더를 토대로 welcom 요청

{% highlight java %}
curl -L -i \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer (Bearer token)" \
     http://localhost:8080/welcome
{% endhighlight %}

##### 테스트: 토큰이 없다면 403

{% highlight java %}
curl -L -i \
     -H "Content-Type: application/json" \
     http://localhost:8080/welcome
{% endhighlight %}

실패 요청은 알아서 해보길 바란다.