---
layout: post
title:  "[멋사 백엔드 19기] TIL 51일차 Spring Security3"
date:   2025-11-09 13:40:12 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차

- [Form](#form)
    - [UsernamePasswordAuthenticationFilter](#usernamepasswordauthenticationfilter)
        - [AbstractAuthenticationProcessingFilter 커스터마이징 하기](#abstractauthenticationprocessingfilter-커스터마이징-하기)

---

## 📚 본문

원래 1000줄 넘는 포스팅이었으나 너무 길어 다 삭제 후 다시 씁니다.

이전에는 이론만 다뤘다면 이번에는 실습을 위주로 다룬다. 독백 형식으로 진행되며, 이해하기가 힘든 부분이 많을 수 있습니다.

### Form

Spring Security 에서 가장 흔하게, 기본적으로 제공하는 기능은 `Form` 기능이다. 이걸 커스터마이징 해보자.

#### UsernamePasswordAuthenticationFilter

우선 기본적으로 `UsernamePasswordAuthenticationFilter` 가 있는데, 이는 톰캣이 가지는 `FilterChainProxy` 의 구현체를 주입하는 과정에서 `SecurityFilterChain` 안에 기본적으로 내장되어 있는 필터이다. 이는 `LogoutFilter` 이후에 위치해 있으며, 로그아웃 요청이 아니라면 인증의 필터가 시작되는 부분이라고 생각하면 된다.

폼 기능은 기본적으로 Username, Password 를 기반으로 하여 동작하기에 우리는 이를 커스터마이징 해야 하며, 커스터마이징 도중에 `User-Agent` 라는 헤더를 잡게끔 만들 것이다(기존 `UsernamePasswordAuthentication` 과의 차별점을 두기 위해).

먼저 기본 설정을 해주자

{% highlight java %}
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http.csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login")
                        .permitAll()
                        .anyRequest()
                        .authenticated())
                .build();
}
{% endhighlight %}

여기서 `formLogin` 만 없음을 알 수 있다. 필터를 만들어주자.

##### AbstractAuthenticationProcessingFilter 커스터마이징 하기

`AbstractAuthenticationProcessingFilter` 이걸 우선 커스터마이징 하려면 내부 구현체를 직접 다 뜯어서 보고 오자(필자는 이미 보고 왔다).

{% highlight java %}
public class LoginIdPasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
	public LoginIdPasswordAuthenticationFilter(String defaultProcessingUrl) {
		super(defaultProcessingUrl);
	}
}
{% endhighlight %}

해당 필터를 쓰기위해 등록해준다.

{% highlight java %}
                        .anyRequest()
                        .authenticated())
                .addFilterAt(loginIdPasswordAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
}

@Bean
public LoginIdPasswordAuthenticationFilter loginIdPasswordAuthenticationFilter() {
    return new LoginIdPasswordAuthenticationFilter("/loginProcessing");
}
{% endhighlight %}

`UsernamePasswordAuthenticationFilter` 를 갈아 끼웠다. 이제 요청 정보에 따라 걸러내주는 메서드를 재정의하자. 재정의하기 전에 걸러낼 기준을 정의해주자.

{% highlight java %}
private final RequestMatcher requestMatcher;

public LoginIdPasswordAuthenticationFilter(String defaultProcessingUrl) {
    super(defaultProcessingUrl);
    requestMatcher = PathPatternRequestMatcher.withDefaults()
            .matcher(HttpMethod.POST, defaultProcessingUrl);
}
{% endhighlight %}

위처럼 정의해주면, 상위 생성자를 받아 상위의 구현을 안흐트리면서 우리만의 구현체를 들고 갈 수 있을 것이다. 이제 다음 메서드를 재정의한다.

{% highlight java %}
@Override
protected boolean requiresAuthentication(HttpServletRequest request, HttpServletResponse response) {
    return requestMatcher.matches(request) 
        && request.getHeader("User-Agent") != null;
}
{% endhighlight %}

이제 다음 할 작업은 `HttpServletRequest` 안의 데이터들은 대부분 `Object` 들로 되어 있다. 이를 `Converter` 로 다루기 쉽게 바꿔주는 작업을 해야한다. 다루기 쉬운 목표 할 객체는 바로 `Authentication` 이다.

커스텀 `Authentication` 을 정의한다.

{% highlight java %}
@Getter
@RequiredArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class LoginIdPasswordAuthenticationToken implements Authentication {
	@EqualsAndHashCode.Include
	private final Object principal;
	@EqualsAndHashCode.Include
	private final Object credentials;
    @Setter
	private Object details;
	@Setter
	private boolean isAuthenticated;
	private Collection<? extends GrantedAuthority> authorities;

	@Override
	public String getName() {
		return "";
	}
}
{% endhighlight %}

위는 `Authentication` 의 정의를 보고, 필요한 메서드들을 `Lombok` 을 토대로 추가하면 되겠다.

이제 다시 돌아와서 `AuthenticationConverter` 를 정의하자.

{% highlight java %}
public class LoginIdPasswordAuthenticationConverter implements AuthenticationConverter {
	@Override
	public LoginIdPasswordAuthenticationToken convert(HttpServletRequest request) {
		LoginIdPasswordAuthenticationToken token
				= new LoginIdPasswordAuthenticationToken(request.getParameter("login_id"),
				                                         request.getParameter("password"));
		return token;
	}
}
{% endhighlight %}

이제 이를 `Filter` 에서 사용할 수 있게하려면 다음 `setAuthenticationConverter` 상위 메서드를 호출하여 지정해준다.

{% highlight java %}
public class LoginIdPasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
	private final RequestMatcher requestMatcher;
    private final LoginIdPasswordAuthenticationConverter authenticationConverter;

	public LoginIdPasswordAuthenticationFilter(RequestMatcher requestMatcher,
	                                           AuthenticationConverter authenticationConverter) {
		super(requestMatcher);
		this.requestMatcher = requestMatcher;
        this.authenticationConverter = authenticationConverter;
		setAuthenticationConverter(authenticationConverter);
	}
{% endhighlight %}

> 구조를 좀 바꿨다.

`Convert` 작업을 했더라도 `principal`, `credentials` 는 추출했지만, `details` 를 추출하진 못했다. 이를 추출하기 위해서 `DetaulsSource` 가 필요하다. `DetailsSource` 는 `Details` 를 추출하여 `Authentication` 에 저장해주는 역할을 하며 어떤 `Details` 의 데이터 구조라도 호환이 되도록 하기 위해 클래스화 되었다.

안에 저장될 details(부수 정보) 를 정의하자.

{% highlight java %}
public record LoginIdPasswordAuthenticationDetails(
		String userAgent
) implements Serializable { }
{% endhighlight %}

이제 `LoginIdPasswordAuthenticationDetails` 를 `AuthenticationDetailsSource` 인터페이스를 통해 반환하도록 하자.

{% highlight java %}
public class LoginIdPasswordAuthenticationDetailsSource
		implements AuthenticationDetailsSource<HttpServletRequest, LoginIdPasswordAuthenticationDetails> {

	@Override
	public LoginIdPasswordAuthenticationDetails buildDetails(HttpServletRequest context) {
		String userAgent = context.getHeader("User-Agent");
		return new LoginIdPasswordAuthenticationDetails(userAgent);
	}
}
{% endhighlight %}

필터에 추가해주자

{% highlight java %}
public class LoginIdPasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
	private final RequestMatcher requestMatcher;
	private final LoginIdPasswordAuthenticationConverter authenticationConverter;
	private final LoginIdPasswordAuthenticationDetailsSource authenticationDetailsSource;

	public LoginIdPasswordAuthenticationFilter(RequestMatcher requestMatcher,
	                                           LoginIdPasswordAuthenticationConverter authenticationConverter,
	                                           LoginIdPasswordAuthenticationDetailsSource authenticationDetailsSource) {
		super(requestMatcher);
		this.requestMatcher = requestMatcher;
		this.authenticationConverter = authenticationConverter;
		this.authenticationDetailsSource = authenticationDetailsSource;
		setAuthenticationConverter(authenticationConverter);
		setAuthenticationDetailsSource(authenticationDetailsSource);
	}
{% endhighlight %}

최종적으로 가장 중요한 메서드인 필터의 행위를 이제 정의하려면 다음 메서드를 오버라이딩 한다.

{% highlight java %}
	@Override
	public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
			throws AuthenticationException, IOException, ServletException {
		LoginIdPasswordAuthenticationToken auth
				= this.authenticationConverter.convert(request);
		LoginIdPasswordAuthenticationDetails details
				= this.authenticationDetailsSource.buildDetails(request);
		auth.setDetails(details);

		
        return null;
	}
{% endhighlight %}

이제 위와 같이 하면 필요한 정보 가공 과정이 끝나게 된다. 이를 `AuthenticationManager` 에게 넘겨줘서 실제 인증을 수행하게 하자. 우선 이 인증 객체에 맞는 `AuthenticationManager` 가 필요할 것이고, 그에 맞는 `Provider` 가 필요할 것이다.

Manager 먼저 정의해주자.

{% highlight java %}
@RequiredArgsConstructor
public class LoginIdPasswordAuthenticationManager implements AuthenticationManager {
	private final LoginIdPasswordAuthenticationProvider authenticationProvider;

	@Override
	public LoginIdPasswordAuthenticationToken authenticate(Authentication authentication) throws AuthenticationException {
		return authenticationProvider.authenticate(authentication);
	}
}
{% endhighlight %}

이제 `Provider(실제 인증 로직 수행)` 을 넣어주자. 여기서 우리 레포지토리에 접근을 하여 실제 유저 정보를 가지고 와서 비교를 하지만, 그거까지 만들면 포스팅이 너무 길어지기에 그냥 `Map` 을 사용해서 하자.

{% highlight java %}
@RequiredArgsConstructor
public class LoginIdPasswordAuthenticationProvider implements AuthenticationProvider {
	private final Map<String, String> repo = new HashMap<>();
	private final PasswordEncoder passwordEncoder;

	@Override
	public LoginIdPasswordAuthenticationToken authenticate(Authentication authentication) throws AuthenticationException {
		LoginIdPasswordAuthenticationToken token
				= (LoginIdPasswordAuthenticationToken) authentication;

		String loginId = token.getPrincipal()
		                      .toString();
		String password = token.getCredentials()
		                       .toString();

		if (!repo.containsKey(loginId))
			repo.put(loginId, passwordEncoder.encode(password));

		if (!passwordEncoder.matches(password, repo.get(loginId)))
			throw new BadCredentialsException("Bad credentials");

		return new LoginIdPasswordAuthenticationToken(
				loginId,
				null,
				null,
				true,
				List.of(new SimpleGrantedAuthority("ROLE_USER")));
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return LoginIdPasswordAuthenticationToken.class.isAssignableFrom(authentication);
	}
}
{% endhighlight %}

여기서 `supports()` 메서드는 해당 클래스가 어떤 authentication 을 받아들일 수 있는지를 정의하는 메서드이다. 이게 없다면 해당 프로바이더는 `LoginIdPasswordAuthenticationToken` 가 와도 받아들일 수 없고 프로그램이 제대로 동작하지 않을 것이다. 이제 이를 등록해주자.

{% highlight java %}
public class LoginIdPasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
	private final RequestMatcher requestMatcher;
	private final LoginIdPasswordAuthenticationConverter authenticationConverter;
	private final LoginIdPasswordAuthenticationDetailsSource authenticationDetailsSource;

	public LoginIdPasswordAuthenticationFilter(RequestMatcher requestMatcher,
	                                           LoginIdPasswordAuthenticationConverter authenticationConverter,
	                                           LoginIdPasswordAuthenticationDetailsSource authenticationDetailsSource,
	                                           LoginIdPasswordAuthenticationManager authenticationManager) {
		super(requestMatcher);
		this.requestMatcher = requestMatcher;
		this.authenticationConverter = authenticationConverter;
		this.authenticationDetailsSource = authenticationDetailsSource;
		setAuthenticationConverter(authenticationConverter);
		setAuthenticationDetailsSource(authenticationDetailsSource);
		setAuthenticationManager(authenticationManager);
	}
{% endhighlight %}

이제 하나 빼고 전부 완성되었는데, 다음을 보자:

{% highlight java %}
@Override
public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
        throws AuthenticationException {
    LoginIdPasswordAuthenticationToken auth
            = this.authenticationConverter.convert(request);
    LoginIdPasswordAuthenticationDetails details
            = this.authenticationDetailsSource.buildDetails(request);
    auth.setDetails(details);

    return this.getAuthenticationManager().authenticate(auth);
}
{% endhighlight %}

이렇게 만들어지는 `Authentication` 을 `ContextHolder` 에 저장을 해주어야 한다.

Spring Security 는 인증 객체 저장을 단순히 `SecurityContextHolder.setContext()` 로 끝내지 않는다. 컨텍스트의 생성/저장/세션 반영 과정 전체가 전략 패턴을 통해 세밀하게 나뉘어 있기 때문이다. 그 전략을 보자.

`AbstractAuthenticationProcessingFilter` 안에 `SecurityContext` 를 어디에 저장할지 결정하는 전략 객체가 있다.

{% highlight java %}
private SecurityContextHolderStrategy securityContextHolderStrategy =
        SecurityContextHolder.getContextHolderStrategy();
{% endhighlight %}

**기본적으로 Spring Security 는 `ThreadLocal` 기반의 전략을 사용**하기에 인증 객체가 `SecurityContextHolder` 안에 스레드 안전하게 보관된다. 보통 이 전략을 건드릴 일은 없을 것이다.

다음으로 인증 이후에 세션을 어떻게 처리할지 결정하는 전략이 필요하다.

{% highlight java %}
private SessionAuthenticationStrategy sessionStrategy =
        new NullAuthenticatedSessionStrategy();
{% endhighlight %}

`SessionAuthenticationStrategy` 가 그 역할을 하게 되며, 여기서는 `NullAuthenticatedSessionStrategy` 을 사용하고 있기에, 인증을 완료하더라도 세션을 갱신하거나 바꾸는 작업(JSESSION 이 바뀌는 것)은 수행하지 않는다(세션이 아예 없는게 아니라 인증을 해도 세션에 아무 영향도 안끼치겠다는 의미이다). 나중에 세션 기반 로그인 유지가 필요하다면, `SessionFixationProtectionStrategy` 또는 추가적인 세션 관리 전략으로 교체할 수 있겠다.

마지막으로는 `SecurityContext` 를 실제로 저장할 저장소가 필요하다. `SecurityContextRepository` 가 이를 담당하게 된다.

{% highlight java %}
private SecurityContextRepository securityContextRepository =
        new RequestAttributeSecurityContextRepository();
{% endhighlight %}

`RequestAttributeSecurityContextRepository` 는 `SecurityContext` 를 세션이 아닌 `HttpServletRequest` 의 attribute 에 저장하는 구현체이다.

현재 요청 안에서는 인증 상태가 유지가 되지만, 다음 요청으로 넘어가면 `SecurityContext` 가 초기화 된다. 여기서 세션 인증 기반 인증을 유지하고 싶다면 `HttpSessionSecurityContextRepository` 로 교체 해야한다.

따라서 필터에 다음을 추가한다.

{% highlight java %}
public LoginIdPasswordAuthenticationFilter(RequestMatcher requestMatcher,
                                            LoginIdPasswordAuthenticationConverter authenticationConverter,
                                            LoginIdPasswordAuthenticationDetailsSource authenticationDetailsSource,
                                            LoginIdPasswordAuthenticationManager authenticationManager,
                                            SecurityContextRepository securityContextRepository) {
    super(requestMatcher);
    this.requestMatcher = requestMatcher;
    this.authenticationConverter = authenticationConverter;
    this.authenticationDetailsSource = authenticationDetailsSource;
    setAuthenticationConverter(authenticationConverter);
    setAuthenticationDetailsSource(authenticationDetailsSource);
    setAuthenticationManager(authenticationManager);
    setSecurityContextRepository(securityContextRepository);
}
{% endhighlight %}

아직 끝난게 아니다.. 로그인이나 회원가입에 성공시에는 성공 후에 어떤 작업을 수행해야하는지를 정의해야 한다. 이는 `AuthenticationSuccessHandler` 로 정의할 수 있다.

{% highlight java %}
public class LoginIdPasswordAuthenticationSuccessHandler
		implements AuthenticationSuccessHandler {
	@Override
	public void onAuthenticationSuccess(HttpServletRequest request,
	                                    HttpServletResponse response,
	                                    Authentication authentication) throws IOException {
		response.sendRedirect("/");
	}
}
{% endhighlight %}

이를 필터에 추가해주고, config 도 설정해주자(이는 알아서). 이제 설정을 추가해주자.

{% highlight java %}
	@Bean
	public LoginIdPasswordAuthenticationFilter loginIdPasswordAuthenticationFilter(
			PasswordEncoder passwordEncoder,
			HttpSessionSecurityContextRepository securityContextRepository
	) {
		
		LoginIdPasswordAuthenticationProvider provider
				= new LoginIdPasswordAuthenticationProvider(passwordEncoder);
		LoginIdPasswordAuthenticationManager manager = new LoginIdPasswordAuthenticationManager(provider);

		RequestMatcher requestMatcher
				= PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.POST, "/loginProcessing")

		return new LoginIdPasswordAuthenticationFilter(
				requestMatcher,
				new LoginIdPasswordAuthenticationConverter(),
				new LoginIdPasswordAuthenticationDetailsSource(),
				manager,
				securityContextRepository
				);
	}

	@Bean
	public HttpSessionSecurityContextRepository httpSessionSecurityContextRepository() {
		return new HttpSessionSecurityContextRepository();
	}

	@Bean
	public LoginIdPasswordAuthenticationManager loginIdPasswordAuthenticationManager(
			LoginIdPasswordAuthenticationProvider loginIdPasswordAuthenticationProvider
	) {
		return new LoginIdPasswordAuthenticationManager(loginIdPasswordAuthenticationProvider);
	}

	@Bean
	public LoginIdPasswordAuthenticationProvider loginIdPasswordAuthenticationProvider(
			PasswordEncoder passwordEncoder
	) {
		return new LoginIdPasswordAuthenticationProvider(passwordEncoder);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
{% endhighlight %}

이제 실제로 돌아가는지 본다.

{% highlight java %}
@Controller
public class MyController {
	@GetMapping("/login")
	public String login() {
		return "login";
	}

	@GetMapping
	@ResponseBody
	public String welcome() {
		return "welcome!!!";
	}
}
{% endhighlight %}

![assets/img/spring-security-filter-authenticate.png]({{ site.baseurl }}/assets/img/spring-security-filter-authenticate.png)

다음 포스팅은 jwt 가 되겠다.