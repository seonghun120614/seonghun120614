---
layout: post
title:  "[멋사 백엔드 19기] TIL 39일차 Spring Data JDBC"
date:   2025-10-19 15:30:58 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Spring
---

<!--more-->

## 📂 목차
- [Spring JDBC](#spring-jdbc)
    - [JdbcTemplate](#jdbctemplate)
        - [단일 Query 연산](#단일-query-연산)
        - [다수 Query 연산](#다수-query-연산)
        - [수정 연산(insert, delete, update 등등)](#수정-연산insert-delete-update-등등)
        - [NamedParameterJdbcTemplate](#namedparameterjdbctemplate)
        - [DataAccessException 계층](#dataaccessexception-계층)
    - [SimpleJdbcInsert](#simplejdbcinsert)
- [Spring Data JDBC & R2DBC](#spring-data-jdbc--r2dbc)
    - [Repository 인터페이스](#repository-인터페이스)
        - [CrudRepository 인터페이스](#crudrepository-인터페이스)
        - [PagingAndSortingRepository 인터페이스](#pagingandsortingrepository-인터페이스)
        - [Slice](#slice)
    - [⭐️ New Entity Detection](#️-new-entity-detection)
    - [@NoRepositoryBean 를 정의하여 자주 사용하는 메서드들 정의](#norepositorybean-를-정의하여-자주-사용하는-메서드들-정의)
    - [저장소 활성화 구성 정의하기](#저장소-활성화-구성-정의하기)
    - [⭐️ Query Method](#️-query-method)
        - [Query Lookup Strategies](#query-lookup-strategies)
        - [Query Creation](#query-creation)
        - [Reserved Method Names](#reserved-method-names)
        - [Property Expressions](#property-expressions)
        - [Repository Methods Returning Collections or Iterables](#repository-methods-returning-collections-or-iterables)
        - [Streaming Query Results](#streaming-query-results)
        - [Asynchronous Query Results](#asynchronous-query-results)
        - [Paging, Iterating Large Results, Sorting & Limiting](#paging-iterating-large-results-sorting--limiting)

---

## 📚 본문

{% highlight java %}
Connection conn = null;
PreparedStatement pstmt = null;
ResultSet rs = null;

try {
    conn = dataSource.getConnection();
    pstmt = conn.prepareStatement("SELECT * FROM users WHERE id = ?");
    pstmt.setLong(1, userId);
    rs = pstmt.executeQuery();
    
    if (rs.next()) {
        return new User(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("email")
        );
    }
} catch (SQLException e) {
    throw new RuntimeException(e);
} finally {
    if (rs != null) try { rs.close(); } catch (SQLException e) {}
    if (pstmt != null) try { pstmt.close(); } catch (SQLException e) {}
    if (conn != null) try { conn.close(); } catch (SQLException e) {}
}
{% endhighlight %}

이전의 순수 JDBC 의 DB 에게 SQL 문을 던지는 과정이다. 이렇게 장황하고 보일러 플레이트 식 코드는 매우 유지보수가 까다롭고 힘들다. 이를 Spring 과 합치면 매우 간단한 코드가 된다.

**단점**
1. 반복되는 보일러 플레이트 코드
2. 복잡한 예외처리: Checked Exception 인 SQLException 을 매번 처리
3. 리소스 누수 위험: finally 블록에서 수동으로 close() 해야함
4. 가독성 저하: 다른 보일러플레이트 코드 때문에 실제 비즈니스 핵심 로직이 보이지가 않음

### Spring JDBC

스프링이 제공하는 JDBC 템플릿 기반 추상화 계층이며, 예외, 자원 해제, 트랜잭션(위 코드) 등을 자동으로 처리해준다. 개발자는 SQL 과 매핑 로직만 이해하면 된다.

#### JdbcTemplate

Template Method 패턴으로, "변하는 것과 변하지 않는 것을 분리하라" 를 따라서 다음으로 구분된다.

**변하지 않는 것(Template)**
- Connection 획득/반환
- Statement 생성/실행
- 예외 변환
- 리소스 정리

**변하는 것(Callback)**
- SQL 쿼리
- 파라미터 바인딩
- 결과 매핑 로직

{% highlight java %}
// JdbcTemplate의 내부 구조 (단순화)
public class JdbcTemplate {
    
    private DataSource dataSource;
    
    public <T> T query(String sql, RowMapper<T> rowMapper, Object... args) {
        Connection conn = null;
        PreparedStatement pstmt = null;
        ResultSet rs = null;
        
        try {
            // 1. 변하지 않는 부분: 리소스 획득
            conn = dataSource.getConnection();
            pstmt = conn.prepareStatement(sql);
            
            // 2. 변하지 않는 부분: 파라미터 바인딩
            for (int i = 0; i < args.length; i++) {
                pstmt.setObject(i + 1, args[i]);
            }
            
            // 3. 변하지 않는 부분: 쿼리 실행
            rs = pstmt.executeQuery();
            
            // 4. 변하는 부분: 결과 매핑 (Callback!)
            if (rs.next()) {
                return rowMapper.mapRow(rs, 1);
            }
            
        } catch (SQLException e) {
            // 5. 변하지 않는 부분: 예외 변환
            throw translateException(e);
        } finally {
            // 6. 변하지 않는 부분: 리소스 정리
            closeResultSet(rs);
            closeStatement(pstmt);
            closeConnection(conn);
        }
    }
}
{% endhighlight %}

##### 단일 Query 연산

JDBC 는 `queryForObject` 을 사용하여 딱 하나의 row 를 가져올 수 있다. 

**방법 1: RowMapper 직접 구현**
{% highlight java %}
public User findById(Long id) {
    String sql = "SELECT * FROM users WHERE id = ?";
    
    return jdbcTemplate.queryForObject(sql, 
        (rs, rowNum) -> new User(
            rs.getLong("id"),
            rs.getString("name"),
            rs.getString("email"),
            rs.getInt("age")
        ), 
        id
    );
}
{% endhighlight %}

`jdbcTemplate` 는 필드에 선언되고 의존성 주입을 받아 사용한다. 이때 `jdbcTemplate` 의 `queryForObject` 메서드를 통해 sql과 `RowMapper` 그리고 그 이후부터는 파라미터 바인딩을 위한 필요한 변수들을 나열해준다.

`RowMapper` 는 `BiFunction` 이고, 함수형 인터페이스가 들어가며, `ResultSet` 과 몇 번째 row 인지를 알려주게 된다. 이를 통해 P.S. 가 완성되고, 거기에 binding 하게 된다.

**방법 2: BeanPropertyRowMapper (자동 매핑)**

가장 간단하며, 가져올 클래스 명을 직접 넣어주기만 하면 된다.

{% highlight java %}
public User findByIdAuto(Long id) {
    String sql = "SELECT * FROM users WHERE id = ?";
    return jdbcTemplate.queryForObject(sql, 
        new BeanPropertyRowMapper<>(User.class), 
        id
    );
}
{% endhighlight %}

##### 다수 Query 연산

여러 개의 rows 를 들고오는 쿼리를 날릴 때는 `query`, `queryForList` 를 사용한다. 명칭을 제외한 나머지 문법이나 사용법은 위와 동일하니 그냥 넘어간다.

{% highlight java %}
public List<User> findByAgeGreaterThan(int age) {
    String sql = "SELECT * FROM users WHERE age > ?";
    return jdbcTemplate.query(sql, userRowMapper, age);
}

// queryForList 는 List 로 받을 수 있는 메서드이며 클래스 명을 명시해줘야 한다.
public List<String> findAllEmails() {
    String sql = "SELECT email FROM users";
    return jdbcTemplate.queryForList(sql, String.class);
}
{% endhighlight %}

##### 수정 연산(insert, delete, update 등등)

간단한 `INSERT-INTO-VALUES` 나 `DELETE-FROM-WHERE` 혹은 `UPDATE-SET-WHERE` 등의 단순한 것들은 생략하겠다.

**자동 생성된 키를 사용해야 할 때**

메서드 내의 인자 배열이 조금 달라지는데, 첫번재 인자로 `(connection) -> ...` 의 함수형 인터페이스가 들어가며 반환 값으로 `Statement` 를 내뱉는다. 이때 해당 반환값을 설정할 때, `connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)` 를 선언하여 ps 에서 가져올 수 있도록 한다(`executeUpdate()` 후에 `getGeneratedKeys()` 로 얻을 수 있음). 그 다음으로 미리 선언해놓은 KeyHolder(키 보유자) 를 선언하여 생성된 키를 보관할 수 있도록 바구니를 3번째 인자에 건내주면 된다.

{% highlight java %}
// 자동 생성된 키 반환
public long insertAndGetId(User user) {
    String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
    
    KeyHolder keyHolder = new GeneratedKeyHolder();
    
    jdbcTemplate.update(connection -> {
        PreparedStatement ps = connection.prepareStatement(sql, 
            Statement.RETURN_GENERATED_KEYS);
        ps.setString(1, user.getName());
        ps.setString(2, user.getEmail());
        ps.setInt(3, user.getAge());
        return ps;
    }, keyHolder);
    
    return keyHolder.getKey().longValue();
}
{% endhighlight %}

가져올 때는 위와 같이 가져오면 된다.

**배치 삽입**

`BatchPreparedStatementSetter` 라는 것을 사용하여 인터페이스를 통해 메서드를 정의시켜주면 된다. 이때 `setValues()` 는 i 번째에 해당하는 유저 값을 ps 에 넘겨주기만 하면 된다.

{% highlight java %}
// 배치 삽입 (대량 데이터)
public int[] batchInsert(List<User> users) {
    String sql = "INSERT INTO users (name, email, age) VALUES (?, ?, ?)";
    
    return jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
        @Override
        public void setValues(PreparedStatement ps, int i) throws SQLException {
            User user = users.get(i);
            ps.setString(1, user.getName());
            ps.setString(2, user.getEmail());
            ps.setInt(3, user.getAge());
        }
        
        @Override
        public int getBatchSize() {
            return users.size();
        }
    });
}
{% endhighlight %}

> `jdbcTemplate.batchUpdate(sql, users, 1000, Mapper)` 로 써도 된다.

##### NamedParameterJdbcTemplate

순서 기반 파라미터의 문제점:
- 파라미터 순서 실수 가능
- 가독성 저하
- 유지보수 어려움

이를 위해 이름 기반의 파라미터 바인딩을 하는 템플릿 등장

{% highlight java %}
@Repository
public class UserRepository {
    
    private final NamedParameterJdbcTemplate namedJdbcTemplate;
    
    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.namedJdbcTemplate = new NamedParameterJdbcTemplate(
            jdbcTemplate.getDataSource()
        );
    }
    
    // Map 사용
    public User findById(Long id) {
        String sql = "SELECT * FROM users WHERE id = :id";
        
        Map<String, Object> params = new HashMap<>();
        params.put("id", id);
        
        return namedJdbcTemplate.queryForObject(sql, params, userRowMapper);
    }
    
    // SqlParameterSource 사용 (더 타입 안전)
    public int insert(User user) {
        String sql = """
            INSERT INTO users (name, email, age) 
            VALUES (:name, :email, :age)
        """;
        
        SqlParameterSource params = new MapSqlParameterSource()
            .addValue("name", user.getName())
            .addValue("email", user.getEmail())
            .addValue("age", user.getAge());
        
        return namedJdbcTemplate.update(sql, params);
    }
    
    // BeanPropertySqlParameterSource (객체 자동 매핑)
    public int insertAuto(User user) {
        String sql = """
            INSERT INTO users (name, email, age) 
            VALUES (:name, :email, :age)
        """;
        
        SqlParameterSource params = new BeanPropertySqlParameterSource(user);
        return namedJdbcTemplate.update(sql, params);
    }
}
{% endhighlight %}

대충 보면 알겠지만, `:(parameter명)` 을 기준으로 parameter binding 이 일어나게 되고, `SqlParameterSource` 라는 인터페이스에 적당한 구현체를 선언하여 쿼리 혹은 수정 실행 메서드에 인자로 같이 넣고 있음을 볼 수 있다. 넣을 수 있는 것들은 다음과 같다.

- `Map<String, Object>`
- `MapSqlParameterSource`: method chaining 가능
- `BeanPropertySqlParameterSource`: 자동 매핑을 시켜줌

{% highlight java %}
// IN 절 처리 (여러 값)
public List<User> findByIds(List<Long> ids) {
    String sql = "SELECT * FROM users WHERE id IN (:ids)";
    
    Map<String, Object> params = Map.of("ids", ids);
    return namedJdbcTemplate.query(sql, params, userRowMapper);
}
{% endhighlight %}


##### DataAccessException 계층

{% highlight java %}
DataAccessException (unchecked)
├── DataIntegrityViolationException
│   ├── DuplicateKeyException
│   └── ConstraintViolationException
├── DataRetrievalFailureException
│   └── EmptyResultDataAccessException
├── DeadlockLoserDataAccessException
└── TransientDataAccessResourceException
{% endhighlight %}

`Unchecked` 인 이유는 `SQLException` 의 대부분은 복구가 불가능하며, 비즈니스 로직에서의 예외 처리 강제는 부적절하기 때문이다. 따라서 이를 null 이나 Optional 로 적절히 흘려보내어 처리하게 된다.

#### SimpleJdbcInsert

데이터베이스의 메타데이터를 활용하여 똑똑한 삽입이 가능하다.

{% highlight java %}
@Repository
public class UserRepository {
    
    private final SimpleJdbcInsert simpleJdbcInsert;
    
    public UserRepository(DataSource dataSource) {
        this.simpleJdbcInsert = new SimpleJdbcInsert(dataSource)
            .withTableName("users")
            .usingGeneratedKeyColumns("id");
    }
    
    public long insert(User user) {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("name", user.getName());
        parameters.put("email", user.getEmail());
        parameters.put("age", user.getAge());
        
        // INSERT 문을 자동 생성!
        Number newId = simpleJdbcInsert.executeAndReturnKey(parameters);
        return newId.longValue();
    }
    
    // BeanPropertySqlParameterSource 사용
    public long insertAuto(User user) {
        SqlParameterSource params = new BeanPropertySqlParameterSource(user);
        return simpleJdbcInsert.executeAndReturnKey(params).longValue();
    }
}
{% endhighlight %}

### Spring Data JDBC & R2DBC

Spring Data JDBC 는 어떠한 구현체도 없이 그저 함수명 만으로 함수 내부의 로직을 알아서 전부 짜주는 경지까지 이르지만, 복잡한 쿼리나 최적화가 필요한 쿼리만 일부 짜야 한다.

우선 그러려면 Spring Data JDBC 에서 제공해주는 `Repository` 라는 인터페이스를 먼저 알아야 한다.

[Spring Data JDBC 공식 문서](https://docs.spring.io/spring-data/relational/reference/)

#### Repository 인터페이스

Spring 데이터 저장소 추상화의 중심은 인터페이스이다. 매개변수화 타입으로 관리할 도메인 클래스 `T` 와 도메인 클래스의 식별자 유형(PK 유형) `ID` 를 인수로 받고, `Repository` 는 이 작업할 유형을 캡처하고 이 인터페이스를 확장하는 인터페이스를 찾는 데 도움이 되는 **마커 인터페이스 역할**을 하게 된다.

> Spring Data 에서는 **도메인 유형**, 즉 T 를 **엔티티** 로 간주하며, 데이터의 단위로 간주한다. 따라서 전체에서 **엔티티**라는 용어가 **도메인 유형** 또는 **집계** 라는 용어와 혼용되어서 사용될 수 있다.

##### CrudRepository 인터페이스

{% highlight java %}
public interface CrudRepository<T, ID> extends Repository<T, ID> {
  <S extends T> S save(S entity);
  Optional<T> findById(ID primaryKey);
  Iterable<T> findAll();
  long count();
  void delete(T entity);
  boolean existsById(ID primaryKey);
  // … more functionality omitted.
}
{% endhighlight %}

모를 땐 코드 내부를 뜯어보면 되니 그냥 외우지 말자. `CrudRepository` 는 다음과 같은 인터페이스들을 제공한다. 각각은 함수명처럼 직관적이게 동작하며, 이 인터페이스에 선언된 메서드는 일반적으로 CRUD 연산을 할 수 있도록 지원하게 된다.

> 나중에 메서드 명에 따라 다른 동작을 수행하도록 할 수 있는데, 이는 쿼리 메서드 정의에서 보며, 이 다음 포스팅에서 `JpaRepository` 또한 이와 같은 것을 제공하며 `MongoRepository` 도 마찬가지이다.

##### PagingAndSortingRepository 인터페이스

우리가 어떤 사이트의 검색을 통해 다양한 것을 검색할 때, 검색 대상의 특성에 따라 내림차순 오름차순 정리를 할 수 있는 것을 볼 수 있는데, 이것이 `PagingAndSortingRepository` 의 기능이다.

{% highlight java %}
public interface PagingAndSortingRepository<T, ID>  {

  Iterable<T> findAll(Sort sort);

  Page<T> findAll(Pageable pageable);
}
{% endhighlight %}

여기는 Crud 가 없기에 같이 extends 를 해주어서 사용해야한다. 즉, 두 인터페이스를 같이 사용하면 된다.

> `List` 반환 보다는 `Iterable` 반환

**Pageable**

페이징 기능을 구현할 때 핵심이 되는 인터페이스인데 페이지 단위를 들고올 때 `Pageable` 을 구현한 객체를 통해 `Page` 를 가져오게 된다.

{% highlight java %}
public interface Pageable {
    int getPageNumber();  // 현재 페이지 번호 (0부터 시작)
    int getPageSize();    // 한 페이지당 보여줄 데이터 개수
    long getOffset();     // 몇 번째 데이터부터 시작할지 (pageNumber * pageSize)
    Sort getSort();       // 정렬 기준 (Sort 객체)
    Pageable next();      // 다음 페이지로 이동
    Pageable previousOrFirst(); // 이전 페이지 또는 첫 페이지로 이동
    Pageable first();     // 첫 페이지로 이동
    boolean hasPrevious(); // 이전 페이지가 있는지 여부
}
{% endhighlight %}

주요 메서드는 위와 같은데, 이를 다 구현하기는 빡쎄고, `PageRequest.of` 를 통해 `Pageable` 을 간단히 얻을 수 있다.

{% highlight java %}
Pageable pageable = PageRequest.of(0, 10); // 0번 페이지, 페이지당 10개
Pageable pageable = PageRequest.of(1, 5, Sort.by("name").ascending());
{% endhighlight %}

이때 Spring MVC 와 함께 쓴다면 다음과 같이 간단히 된다.

{% highlight java %}
@GetMapping("/users")
public Page<User> getUsers(Pageable pageable) {
    return userRepository.findAll(pageable);
}

// GET /users?page=0&size=5&sort=name,desc
{% endhighlight %}

**Page**
{% highlight java %}
Page<User> page = userRepository.findAll(pageable);

List<User> users = page.getContent();     // 현재 페이지 데이터
int pageNumber = page.getNumber();        // 현재 페이지 번호
int totalPages = page.getTotalPages();    // 전체 페이지 수
long totalElements = page.getTotalElements(); // 전체 데이터 개수
boolean hasNext = page.hasNext();         // 다음 페이지 존재 여부
{% endhighlight%}

Page 는 totalElements 를 계산하기 때문에 조금 무겁다. 대신 Slice 를 사용하면 이를 계산하지 않아도 된다.

##### Slice

전체 데이터 개수(total count)를 계산하지 않고, 다음 페이지가 있는지만 알려주는 방식이다.

**Page 동작**
{% highlight sql %}
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 0;
SELECT COUNT(*) FROM users;
{% endhighlight %}

**Slice 동작**
{% highlight sql %}
SELECT * FROM users ORDER BY id LIMIT 11 OFFSET 0;
{% endhighlight %}

나머지는 다 같고 그냥 반환값만 Slice 로 해주면 된다.

{% highlight java %}
public interface UserRepository extends PagingAndSortingRepository<User, Long> {
    Slice<User> findByAgeGreaterThan(int age, Pageable pageable);
}
{% endhighlight %}

#### ⭐️ New Entity Detection

기본적으로 Spring Data 의 엔티티가 새로운지 안새로운지의 판단해야 한다. 예를 들어 `save()` 메서드는 C 기능과 U 기능을 함께 하는 메서드이다(만약 새로운 엔티티라면 Create 기능으로, 새로운 엔티티가 아니라면 Update 기능으로 실행됨).

규칙은 위부터 아래로 우선순위를 가진다.

**규칙**
1. `@Id` 애너테이션(프로퍼티)
    - `INSERT`: null 혹은 원시 타입에서 default value 인 경우 = 신규
    - `UPDATE`: 그 외
2. `@Version` 애너테이션(프로퍼티) 이 있다면 다음 기준으로 신규 여부 판단
    - `INSERT`: null 또는 원시형 = 신규
    - `UPDATE`: 값이 존재하고 0이 아님
3. `org.springframework.data.domain.Persistable` 인터페이스 구현 시
    - Spring Data 는 엔티티 내부의 `isNew()` 메서드를 호출하여 신규 여부를 판단한다.

> TIP. `AccessType.PROPERTY` 를 사용하면 `Persistable` 속성이 감지되어 유지됩니다. 이를 방지하려면 `@Transient` 를 사용

#### @NoRepositoryBean 를 정의하여 자주 사용하는 메서드들 정의

{% highlight java %}
@NoRepositoryBean
interface MyBaseRepository<T, ID> extends Repository<T, ID> {
    // 모든 Repository 가 공통으로 사용할 메서드
    default void printEntityInfo(T entity) {
        System.out.println("Entity info: " + entity.toString());
    }

    // 공통적인 find 메서드 규약 정의
    Optional<T> findByName(String name);
}

interface UserRepository extends MyBaseRepository<User, Long> { … }
{% endhighlight %}

`NoRepositoryBean` 은 `Bean` 으로 등록되지 않도록 하는 애너테이션이다. 이를 통해 `MyBaseRepository` 는 Bean 으로 등록되지 않고, 이를 상속한 하위 인터페이스들만 실제 Bean 으로 등록되어 사용된다.

이를 사용하는 유용한 이유는 공통 로직이나 규약을 묶어두는 베이스 리포지토리를 정의할 때, Spring Data 가 이를 실수로 실제 구현 대상으로 감지하지 않게 만들 수 있기 때문이다.

#### 저장소 활성화 구성 정의하기

`ComponentScan` 처럼 `EnableJpaRepositories` 나 `EnableJdbcRepositories` 를 통해 Jdbc 레포지토리의 범위를 지정할 수 있다.

{% highlight java %}
@Configuration
@EnableJpaRepositories("com.acme.repositories")
class ApplicationConfiguration {

  @Bean
  EntityManagerFactory entityManagerFactory() {
    // …
  }
}

@Configuration
@EnableJdbcRepositories("${app.scan.packages}")
public class ApplicationConfiguration {
  // …
}
{% endhighlight %}

필터 사용은 `ComponentScan` 과 동일하다.

#### ⭐️ Query Method

`Repository Proxy` 는 메서드 이름으로 스토리지 별 쿼리를 생성하는 방법 2가지를 제공하게 된다.

1. 메서드 이름으로부터 직접 쿼리를 유도함
2. 수동으로 정의된 `@Query` 를 사용함

이렇게 정의된 사용 가능한 인터페이스 메서드들은 실제 데이터 스토어에 따라 내부적인 쿼리 구조가 달라지지만, 이 쿼리 구조들 중에 반드시 **어떤 쿼리가 실행될지를 결정하는 전략이 존재**해야만 한다. 이를 `Query Lookup Strategies` 라고 한다.

##### Query Lookup Strategies

레포지토리 프록시가 쿼리를 해결하기 위해 사용할 수 있는 전략은 다음과 같다.

- XML 설정에서는 query-lookup-strategy 속성을 통해 네임스페이스 수준에서 전략을 지정
- Java 설정에서는 `@EnableJdbcRepositories` 애너테이션의 `queryLookupStrategy` 속성을 사용 가능

우리는 두번째를 주로 이용하게 된다.

> 일부 전략은 특정 데이터 스토어에서는 지원되지 않을 수 있음

**전략 종류**

1. `CREATE`
    - 메서드 이름으로부터 스토어별 쿼리를 생성하려고 시도한다.
    - 일반적인 접근 방식은 메서드 이름에서 잘 알려진 prefix 를 제거하고 나머지 이름을 파싱하여 쿼리를 구성
    - prefix 라고 함은 `find`, `get`, `update` 등등 지정된 단어로 시작하는 것

2. `USE_DECLARED_QUERY`
    - 이미 선언된 쿼리를 찾으려고 시도하며, 선언된 쿼리를 찾지 못하면 예외를 발생시킴
    - 쿼리는 어노테이션(`@Query`)이나 다른 방법으로 미리 정의될 수 있음
    - 특정 스토리지에서 사용 가능한 옵션은 해당 스토리지 문서를 참고
    - 리포지토리 인프라가 부트스트랩 시점에 메서드에 대한 선언된 쿼리를 찾지 못하면 실패

3. `CREATE_IF_NOT_FOUND`(기본값)
    - `CREATE` 와 `USE_DECLARED_QUERY` 를 결합한 전략이며
    - 먼저 선언된 쿼리를 찾고, 없으면 메서드 이름 기반 커스텀 쿼리를 생성하게 된다.
    - 명시적으로 설정하지 않으면 기본 전략으로 사용된다.
    - 메서드 이름으로 빠르게 쿼리를 정의할 수 있으며, 필요에 따라 선언된 쿼리를 추가해 세밀하게 조정 가능하다.


##### Query Creation

쿼리를 이제 생성하는 규칙을 보자. 크게 쿼리는 다음과 같이 나뉘게 된다.

- 주어(subject): 첫 번째 부분(find...By, exists...By)은 **쿼리의 주어를 정의**하고
    - 주어를 나타내는 도입 절(introducing clause) 은 추가 `expressions` 을 포함할 수 있다.
    - `introducing clause`: 이 절의 모든 텍스트는 descriptive 으로 간주되며 `Distinct`, `Top`, `First` 등을 사용하면 쿼리에 distinct 플래그를 설정하거나 결과 개수를 제한할 수 있게 된다.

- 술어(predicate): 두 번째 부분은 쿼리의 조건을 정의한다.
    - 부록(appendix): 마지막 부분에는 **정렬(sorting)**과 **대소문자(letter-casing) 수정자**를 포함한 쿼리 메서드 **주어(subject) 키워드**와 쿼리 메서드 **술어(predicate) 키워드**의 콜라보이다.  
    하지만 첫 번째 `By` 는 실제 `predicate` 의 시작을 나타내는 `delimiter` 역할을 하게 되고, 기본적으로 엔티티 속성에 조건을 정의하고 `And`, `Or` 로 연결 할 수 있다. 이런 부록이 연결자를 통해 계속 연결될 수 있다.


실제 메서드 파싱 결과는 **쿼리를 생성하는 영속성 저장소(persistence store)** 에 따라 달라진다. 하지만 일반적으로 다음 사항들은 유지된다.

- expression 은 주로 **property 접근과 operator 의 결합**으로 이루어지며, 속성 표현식은 And 와 Or 로 결합 가능하다.

- `Between`, `LessThan`, `GreaterThan`, `Like` 등의 연산자를 속성 표현식(부록)에 적용할 수 있으며 지원되는 연산자는 저장소마다 다를 수 있다.

- 메서드 파서는 개별 속성에 대해 `IgnoreCase` 플래그를 설정할 수 있다.

##### Reserved Method Names

레포지토리의 메서드는 일반적으로 속성 이름으로 바인딩 되지만, 기본 레포지토리에서 상속 받은 특정 메서드 이름과 관련해서는 몇 가지 예외가 있다. 예를 들어 `findById` 와 같은 Id 는 실제 `@Id` 가 풑어있는 속성을 대상으로 하게 된다(`findByPk` 해도 된다).

{% highlight java %}
class User {
  @Id Long pk;      // 식별자 속성

  Long id;          // 식별자 아님
  // …
}

interface UserRepository extends Repository<User, Long> {

  Optional<User> findById(Long id);     
  Optional<User> findByPk(Long pk);     
  Optional<User> findUserById(Long id); 
}
{% endhighlight %}

##### Property Expressions

속성 표현식은 관리되는 엔티티의 직접적인 속성만을 참조할 수 있다. 이전 예시처럼 쿼리를 생성할 때 파싱된 속성이 도메인 클래스의 속성임을 미리 확인한다. 하지만 엔티티 내의 속성에서 속성의 또 속성을 가지고 오면 어떨까?

{% highlight java %}
List<Person> findByAddressZipCode(ZipCode zipCode);
{% endhighlight %}

예를 들어 `Person` 이 `Address` 를 가지고 있고, 그 `Address` 가 `ZipCode` 를 가지고 있다고 가정하자. 이 경우 메서드는 `x.address.zipCode` 라는 **속성 탐색(Property Traversal)**을 생성한다.

생성된 `Spring Data JPA` 의 속성 탐색의 속성 해석 알고리즘은 다음과 같은 방식으로 작동하게 된다.

1. `AddressZipCode` 전체를 하나의 속성 이름(첫 글자 소문자)으로 간주하여 도메인 클래스에서 찾는다.

2. 해당 속성이 없으면, 알고리즘은 오른쪽부터 camel-case 단위로 분할하여 다시 시도한다.
    - `AddressZip`, `Code` 로 분할

3. 분할이 실패하면 왼쪽으로 이동하면서 다시 시도한다.
    - `Address`, `ZipCode` 로 분할

이는 한가지 잘못된 속성을 선택할 위험이 있는 알고리즘인데, 만약 Person 클래스에서 addressZip 이라는 속성이 별도로 존재한다고 해보자. 그러면 알고리즘은 첫번째 분할에서 이미 AddressZip 을 매칭시켜버리고, 그 타입은 code 속성이 없기 때문에 실패하게 된다.

이때 메서드 이름에 **언더스코어(_)** 를 사용하여 명시적으로 탐색 지점을 구분할 수 있으며 다음과 같이 작성하면 된다.

{% highlight java %}
List<Person> findByAddress_ZipCode(ZipCode zipCode);
{% endhighlight %}

_ 에 대한 규칙은 다음과 같다.
- _ 로 시작하는 필드명: 밑줄 그대로 유지되며, 중첩 경로를 구분하려면 `__` 를 사용해야 한다.
- 대문자로만 구성된 필드명: 모두 대문자인 필드명은 그대로 사용할 수 있고, 중첩 경로를 표현해야 한다면, _ 로 구분해야 한다.
- 두 번째 글자가 대문자인 필드명: `qCode` 처럼 첫 글자는 소문자이고 두 번째 글자가 대문자인 경우, 해석 시 두 글자를 대문자로 시작하는 형태(`QCode`) 로 사용해야 한다. 즉, `String qCode` 는 속성 표현식에서 `QCode` 로 표현해야 한다는 것이다.
- 경로 모호성: `Code q` 와 `String qCode` 둘을 엔티티가 가지고 있고 `Code` 는 또 `String code` 를 가지고 있다고 해보자. 이때는 속성 해석 알고리즘은 직접 속성을 우선적으로 하기 때문에 `qCode` 필드를 먼저 매칭시키게 된다.

##### Repository Methods Returning Collections or Iterables

여러 개의 결과를 반환하는 쿼리 메서드는 일반적인 Java 컬렉션 타입인 `Iterable`, `List`, `Set` 을 사용할 수 있다. 이 외에도 `Spring Data` 에서 제공하는 `Streamable`(`Iterable` 을 확장한 커스텀 타입) 이나 `Vavr` 라이브러리 컬렉션 타입도 반환타입으로 사용할 수 있다(주로 Iterable 을 사용한다).

**Streamable**

`Iterable` 이나 일반적인 컬렉션 타입의 대체 타입으로 사용할 수 있다. 이 타입은 `Iterable` 에는 없는 비병렬(non-parallel) Steam 접근 메서드를 제공하며, `filter`, `map` 등의 스트림 연산을 직접 수행할 수 있고, 다른 `Streamable` 객체들로 바꿀 수 있는 기능도 제공한다.

{% highlight java %}
interface PersonRepository extends Repository<Person, Long> {
  Streamable<Person> findByFirstnameContaining(String firstname);
  Streamable<Person> findByLastnameContaining(String lastname);
}

Streamable<Person> result = repository.findByFirstnameContaining("av")
  .and(repository.findByLastnameContaining("ea"));
{% endhighlight %}

**사용자 정의 Streamable 래퍼 타입 반환**

컬렉션을 감싸는 전용 래퍼 타입을 제공하는 것은 여러 개의 결과를 반환하는 쿼리 결과에 대한 전용 API 를 제공하기 위한 흔한 패턴이다. 보통 이런 래퍼 타입은 레포지토리 메서드가 컬렉션 타입을 반환한 뒤, 그 결과를 수동으로 감싸서(wrapper instance) 생성하는 방식으로 사용한다.

하지만 Spring Data 에서는 다음 조건을 만족한다면 이러한 래퍼 타입 자체를 쿼리 메서드의 반환 타입으로 직접 사용할 수 있다.

1. 그 타입이 Streamable 인터페이스를 구현해야 함
2. Streamable 을 인자로 받는 생성자 또는 정적 팩터리 메서드(of, valueOf) 중 하나를 제공해야 한다.

{% highlight java %}
class Product {                                         
  MonetaryAmount getPrice() { … }
}

@RequiredArgsConstructor(staticName = "of")
class Products implements Streamable<Product> {         

  private final Streamable<Product> streamable;

  public MonetaryAmount getTotal() {                    
    return streamable.stream()
      .map(Product::getPrice)
      .reduce(Money.of(0), MonetaryAmount::add);
  }

  @Override
  public Iterator<Product> iterator() {                 
    return streamable.iterator();
  }
}

interface ProductRepository extends Repository<Product, Long> {
  Products findAllByDescriptionContaining(String text); 
}
{% endhighlight %}

> @RequiredArgsConstructor(staticName = "of"): final 필드나 @NonNull 이 붙은 필드만을 대상으로 자동으로 생성자를 만들어줌. 이때 of 라는 정적 팩터리 메서드를 생성자 대신 제공해준다. 즉 다음과 같다:  
```java
@RequiredArgsConstructor(staticName = "of")
class Example {
    private final String name;
}
// =========== 아래로 변환 ============
public class Example {
    private final String name;

    private Example(String name) {
        this.name = name;
    }

    public static Example of(String name) {
        return new Example(name);
    }
}
```

##### Streaming Query Results

Stream 또한 사용할 수 있는데:

{% highlight java %}
@Query("select u from User u")
Stream<User> findAllByCustomQueryAndStream();

Stream<User> readAllByFirstnameNotNull();

@Query("select u from User u")
Stream<User> streamAllPaged(Pageable pageable);
{% endhighlight %}

Stream 은 내부적으로 데이터 저장소 전용 리소스를 감쌀 수 있으므로 사용이 끝난 후에는 반드시 닫아야 한다.

##### Asynchronous Query Results

Spring 의 비동기 메서드 실행 기능을 사용하면 레포지토리 쿼리를 비동기적으로 실행할 수 있다.

즉, 메서드가 호출되자마자 즉시 반환되며, 실제 쿼리는 String 의 TaskExecutor 에 제출된 별도의 작업에서 실행된다고 한다.

> 비동기 쿼리는 리액티브 쿼리랑은 다르다.

{% highlight java %}
@Async
Future<User> findByFirstname(String firstname);

@Async
CompletableFuture<User> findOneByFirstname(String firstname);
{% endhighlight %}

`java.util.concurrent.Future` 를 반환타입으로 하며, `CompletableFuture` 도 반환값으로 사용할 수 있다.

##### Paging, Iterating Large Results, Sorting & Limiting

쿼리에서 파라미터를 처리하려면, 이전 예제들에서 봤듯이 파라미터로 정의하면 된다. 이외에도 Spring Data 는 Pageable, Sort, Limit 와 같은 특정 타입을 인식하여 쿼리에도 동적으로 페이징, 정렬, 결과 제한 등을 적용시킬 수 있다.

{% highlight java %}
Page<User> findByLastname(String lastname, Pageable pageable);

Slice<User> findByLastname(String lastname, Pageable pageable);

List<User> findByLastname(String lastname, Sort sort);

List<User> findByLastname(String lastname, Sort sort, Limit limit);

List<User> findByLastname(String lastname, Pageable pageable);
{% endhighlight %}

Sort, Pageable Limit 를 사용하는 API 들은 null 값이 아닌 인자를 반드시 전달받아야 함을 알고 있자.