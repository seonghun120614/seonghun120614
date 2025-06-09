---
layout: post
title:  보조. Lombok
date:   2025-06-09 16:47:48 +0900
categories: Java
---

<!--more-->

## 🪛 한계점

Java 의 구조가 유사한 Constructor, Getter, Setter, toString, equalsTo 등등의 보일러플레이트 코드가 매우 빈번히 발생한다. 이를 위해 Lombok 에서 애너테이션을 추가하는 것만으로 클래스 자체에 보일러플레이트 코드들을 획기적으로 줄일 수 있다.

## 📂 목차
- [@RequiredArgsConsturctor](#requiredargsconstructor)
- [@Builder](#builder)
- [@Data](#data)

---

## 📚 본문

Lombok 은 Java 에서 반복적으로 작성해야 하는 보일러플레이트 코드를 줄이기 위한 라이브러리이다.  
읽기전에 밑의 기본적인 애너테이션은 숙지하고 간다.

| 애너테이션            | 기능 설명                                              |
|---------------------|-----------------------------------------------------|
| `@Getter`, `@Setter` | 각 필드에 대해 `getter`, `setter` 자동 생성                |
| `@ToString`          | 객체의 `toString()` 메서드 자동 생성                      |
| `@EqualsAndHashCode` | `equals()`와 `hashCode()` 메서드 자동 생성                 |
| `@NoArgsConstructor` | 파라미터가 없는 기본 생성자 자동 생성                     |
| `@AllArgsConstructor`| 모든 필드를 포함하는 생성자 자동 생성                     |

### @RequiredArgsConstructor

생성자가 전부 필요한 것, 전부 필요없는 것 뿐 아니라 필요한 필드만 생성자로 추가하도록 할 수도 있다.  
final, @NonNull 이 붙으면 무조건 Lombok 은 RequiredArgsConstructor의 생성자의 인자로 등록해준다.

{% highlight java %}
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    @NonNull
    private String name
    private int age; // 이건 포함 안됨
}
{% endhighlight %}

@NotEmpty, @NotNull 은 다른 패키지의 validation 애너테이션이다. 주의하자.

### @Builder

빌더 패턴 메서드를 자동 생성한다.

{% highlight java %}
// User.class
import lombok.Builder;
import lombok.ToString;

@Builder
@ToString
public class User {
    private String name;
    private int age;
    private String email;
}

// Main.class
public class Main {
    public static void main(String[] args) {
        User user = User.builder()
                        .name("홍길동")
                        .age(25)
                        .email("hong@example.com")
                        .build();
        System.out.println(user);
    }
}
{% endhighlight %}

### @Data

@Data = @Getter + @Setter + @ToString + @EqualsAndHashCode + @RequiredArgsConstructor  
다른 설명은 하지 않겠다.

---

## 📁 관련 글
- [3. Spring Boot Custom Property][spring-boot-custom-property]

[spring-boot-custom-property]: {{ site.baseurl }}/java/spring/2025/06/09/3.-spring-boot-custom-property.html