---
layout: post
title:  "[멋사 백엔드 19기] TIL 34일차 Spring Boot 프로젝트 구조"
date:   2025-10-13 17:27:38 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차
- [Spring Boot](#spring-boot)
    - [Spring Initializer 의 war 옵션](#spring-initializer-의-war-옵션)
    - [프로젝트 구조](#프로젝트-구조)
        - [Gradle](#gradle)
        - [Gradle Wrapper](#gradle-wrapper)
    - [Sementic Versioning](#sementic-versioning)
    - [Spring](#spring)
        - [Spring Boot Starter](#spring-boot-starter)
        - [Spring 진입점](#spring-진입점)

---

## 📚 본문

### Spring Boot

**Spring Boot 핵심 가치**
- **Convention over Configuration**: 개발자가 미리 알고 있다고 가정하고 기본 설정을 제공
- **Auto Configuration**: classpath 기반으로 애플리케이션을 자동 구성
- **독립 실행 가능**: 내장 서버로 별도의 WAS 없이도 서비스 실행 가능
- **Actuator**: 모니터링 기능을 통한 운영 편이 제공

#### Spring Initializer 의 war 옵션

war 옵션은 어떻게 배포할지 결정하는 빌드 방식이며, 외부 WAS 쪽에 배포하고 싶을 때 사용하게 된다(외장 `Tomcat`, `WebLogic`, `JEUS` 등등).

jar 은 내장 WAS 로 바로 실행될 수 있도록 한다. 즉, `java -jar build/libs/myapp.jar` 으로 실행을 바로 할 수 있는 형태로 제공해준다는 말이다.

#### 프로젝트 구조

우선 생성된 Spring Initializer 에 대해 프로젝트 구조를 다시 정리하고 가자.

##### Gradle

- `build.gradle`: Gradle 빌드 도구 설정 파일
    - `plugins`: Gradle 에 어떤 기능을 쓸지 선언하는 영역
    - `repositories`: 외부 라이브러리를 어디서 다운로드할지 결정
    - `dependencies`: 프로젝트에서 사용할 외부 라이브러리 목록 정의
    - `build`: 자바 버전 설정, 프로젝트 명 등등

- `settings.gradle`: 프로젝트 이름 및 포함 프로젝트 설정
- `gradlew`: Unix / MacOS 용 Gradle 실행 스크립트 파일
- `gradlew.bat`: Window 용 Gradle 실행 스크립트 파일
- `gradle`
    - `gradle-wrapper.jar`: Gradle 실행용 JAR
    - `gradle-wrapper.properties`: Gradle 버전 및 배포 설정

`build.gradle` 을 보통 많이 수정하게 될텐데 많이 봐두자. 또한 다음과 같은 key-value 를 볼 수 있다.

{% highlight java %}
group = 'com.example'
version = '0.0.1-SNAPSHOT'
description = 'Demo'
{% endhighlight %}

| 항목        | 의미                                     | 실행과의 관계                              |
|------------|----------------------------------------|------------------------------------------|
| group      | 패키지 네임스페이스(보통 도메인 형태, 예: com.example.demo) | 빌드 시 그룹 ID로만 사용됨 (실행과 무관) |
| version    | 애플리케이션 버전 정보 (ex: 0.0.1-SNAPSHOT) | 빌드 결과물(.jar 이름 등)에 반영됨        |
| description| 프로젝트 설명                             | 문서나 메타데이터 용도로만 사용됨        |

**java plugin**

`build.gradle` 의 `plugins` 블럭에 `java` 가 들어가고 있음을 볼 수 있다. 다음 명령어를 제공하게 된다.

- `./gradlew compileJava`: 자바 소스코드 컴파일
- `./gradlew test`: 테스트 실행

{% highlight java %}
// build.gradle
tasks.named('test') { <- test 명령 실행 전 어떤 구성 설정을 할 것인지
    useJUnitPlatform()
}
{% endhighlight %}

- `./gradlew jar`: JAR 파일 생성
- `./gradlew build`: 전체 빌드 프로세스 실행

**org.springframework.boot plugin**
- `./gradlew bootRun`: 애플리케이션을 즉시 실행(개발 모드)
- `./gradlew bootJar`: 실행 가능한 Fat JAR 생성(모든 의존성 포함)
    - 생성된 jar 파일은 `build/libs/` 폴더에 저장됨
    - 이름은 `{프로젝트명}-{버전}.jar` 으로 생성되며 프로젝트 명은 `settings.gradle` 에서 `rootProject.name = ` 으로 설정할 수 있다.
- `./gradlew bootWar`: WAR 파일 생성 (외부 서블릿 컨테이너 배포용)
- `./gradlew bootBuildImage`: **Cloud Native Buildpacks** 를 이용한 Docker 이미지 생성

**io.spring.dependency-management plugin**

`Spring Boot` 와 호환되는 의존성 버전을 자동으로 관리해주는 플러그인이다. `gradle` 은 원래 의존성 버전 충돌을 자동으로 조정하지 않는다. 보통 각 라이브러리의 버전을 명시하고 서로 특정 버전에서 충돌이 일어날 것을 고쳐주지 않는다.

이때 `io.spring.dependency-management` 는 버전을 직접 쓰지 않아도 되는 환경을 만들어서 `Spring Boot` 가 관리하는 **[BOM](#bom)** 파일을 자동으로 가져와서 의존성들의 버전 호환성을 보장해준다.

**그 외 자주 쓰이는 명령어**

{% highlight bash %}
# 전체 빌드 (컴파일 + 테스트 + JAR 생성)
./gradlew build

# 테스트 실행
./gradlew test

# 빌드 결과물 삭제 (clean build 시 유용)
./gradlew clean

# clean + build 한 번에 실행
./gradlew clean build

# 프로젝트 정보 확인
./gradlew projects

# 사용 가능한 모든 Task 확인
./gradlew tasks

# 테스트 스킵하고 빌드
./gradlew build -x test

# 병렬 빌드 (멀티 모듈 프로젝트)
./gradlew build --parallel

# 빌드 캐시 사용
./gradlew build --build-cache

# 의존성 새로 다운로드 (캐시 무시)
./gradlew build --refresh-dependencies

# 디버그 모드로 실행
./gradlew bootRun --debug-jvm

# 특정 설정(configuration)의 의존성만 확인
./gradlew dependencies --configuration compileClasspath
./gradlew dependencies --configuration runtimeClasspath

# 의존성 충돌 확인
./gradlew dependencyInsight --dependency spring-core

# 사용되지 않는 의존성 확인 (플러그인 필요)
./gradlew buildHealth
{% endhighlight %}

##### Gradle Wrapper

`gradle` 폴더에 `gradle wrapper` 라는 이름의 파일을 봤을 것이다. 용도는 다음과 같다:

- 프로젝트마다 지정된 Gradle 버전 사용 보장
- Gradle 설치 불필요 (자동 다운로드)
- 팀원 간 일관된 빌드 환경 제공
- CI/CD 환경에서도 동일한 버전 사용

#### Sementic Versioning

`Major.Minor.Patch` 형식 사용
- `Major`: 호환되지 않는 **API** 변경 (예: 1.0.0 → 2.0.0)
- `Minor`: 하위 호환되는 **기능** 추가 (예: 1.0.0 → 1.1.0)
- `Patch`: 하위 호환되는 **버그** 수정 (예: 1.0.0 → 1.0.1)
- `SNAPSHOT`: 개발 중인 불안정 버전 (예: 0.0.1-SNAPSHOT)

> 예시:  
- `0.0.1-SNAPSHOT`: 초기 개발 버전  
- `1.0.0`: 첫 정식 릴리스  
- `1.1.0`: 새 기능 추가  
- `1.1.1`: 버그 수정

#### Spring

`Spring 3.x` 에서 많이 바뀐 것은 다음과 같다.

- `Java 17` 이상 필수: Java 8/11 지원 중단
- `Jakarta EE` 사용: `javax.*` → `jakarta.*` 패키지 변경
- `Spring Framework 6.x` 기반: 네이티브 이미지 지원 강화
- **[GraalVM Native Image](#graalvm-native-image)** 공식 지원: 빠른 시작 시간과 적은 메모리 사용

#### Spring Boot Starter

특정 기능을 사용하기 위해 필요한 의존성을 묶어놓은 패키지이다. 어떤 기능을 구현하기 위해 다른 패키지가 필요할 수 있고 또 다른 패키지가 또 필요할 수 있다. 이를 `Spring Boot Starter` 라는 팩으로 필요한 기능들에 대한 패키지들을 묶어서 `dependency` 를 추가만 하면 다수의 관련된 기능 패키지들을 다 가져와서 자동으로 추가해준다.

| Starter | 용도 | 포함 라이브러리 |
|----------|------|----------------|
| spring-boot-starter | 핵심 기능 | 로깅, 자동 구성 등 |
| spring-boot-starter-web | 웹 애플리케이션 | Spring MVC, Tomcat, Jackson |
| spring-boot-starter-data-jpa | JPA 사용 | Hibernate, Spring Data JPA |
| spring-boot-starter-data-jdbc | JDBC 사용 | Spring Data JDBC, HikariCP |
| spring-boot-starter-security | 보안 | Spring Security |
| spring-boot-starter-test | 테스트 | JUnit 5, Mockito, AssertJ |
| spring-boot-starter-validation | 유효성 검증 | Hibernate Validator |
| spring-boot-starter-actuator | 모니터링 | 헬스체크, 메트릭 등 |
| spring-boot-starter-thymeleaf | 템플릿 엔진 | Thymeleaf |
| spring-boot-starter-cache | 캐싱 | Spring Cache 추상화 |

> `./gradlew dependencies` 명령어를 통해 어떤 의존성들이 추가됐는지 확인할 수 있다.

**장점**
- 필요한 의존성을 개별적으로 찾아 추가할 필요 없음
- 버전 호환성이 보장된 의존성 조합 제공
- 자동 구성(**Auto-configuration**) 포함
- 설정 최소화 (**Convention over Configuration**)

#### Spring 진입점

- `application.properties`: 애플리케이션 설정 파일 (yml로 변경 가능)
- `DemoApplication.java`: Spring Boot 실행 클래스

Spring Boot 프로젝트의 **entry point** 는 `@SpringBootApplication` 이 붙은 클래스이며, 내부의 `main()` 메서드에서 `SpringApplication.run()` 을 호출하는 부분이 실행 시작점이 된다. 헷갈릴 수 있는 것은 `build.gradle` 의 `group`, `version`, `description` 설정은 빌드 메타정보일 뿐, 진입점 결정에는 영향을 주지 않는다.

#### Spring Bean



---

## ✒️ 용어

###### Cloud Native Buildpacks

소스 코드로부터 컨테이너 이미지를 자동으로 빌드해주는 표준화된 도구 체계이다. 즉 `Dockerfile` 작성 없이도 어플리케이션 언어와 구조를 자동 인식해서 필요한 런타임, 의존성, 설정을 자동으로 포함시켜서 이미지를 만들어준다.

###### BOM

`Bill of Materials` 의 약자이며, 여러 라이브러리의 호환 가능한 버전 세트를 모아둔 일종의 버전 관리표 이다. 스프링 부트는 내부적으로 `spring-boot-dependencies` 라는 BOM 을 사용한다.

###### GraalVM Native Image

`GraalVM Native Image` 은 JVM 기반 어플리케이션을 미리 기계어로 컴파일해서 실행 속도와 메모리 효율을 극대화 시키는 기술 즉, `JAR` 로 실행하는 대신에 미리 운영체제용 실행 파일 형태로 변환해주는 `Ahead-of-Time` 컴파일 기술이다.

만약 `java -jar myapp.jar` 로 JVM 위에서 실행할 수 있겠지만, 이 대신에 

{% highlight java %}
./gradlew bootBuildImage \
    --imageName=myapp:native \
    --builder paketobuildpacks/builder:tiny \
    --env BP_NATIVE_IMAGE=true
{% endhighlight %}

와 같이 빌드를 한다면, Spring 이 `Spring AOT Engine` 을 통해
`Spring Boot` 앱을 `Native Image` 로 변환할 때 필요한 설정(리플렉션, 프록시 등)을 자동으로 생성해주고, `GraalVM` 으로 컴파일된 네이티브 Docker 이미지를 자동 생성된 것틀 실행할 수 있게 된다. (내부적으로 `Paketo Buildpacks` + `GraalVM` 사용

{% highlight java %}
// 네이티브 이미지 빌드
./gradlew bootBuildImage --imageName=myapp:native --env BP_NATIVE_IMAGE=true

// 또는 `GraalVM CLI` 직접 사용 시
native-image -jar build/libs/myapp.jar myapp
// 실행가능
./myapp
{% endhighlight %}

두 번째 방식은 `GraalVM CLI` 가 다운받아져 있어야 한다.