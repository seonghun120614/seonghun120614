---
layout: post
title:  "[멋사 백엔드 19기] TIL 47일차 Reactive Programming"
date:   2025-10-30 09:07:23 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차

- [Reactor](#reactor)
    - [Publisher-Subscriber](#publisher-subscriber)
    - [Mono, Flux](#mono-flux)
        - [Creation Operator](#creation-operator)
        - [Transformation Operator](#transformation-operator)
        - [Filtering Operator](#filtering-operator)
        - [Combination Operator](#combination-operator)
        - [Error Handling Operator](#error-handling-operator)
    - [병렬 처리](#병렬-처리)
        - [Scheduler](#scheduler)
        - [Parallel Operator](#parallel-operator)

- [Reactive Programming]()
    - [R2DBC](#r2dbc)
        - [순수 R2DBC 의존성 추가](#순수-r2dbc-의존성-추가)
        - [ConnectionFactory 설정](#connectionfactory-설정)
        - [ConnectionFactory 인터페이스](#connectionfactory-인터페이스)
        - [Connection](#connection)
        - []()

---

## 📚 본문

### Reactor

`Spring WebFlux` 의 핵심 부분이 바로 리액터가 있다. 리액터는 **Reactive Streams** 표준(**Publisher-Subscriber 모델**) 을 구현한 Java 라이브러리이며 그 중 **Reactor Core** 는 핵심 모듈로, 비동기/논블로킹 데이터 스트림을 처리하기 위한 API 를제공해준다.

`Spring WebFlux` 는 내부적으로 **Reactor Core** 를 사용하여 HTTP 요청/응답, DB, 파일, 외부 API 호출 등을 Reactive 방식으로 연결한다.

#### Publisher-Subscriber

`Publisher` 는 무언가를 생성하는 책임을 맡은 객체이다. `Reactor` 에서 `Flux` 와 `Mono` 가 바로 이 역할을 한다. Subscriber 는 반대로 무언가를 소비하는 역할을 하는 객체이며, 데이터를 `request` 보내고 `subscribe` 하여 소비하게 된다.

이런 Subscription 관계가 성립되면, 데이터 흐름이 제어가 되며, `backpressure` 가 지원이 된다.

> **Backpressure(배압)**: `Subscriber` 가 너무 많은 데이터를 한번에 못받아서 특정 신호를 보내면 알아서 `Publisher` 가 전송 속도를 조절하는 기능이다.

이제 `Publisher` 를 생성해보자.

#### Mono, Flux

이 두 클래스는 `Publisher` 이며, `Mono` 는 말 그대로 0 또는 1개의 데이터를 비동기로 생산하고, `Flux` 는 0-N 개의 데이터를 비동기로 생산할 수 있다.

{% highlight java %}
Mono<String> mono = Mono.just("Hello Reactor");
mono.map(String::toUpperCase)
    .subscribe(System.out::println);  // HELLO REACTOR

Flux<Integer> flux = Flux.range(1, 5);
flux.map(i -> i * 2)
    .subscribe(System.out::println);  // 2 4 6 8 10
{% endhighlight %}

##### Creation Operator

`Mono`, `Flux` 메서드에는 다음과 같은 메서드들이 있다.

- `just(T value)`: 단일 값 또는 여러값 발행
- `empty()`: 아무 값도 발행하지 않음
- `error(Throwable e)`: 에러 신호 발행
- `fromCallable(Supplier<T>)`: `Iterable` 을 `Flux` 로 변환
- `fromIterator(Iterable<T>)`: `Callable` 의 결과를 발행
- `range(int start, int count)`: 특정 범위의 정수 `Flux`
- `interval(Duration)`: 일정 주기로 `Long` 값 발행, `Flux.interval()`

**타이머**
{% highlight java %}
@GetMapping(path = "/timer")
public Flux<String> timer() {
    return Flux.interval(Duration.ofSeconds(1))
                .map(i -> i + "초 후 입니다.\n");
}
@GetMapping(path = "/time")
public Flux<String> time() {
    return Flux.interval(Duration.ofSeconds(1))
            .map(i -> LocalDateTime.now().toString());
}
{% endhighlight %}

##### Transformation Operator

- `map(Function<T, R>)`: 각 요소를 변환한다.
- `flatMap(Function<T, Publisher<R>>)`: 내부 Publisher 를 병합한다.
- `concatMap()`: 순서를 보장하면서 flatMap 을 함
- `switchMap()`: 가장 최근 구독만 유지
- `defaultIfEmpty(T)`: 비어 있을 때 기본값 대체
- `switchIfEmpty(Publisher<T>)`: 비어있을 때 다른 Publisher 로 대체
- `collectList()`: `Flux` -> `Mono<List>`

**collectList()**
{% highlight java %}
@GetMapping(path = "/odds")
public Mono<List<String>> odds() {
    return Flux.range(1, 10)
                .filter(i -> i % 2 == 0)
                .map(i -> String.valueOf(i * 10))
                .collectList();
}
{% endhighlight %}

##### Filtering Operator

- `filter(Predicate<T>)`: 조건을 만족하는 데이터만 발행
- `take(long n)`: n 개의 데이터만 발행
- `skip(long n)`: n 개의 데이터 건너뛴 후 발행
- `distinct()`: 중복 제거, 중복 기준은 `equals()`
- `takeWhile(Predicate<T>)`: 조건이 참일 동안 발행
- `skipWhile(Predicate<T>)`: 조건이 참인 동안 건너뜀

##### Combination Operator

- `merge(Publisher...)`: 여러 `Flux` 를 병합, 순서 보장 X
- `concat(Publisher...)`: 순서를 보장하며 연결

**merge, concat 차이**
{% highlight java %}
@GetMapping(path = "/merge")
public Flux<String> merge() {
    var f1 = Flux
            .interval(Duration.ofMillis(300))
            .map(i -> "A" + i);
    var f2 = Flux.interval(Duration.ofMillis(700))
                    .map(i -> "B" + i);
    return Flux.merge(f1, f2);
}

@GetMapping(path = "/concat")
public Flux<String> concat() {
    var f1 = Flux
            .interval(Duration.ofMillis(300))
            .map(i -> "A" + i);
    var f2 = Flux.interval(Duration.ofMillis(700))
                    .map(i -> "B" + i);
    return Flux.merge(f1, f2);
}
{% endhighlight %}

- `zip(Publisher..., BiFunction)`: 여러 `Publisher` 의 데이터를 조합

**zip 예시**
{% highlight java %}
// 두 Flux 를 묶어서 새로운 문자열 Flux 생성
return Flux.zip(names, ages, (name, age) -> name + " is " + age + " years old");
{% endhighlight %}

- `combineLatest(Publisher..., Function)`: 가장 최근 값들로 조합

**combineLatest 예시**
{% highlight java %}
// 두 Flux 를 묶어서 새로운 문자열 Flux 생성
return Flux.zip(names, ages, (name, age) -> name + " is " + age + " years old");
{% endhighlight %}

##### Error Handling Operator

- `onErrorReturn(T)`: 에러 시 기본값 반환
- `onErrorResume(Function<Throwable, Publisher<T>>)`: 대체 Publisher 로 전환
- `retry(long n)`: 에러 시 n 번 재시도

**에러 처리**
{% highlight java %}
@GetMapping(path = "/error")
public Flux<Integer> error() {
    return Flux.just(1, 2, 0, 4)
            .map(i -> 10 / i)
            .onErrorReturn(-1)
//			.onErrorResume(e -> Flux.just(100, 200));
}

@GetMapping(path = "/error2")
public Flux<Integer> error2() {
    return Flux.range(1, 5)
            .map(i -> 10 / (i - 3))
            .retry(2);
}
{% endhighlight %}

#### 병렬 처리

`Reactor` 는 기본적으로 스레드를 직접 만들지 않으며, 스레드 생성/관리라는 개념을 `Scheduler` 라는 개념을 통해 스레드 풀을 사용하게 된다.

##### Scheduler

{% highlight java %}
import reactor.core.scheduler.Schedulers;
{% endhighlight %}

`Reactor` 의 스레드 풀을 추상화 한게 `Scheduler` 이다. 스프링에서는 요청 처리나 I/O 작업에 맞게 적절한 스케줄러를 선택해주는게 핵심이며, 각 작업 유형들을 토대로 스레드 풀을 다음과 같이 불러올 수 있다.

- `Schedulers.parallel()`: CPU 바운드 작업용, 코어 수만큼의 고정 스레드가 할당되어짐
- `Schedulers.boundedElastic()`: I/O 바운드 작업용, 스레드 수 자동으로 확장 가능함
- `Schedulers.single()`: 단일 스레드로 순차 실행
- `Schedulers.immediate()`: 현재 스레드 그대로 사용
- `Schedulers.fromExecutorService()`: 사용자 정의 `Executor` 사용

이를 이제 `Flux` 의 데이터 흐름 사이에 적절히 추가하여 병렬적으로 처리가 가능하도록 한다.

##### Parallel Operator

`Flux` 에는 다음을 적용할 수 있다.

- `publishOn(Scheduler)`: 이 이후 단계의 실행 스레드를 변경
- `subscribeOn(Scheduler)`: 전체 체인의 실행 스레드를 지정

**병렬 처리**
{% highlight java %}
@GetMapping(path = "/async")
public Flux<String> async() {
    return Flux.range(1, 3)
            .publishOn(Schedulers.parallel())
            .map(i -> i + " processed on " + Thread.currentThread().getName());
}
{% endhighlight %}

**pubishOn, subscribeOn 차이**
{% highlight java %}
Flux.range(1, 3)
    .map(i -> log("map1", i))
    .publishOn(Schedulers.parallel())     // 여기서부터 병렬 스케줄러로 전환
    .map(i -> log("map2", i))
    .subscribeOn(Schedulers.boundedElastic()); // 구독 및 전체 체인 실행은 elastic 스레드에서
{% endhighlight %}

출력은 다음과 같다.

{% highlight java %}
map1: elastic-1
map2: parallel-2
{% endhighlight %}

여기까지가 데이터의 기본적인 처리를 보았다. 다음은 이를 시스템에 적용할 차례다.

### Reactive Programming

리액티브 프로그래밍(reactive programming) 은 **비동기 데이터 흐름(asynchronous data stream)** 을 중심으로 변화에 자동으로 반응하도록 구성하는 프로그래밍 패러다임이다.

{% highlight java %}
int a = 1;
int b = a + 2;
System.out.println(b);
{% endhighlight %}

위의 코드에서는 a 가 바뀌어도 b 는 바뀌지 않고, 다시 계산을 해야 b 가 바뀌게 된다. a 가 바뀔때 자동적으로 b가 바뀔 수 있도록 처리해주는 프로그래밍 패러다임이 바로 리액티브 프로그래밍이다.

**리액티브 프로그래밍 특징**
- **비동기(Asynchronous)**: 요청 후 기다리지 않고, 응답이 오면 반응하는 방식
- **논블로킹(Non-blocking)**: 스레드가 대기하지 않고 다른 작업을 수행 가능
- **데이터 스트림(Stream)**: 이벤트, 데이터, 신호를 “흐름”으로 처리
- **이벤트 기반(Event-driven)**: 데이터 변화(이벤트)가 발생하면 자동 반응
- **Backpressure(배압)**: 소비자가 처리 가능한 만큼만 요청 (과부하 방지)

시스템 전반적으로 reactive 해야 위의 특징들을 전부 가져갈 수 있게 된다. `Controller` 단에서만 비동기를 쓰거나, `Controller` + `Service` 에 비동기 + 논블로킹 을 써서 이점을 충분히 가져갈 수 있지만, `Repository` 까지 그 수준을 높인다면 굉장히 효율적이게 될 것이다.

> `Controller` 만 Reactive 해서는 아무런 의미가 없다. 저수준 부터 쭉 Reactive 해야 그 장점을 극대화 할 수 있다.

따라서 이런 `Reactive` 한 `Repository` 의 `Connection` 을 위해 `R2DBC` 라는 의존성을 추가해야 한다.

#### R2DBC

기존 순수 `JDBC` 는 스레드 당 하나의 동기 I/O, DB 호출 동안 호출한 스레드를 대기(block) 시키는게 규칙이었다. 대신 `R2DBC` 는 논블로킹 리액티브 API 이다. I/O 가 논블로킹으로 처리가 되기 때문에 스레드가 대기하지 않는다. 이 말은 I/O 바운드 작업 시 해당 스레드가 기다리지 않고 또 다른 작업(CPU 바운드 작업)을 수행할 수 있게 된다는 것이다. 더 적은 스레드로 더 많은 작업을 처리할 수 있다.

**JDBC 방식 (동기, 블로킹)**
{% highlight java %}
public class JdbcUserRepository {
    private final DataSource dataSource; // HikariDataSource

    public JdbcUserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<User> findActiveUsers() throws SQLException {
        String sql = "SELECT id, name FROM users WHERE active = ?";
        List<User> users = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setBoolean(1, true);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    Long id = rs.getLong("id");
                    String name = rs.getString("name");
                    users.add(new User(id, name));
                }
            }
        } // try-with-resources 가 Connection 반환(풀에 돌려줌)
        return users;
    }
}
{% endhighlight %}

> `getConnection()` 호출 -> 스레드는 DB I/O 가 끝날 때까지 블로킹  
> 동시 요청이 많아지면 스레드 부족 문제가 발생

**R2DBC - 저수준 예시 (논블로킹)**
{% highlight java %}
public class LowLevelR2dbcUserRepository {
    private final ConnectionFactory connectionFactory;

    public LowLevelR2dbcUserRepository(ConnectionFactory cf) {
        this.connectionFactory = cf;
    }

    public Flux<User> findActiveUsers() {
        String sql = "SELECT id, name FROM users WHERE active = ?1";
        return Mono.from(connectionFactory.create())
            .flatMapMany(conn ->
                Flux.from(conn.createStatement(sql)
                              .bind(0, true)
                              .execute())
                    .flatMap(result -> result.map((row, meta) -> mapRow(row)))
                    .doFinally(sig -> closeQuietly(conn))
            );
    }

    private User mapRow(Row row) {
        Long id = row.get("id", Long.class);
        String name = row.get("name", String.class);
        return new User(id, name);
    }

    private void closeQuietly(Connection conn) {
        conn.close().subscribe(); // 논블로킹으로 닫음 (에러/완료 처리 생략)
    }
}
{% endhighlight %}

`R2DBC SPI` 라는 표준 인터페이스(`io.r2dbc.spi.*`) 가 있어서, 이 인터페이스를 가지고 `Spring R2DBC` 를 보기 전에 핵심인 `Reactor core` 를 의존성과 DB 연결을 위해 `R2DBC SPI` 라는 `R2DBC` 표준 인터페이스를 통해 DB 에 접속하면서 `Repository-Controller` 에 이르기까지 전부 비동기로 가져가보자.

##### 순수 R2DBC 의존성 추가

{% highlight gradle %}
implementation 'io.r2dbc:r2dbc-spi'             // MySQL 용 드라이버
implementation 'io.projectreactor:reactor-core' // Flux, Mono
runtimeOnly 'io.asyncer:r2dbc-mysql'            // R2DBC 표준 인터페이스
{% endhighlight %}

##### ConnectionFactory 설정

R2DBC 에서 DB 연결을 만들어주는 팩토리 객체이다. 이전에는 `DataSource` 구현체(HikariCP)로부터 `Connection` 을 얻었음을 상기하여, 이 **ConnectionFactory** 또한 `DataSource` 역할을 하고 있다고 보면 되겠다.

`DataSource` 즉, `ConnectionFactory` 를 가져오기 전에 할 것은 바로 세팅이다. 다음과 같이 세팅할 수 있다.

{% highlight java %}
public class R2dbcMysqlConfig {
	private final ConnectionFactoryOptions config;

	public R2dbcMysqlConfig(String user, String password) {
		config = ConnectionFactoryOptions
				.builder().option(ConnectionFactoryOptions.DRIVER, "mysql")
				.option(ConnectionFactoryOptions.HOST, "localhost")
				.option(ConnectionFactoryOptions.PORT, 3306)
				.option(ConnectionFactoryOptions.USER, user)
				.option(ConnectionFactoryOptions.PASSWORD, password)
				.option(ConnectionFactoryOptions.DATABASE, "librarydb")
				.build();
	}

	public ConnectionFactoryOptions getConfig() {
		return config;
	}
}
{% endhighlight %}

이제 위를 사용하여 `ConnectionFactory` 세팅을 해주자.

![assets/img/connection-factories-get.png]({{ site.baseurl }}/assets/img/connection-factories-get.png)

위와 같이 두 개가 있는 것을 볼 수 있는데 필자는 아래 것을 선택했다.

> 첫 번째는 다음과 같이 선언하면 된다.  
> `r2dbc:driver[:protocol]}://[user:password@]host[:port][/path][?option=value]`

##### ConnectionFactory 인터페이스

아래는 `ConnectionFactory` 의 인터페이스이다.

{% highlight java %}
public interface ConnectionFactory {
    Publisher<? extends Connection> create();
    ConnectionFactoryMetadata getMetadata();
}
{% endhighlight %}

실제로 `create()` 는 `Publisher` 형태로 반환함을 볼 수 있다. `Publisher` 는 `Mono` 나 `Flux` 의 구현을 따라가다 보면 최상위 부모에 `Publisher` 가 있음을 볼 수 있다.

{% highlight java %}
public interface Publisher<T> {
    public void subscribe(Subscriber<? super T> s);
}
{% endhighlight %}

즉, `create()` 메서드는 즉시 `Connection` 을 반환하지 않고, 비동기 데이터 흐름 기능을 주는 `Publisher` 형태로 비동기로 커넥션을 주는 것을 볼 수 있다. 따라서 실제 커넥션은 `subscribe()` 가 일어날 때 만들어지게 된다.

다음과 같이 `ConnectionFactory` 의 `create()` 를 사용해 `Mono<Connection>` 을 받도록 하자:

{% highlight java %}
public class R2dbcConnectionFactory {
	private R2dbcConnectionFactory() { }

	public static Mono<Connection> getConnection() {
		return Mono.from(Holder.instance.create());
	}

	private static class Holder {
		private final static R2dbcMysqlConfig CONFIG = new R2dbcMysqlConfig("likelion", "1234");
		private static final ConnectionFactory instance = ConnectionFactories.get(CONFIG.getConfig());
	}
}
{% endhighlight %}

필자는 그냥 `Singleton` 패턴을 사용하였지만, 다른 더 나은 코드가 있다면 그것을 쓰길 바란다.

##### Connection

이제 `UserRepository` 에 `create` 를 간단히 구현해보자.

{% highlight java %}
public Mono<User> createUser(User user) {
    return getConnection().flatMap();
}
{% endhighlight %}

`getConnection()` 으로 간단히 `Connection` 을 들고 올 수 있다. 이때 커넥션을 하나 생성했다는 것은 우리가 스레드 자원 하나를 얻은 것과 같다. 따라서 작업이 끝나면 이를 닫아줘야 하는데, `Mono`, `Flux` 에는 method chaining 을 하면서 내부 T 라는 타입에 접근하여 `close()` 를 `map` 으로 할 수 있긴 한데,

그거 보단 다음 더 안전한 `usingWhen` 혹은 `using`, `when` 등등 다양한 메서드를 이용할 수 있다.

**usingWhen**

Reactive Streams 환경에서 리소스를 안전하게 열고, 사용하고, 닫는 것을 보장하는 메서드이다. `Mono.usingWhen()` 은 리소스를 비동기적으로 관리하는 `try-with-resources` 의 Reactive 버전이다. 리소스를 `Publisher`(`Mono<Connection>`) 로부터 사용한 뒤, 성공/실패/취소 야부에 상관없이 자동으로 정리하게 된다.

{% highlight java %}
public static <T, D> Mono<T> usingWhen(Publisher<D> resourceSupplier,
        Function<? super D, ? extends Mono<? extends T>> resourceClosure,
        Function<? super D, ? extends Publisher<?>> asyncComplete,
        BiFunction<? super D, ? super Throwable, ? extends Publisher<?>> asyncError,
        //the operator itself accepts null for asyncCancel, but we won't in the public API
        Function<? super D, ? extends Publisher<?>> asyncCancel) {
    return onAssembly(new MonoUsingWhen<>(resourceSupplier, resourceClosure,
            asyncComplete, asyncError, asyncCancel));
}
{% endhighlight %}

이를 간단하게 말하면 다음과 같다.

{% highlight java %}
Mono.usingWhen(
    getConnection(),
    conn -> doQuery(conn),
    conn -> conn.close(),                // 정상 종료 시
    (conn, err) -> conn.close(),         // 에러 발생 시
    conn -> conn.close()                 // 취소 시
);
{% endhighlight %}

하지만 위와 같이 인자들을 통해 세부적으로 동작을 제어할 수 있지만, 이는 너무 해야할게 많다. 다음을 보자.

**usingWhen**

{% highlight java %}
public static <T, D> Mono<T> usingWhen(
        Publisher<D> resourceSupplier,
        Function<? super D, ? extends Mono<? extends T>> resourceClosure,
        Function<? super D, ? extends Publisher<?>> asyncCleanup
) {
    return usingWhen(
        resourceSupplier,
        resourceClosure,
        asyncCleanup,
        (res, error) -> asyncCleanup.apply(res),
        asyncCleanup
    );
}
{% endhighlight %}

뭐든 간에 **정상, 에러, 취소**에서 `asyncCleanup` 을 할 수 있는 버전이며, 3가지 인자만 넘겨주면 된다. 이때 `resourceClosure`는 `Closable` 을 구현하면 좋을 것이다.

이제 다음과 같이 쓸 수 있다.

{% highlight java %}
public class UserRepository {
	public Mono<User> createUser(User user) {
		return Mono.usingWhen(
				getConnection(),
				conn -> Mono.from(
						            conn.createStatement("INSERT INTO USERS(name, active) VALUES (?, ?)")
						                .bind(0, user.getName())
						                .bind(1, true)
						                .returnGeneratedValues("id")
						                .execute()),
				Connection::close);
	}
}
{% endhighlight %}

이때 `Connection` 에서 create 하는 `Statement` 는 JDBC 의 `Statement` 와는 다른 아이다(`io.r2dbc.spi`).

##### Statement

- `add()`: 현재 바인딩 상태를 저장하고, 새 바인딩을 시작
- `bind(int index, Object value)`: 인덱스로 파라미터 바인딩(`?`), 0 부터 시작하며, `value` 는 `null` 이 되면 안됨
- `bind(String name, Object value)`: 이름 기반 파라미터 바인딩이며, `:name` 과 같은 `JPQL` 과 유사하게 사용 가능
- `bindNull(int index, Class<?> type)`: 인덱스 기반으로 `null` 값 바인딩. `type` 으로 타입 명시
- `bindNull(String name, Class<?> type)`: 동일
- `execute()`: 실제 SQL 실행 후, `Publisher<Result>` 를 반환한다, reactive 방식이다.
- `returnGeneratedValues(String... columns)`: `INSERT` 시에 생성된 키(`AUTO_INCREMENT`) 를 결과에 포함하도록 설정한다. 기본적으로는 `no-op` 이지만, 아무런 인자 없이(columns 없이) 명시적으로 이 체이닝만 넣어도 자동 동작하여 키를 들고 온다.
- `fetchSize(int rows)`: 한 번에 가져올 row 수를 설정한다.

이를 통해 다음처럼 입력 가능하다.

{% highlight java %}
public Mono<User> create(User user) {
    return Mono.usingWhen(
            getConnection(), conn ->
                    Flux.from(conn.createStatement("INSERT INTO USERS(NAME, ACTIVE) VALUES (?, ?)")
                                    .bind(0, user.getName())
                                    .bind(1, user.isActive())
                                    .returnGeneratedValues("id")
                                    .execute())
                        .flatMap(result -> {
                            return result.map(row -> {
                                user.setId(row.get("id", Long.class));
                                return user;
                            });
                        })
                        .next(),
            Connection::close
    );
}
{% endhighlight %}

마지막 반환값이 `Mono<Publisher<? extends Result>>` 이며 이를 평탄화 하기 위해 `flatMap` 을 통해 할 수 있다(`Publisher` 평탄화). 그 이후는 `Mono<User>` 로 반환이 되게 된다.

##### Row

DB 의 한 행을 표현하는 인터페이스이며, 내부적으로 `row.get("name")` 또는 `row.get(0)` 으로 가져올 수 있다.

{% highlight java %}
public interface Row extends Readable {
    RowMetadata getMetadata();
}
{% endhighlight %}

사실은 이런 get 은 `Readable` 에 정의되어 있다. 또한, `get(String name, Class<?> type)` 으로도 가져올 수 있다. 특징으로는 한 번 `map()` 안에서 소비되면 다시 접근이 불가하다.

이제 row 를 통해 위와 같이 반환해주면 끝나고, `Main` 에서 실제 호출을 해보자.

{% highlight java %}
public class Main {
	public static void main(String[] args) throws InterruptedException {
		UserRepository userRepository = new UserRepository();
		userRepository.createUser(new User("test", true))
		              .subscribe(System.out::println);
		Thread.sleep(1000);
	}
}
{% endhighlight %}

반드시 `subscribe` 를 하여야지 실행이 되게 되고, `Thread.sleep(1000)` 을 넣는 이유는 **유사** `graceful shutdown` 을 사용하도록 해야한다. 안그러면 처리되는 와중에 종료가 되어 값이 반영이 안되게 된다. `createUser` 만 하면 비동기이기 때문에 실행이 안된다.

![assets/img/r2dbc-users-table.png]({{ site.baseurl }}/assets/img/r2dbc-users-table.png)

##### CRUD 실습

{% highlight java %}
public class UserRepository {
	public Mono<User> create(User user) {
		return Mono.usingWhen(
				getConnection(), conn ->
						Flux.from(conn.createStatement("INSERT INTO USERS(NAME, ACTIVE) VALUES (?, ?)")
						              .bind(0, user.getName())
						              .bind(1, user.isActive())
						              .returnGeneratedValues("id")
						              .execute())
						    .flatMap(result -> {
							    return result.map(row -> {
								    user.setId(row.get("id", Long.class));
								    return user;
							    });
						    })
						    .next(),
				Connection::close
		);
	}

	public Mono<User> get(long id) {
		return Mono.usingWhen(
				getConnection(),
				conn ->
						Flux.from(conn.createStatement("SELECT * FROM USERS WHERE id = ?")
						              .bind(0, id)
						              .execute()
						    ).flatMap(result -> {
							    return result.map(row -> {
								    User user = new User(row.get("name", String.class),
								                         row.get("active", Boolean.class));
								    user.setId(id);
								    return user;
							    });
						    })
						    .next(),
				Connection::close
		);
	}

	public Mono<User> update(long id,
	                         User user) {
		return Mono.usingWhen(
				getConnection(),
				conn ->
						Flux.from(conn.createStatement("UPDATE USERS SET name = ?, active = ? WHERE id = ?")
						              .bind(0, user.getName())
						              .bind(1, user.isActive())
						              .bind(2, id)
						              .execute()
						    )
						    .flatMap(Result::getRowsUpdated)
						    .flatMap(rowsUpdated -> {
							    if (rowsUpdated <= 0) return Mono.empty();
							    user.setId(id);
							    return Mono.just(user);
						    }).next(),
				Connection::close);
	}

	public Mono<Void> delete(long id) {
		return Mono.usingWhen(
				           getConnection(),
				           conn -> Mono.from(conn
						                             .createStatement("DELETE FROM USERS WHERE ID = ?")
						                             .bind(0, id)
						                             .execute()),
				           Connection::close)
		           .then();
	}
}
{% endhighlight %}

이를 사용할 때는 다음과 같이 사용해야 한다.

{% highlight java %}
public class Main {
	public static void main(String[] args) throws InterruptedException {
		UserRepository userRepository = new UserRepository();

		User newUser = userRepository.create(new User("test", true))
		              .block();

		System.out.println("new user: " + newUser);

		userRepository.get(4L)
		              .subscribe(user -> System.out.println("get user: " + user));
		Thread.sleep(1000);

		User updatedUser = userRepository.update(4L, new User("test2", false))
		                                 .block();
		System.out.println("updated user: " + updatedUser);

		userRepository.delete(4L).subscribe();
		Thread.sleep(1000);
	}
}
{% endhighlight %}

이때 저장되는게 `4L` 일 때 바로 조회하면 뜨지 않는다(비동기 처리이기 때문에 바로 조회를 하면 안뜸). 따라서 `Thread.sleep` 을 사용하여 가져올 때까지 기다려줘야 한다.

