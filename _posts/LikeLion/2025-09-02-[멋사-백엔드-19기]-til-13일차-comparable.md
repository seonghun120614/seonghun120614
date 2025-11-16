---
layout: post
title:  "[멋사 백엔드 19기] TIL 13일차 Comparable"
date:   2025-09-02 16:09:28 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java
---

<!--more-->

## 📂 목차
- [Comparator, Comparable](#comparator-comparable)
- [Exception](#exception)
- [Dependency Injection 고찰](#dependency-injection-고찰)
    - [Port-Adapter 에서의 Service Layer 문제점?](#port-adapter-에서의-service-layer-문제점)

---

## 📚 본문

### Comparator, Comparable

- `Comparator`: 클래스로써 sort 를 할 때 어떤 형태로 정렬을 할지 넣어줄 수 있는 클래스이다.
- `Comparable`: 인터페이스로써 해당 클래스가 비교 가능하다는 것을 의미하고, `compareTo` 를 구현하여 달성할 수 있다.

> `Comparable` 과 `Comparator` 둘 다 구현되어 있을때는 `sort(, Comparator)` 를 먼저 따른다.

### Exception 체이닝

{% highlight java %}
public class MyException extends RuntimeException {
    public MyException(String msg) {
        super(msg);
    }

    public MyException(Exception ex) {
        super(ex);
    }
}
{% endhighlight %}

위 예제에서 밑의 생성자를 보자. 위처럼 exception 을 다시 exception 으로 감싸서 던지는 것을 볼 수 있다. 위를 밑의 예시와 같이 설명하면:

{% highlight java %}
try {
    throw new IOException("파일을 읽을 수 없음");
} catch (IOException e) {
    throw new MyException(e); // 원인 예외 e 를 감싸서 다시 던짐
}
{% endhighlight %}

예외는 IOException 이 났지만, 이를 MyException 으로 감싸서 IOException 은 원인(cause) 로 들어가게 할 수 있다. 이때 사용자에게 보여주는 e.printStackTrace() 는 MyException 이 최상위로 뜨는 예외, 그 하위로 IOException 도 같이 출력되게 된다.

{% highlight txt %}
MyException
    at ...
Caused by: java.io.IOException: 파일 못 읽음
    at ...
{% endhighlight %}

보통 생성자에 다음 생성자도 있다.

{% highlight java %}
XXXXXXException(String message, Throwable cause)
{% endhighlight %}

이는 cause 는 그대로 cause 고, 해당 감싸지는, 즉 상위 exception 의 예외 메시지랑 함께 전달하고 싶을때 사용된다.

{% highlight java %}

public class CustomException extends RuntimeException {
    public CustomException(String msg) {
        ...
    }

    public CustomException(Throwable throw) {
        ...
    }

    public CustomException(String msg, Throwable throw) {
        ...
    }
}
{% endhighlight %}

> 그냥 셋 다 구현하는게 POJO 에서도 그렇고 보편적인거 같다.

### Dependency Injection 고찰

의존성 주입을 할 때 Spring 에서는 `ApplicationContext` 를 통해 의존성 주입을 하도록 하는데, 이번에 미니프로젝트를 할 때에도 어떤게 `static final` 이어야 하는지 `static` 이어야 하는지 `final` 이어야 하는지가 관건이었다.

우선 보통 `static final` 처럼 아예 하나만 존재하고 값이 변경 될 수 없도록 하는 것은 드물다. `TimeZone` 같은 것들을 보면 상수들을 다 이렇게 선언하는데, 보통은 `reference` 변수 보다는 `primitive` 한 애들한테 적용시키는게 낫다.

두 번째로 `static` 인데, 얘는 `final` 이 없기 때문에 이 값을 수정 할 수 있지만 오로지 하나만 존재하게 된다. 즉 Inject 의 대상으로 보기 보다는 **공유 자원**으로 보기에 걸맞다

마지막으로 `final` 로 선언한 아이인데, 얘는 의존성 주입하기에 의미가 들어맞는다. 클래스를 초기화 할 때 그때 주입을 해놓으면 그 이후는 어디에서도 이를 변경할 수 없고, 초기화 될 때만 해당 값을 갖게 된다. 그렇다면 `Application` 을 실행을 할 때에 우선 초기화를 다 시켜두고, 그 이후에 초기화 된 애들을 각각 조립하는 것처럼 인자로 넣어주기만 한다면, `static` 과 `final`의 콜라보로 DI 를 달성할 수 있다.


**Context 초기화 및 필요 reference 들 인스턴스화 및 주입**
{% highlight java %}
public class ApplicationContextImpl implements ApplicationContext {
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;
    private final SessionContext sessionContext;

    private final MemberService memberService;
    private final LibraryService libraryService;

    public ApplicationContextImpl() {
        // Repository 싱글톤 사용
        bookRepository = BookRepositoryImpl.getInstance();
        memberRepository = MemberRepositoryImpl.getInstance();
        sessionContext = SessionContextImpl.getInstance();

        // Service 에 주입
        memberService = MemberServiceImpl.getInstance(memberRepository, sessionContext);
        libraryService = LibraryServiceImpl.getInstance(bookRepository, sessionContext);
    }
{% endhighlight %}

**어플리케이션에서 필요한 값들을 가져와 주입**
{% highlight java %}
public class LibraryApplication {
    private final Map<String, Supplier<String>> commandMap;
    private final OutputManager outputManager;
    private final SessionContext sessionContext;
    private final LibraryService libraryService;
    private final MemberService memberService;

    public LibraryApplication(ApplicationContext applicationContext) {
        commandMap = new HashMap<>();
        outputManager = new OutputManager();

        // =================== DI ===================
        sessionContext = applicationContext.getSessionContext();
        libraryService = applicationContext.getLibraryService();
        memberService = applicationContext.getMemberService();
    }
{% endhighlight %}

여기서 얻어갈 수 있는 것은 만약 static final 로 멤버변수에 그대로 넣고 생성자에서 초기화를 안했다고 한다면, 이는 나중에 테스트 단에서 `Mock` 이나 `Stub` 등으로 갈아끼우기가 힘들게 된다. 위처럼 가져가고 나중에 생성자에 인자를 더 넣어 주입하는 식으로 하면 더 편할 것이다.

#### Port-Adapter 에서의 Service Layer 문제점?

구현하다보니 Port-Adapter 에서 쓰이는 Service 포트를 구현하다 보면 DI를 할 때 몇 가지 의문이 생긴다.

포트라는 것은 Adapter 로의 연결인데 안쓰는 `getInstance()` 라는 것으로 인터페이스에 메서드를 넣게 되면  
안되는데, 그렇게 되면 어플리케이션 초기화 시점에서 구현체를 통해 `getInstance()` 를 넣을 수 밖에 없는건가 싶었다.

만약 그렇게 `getInstance()` 를 넣게 된다면(위처럼 코딩이 된다면) 내가 `Service` 만 갈아끼우고 싶을때  
어떻게 해야 하는건가 라는 의문이 생겼다...

하지만 이런 의문은 괜한 의문이었는데, `Port-Adapter` 에서 `ApplicationContext` 라는 인터페이스를 두고 여기서 get(클래스)() 형식으로 `Application` 에게 인스턴스를 제공하는 포트를 주게 된다. 여기서 이미 설계도는 어플리케이션에게 줬고, 그 뒷단의 구현부는 `ApplicationContextImpl` 이 하기에 서비스가 바뀐다고 한들, 여기에서 생성자의 초기화 하는 곳만 바꿔주기만 하면 코드의 수정은 단어 하나만 바꾸고 추가하고 싶은 `ServiceImpl.java` 만 여기에 넣어주면 된다. 이래서 port-adapter 라고 하나보다.

> 지금으로써는 이 방법이 최우선인 듯하다. 스프링에서는 자동으로 이를 해준다는게 신기하다고 느낀 부분이다.