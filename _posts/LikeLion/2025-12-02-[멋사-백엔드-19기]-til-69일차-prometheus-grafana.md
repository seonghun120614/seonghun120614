---
layout: post
title:  "[멋사 백엔드 19기] TIL 69일차 Prometheus Grafana"
date:   2025-12-02 16:21:12 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL DevOps
---

<!--more-->

## 📂 목차
- [시계열 데이터](#시계열-데이터)
- [Prometheus](#prometheus)
    - [Prometheus Server](#prometheus-server)
    - [Exporter](#exporter)
    - [PromQL](#promql)
    - [Alertmanager](#alertmanager)
    - [서비스 디스커버리](#서비스-디스커버리)
    - [Dependency](#dependency)
    - [Spring Actuator 설정](#spring-actuator-설정)
    - [prometheus.yml 설정](#prometheusyml-설정)
    - [Prometheus Docker Container 구동](#prometheus-docker-container-구동)
        - [Prometheus PromQL 쿼리 날리기](#prometheus-promql-쿼리-날리기)
        - [PromQL 집계함수 사용해보기](#promql-집계함수-사용해보기)
- [Grafana](#grafana)

---

## 📚 본문


### 시계열 데이터

시간의 흐름에 따라 일정 간격으로 기록되는 데이터

- 자기 상관성: 이전 값이 다음 값에 영향을 줌
- Trend, Seasonality, Irregularity 같은 패턴이 존재 가능
- 규칙적 간격으로 기록

**Prometheus의 시계열 데이터 모델**

{% highlight text %}
{메트릭 이름}{레이블 집합} 값 타임스탬프

예시:
http_server_requests_seconds_count{method="GET",status="200",uri="/api/users"} 1234 1701336000000
{% endhighlight %}

### Prometheus

시계열 데이터 기반의 모니터링 및 아림 시스템이며, 쿠버네티스나 클라우드 네이티브 환경에서 사실 상 표준처럼 사용되는 도구이며, 메트릭을 수집하고 저장하며, 쿼리하고, 알림까지 제공한다.

**특징**
- 알림 제공
- Pull 방식: 타겟(exporter)에 대한 메트릭을 정기적으로 끌어와서 저장하는 시계열 데이터베이스 기반의 모니터링 시스템
    - Prometheus 가 타겟을 직접 체크
    - 불필요한 데이터 Push 방지
    - 언제 얼마나 수집할지에 대한 제어가 쉬움
    - 타겟이 다운되었는지 쉽게 감지 가능
- `PromQL`: 강력한 쿼리 언어
- 다양한 Exporter: 다양한 시스템 (`DB`, `Redis`, `Nginx` 등) 메트릭 수집 가능

#### Prometheus Server

여기서 Prometheus Server 는 위와 같은 특징을 가지며 모든 메트릭을 수집(Pull)하고 시계열 DB 에 저장하는 중앙 서버이다.

**구성 요소**
- TSDB(타임시리즈 데이터 저장)
- Scraper(메트릭 수집기)
- Query Engine(PromQL 실행)

#### Exporter

또 Exporter 라는 것은 메트릭을 Prometheus 형식으로 노출해주는 작은 서버(HTTP endpoint 로 노출) 이며, 다양한 exporter 가 있다:

- Node Exporter
- cAdvisor
- MySQL Exporter
- Redis Exporter

#### PromQL

Prometheus Query Language 의 약자로

- 시간 기반 계산
- 레이블을 활용한 필터링
- 집계(sum, rate, avg 등)

이 있다.

#### Alertmanager

Prometheus 가 보낸 알림을 관리하고 전달하는 시스템

- `Slack` / `Email` / `Discord` / `Webhook` / `PagerDuty` 등으로 알림 전송
- 알림 그룹화, 중복 제거, 억제

등을 맡는다.

#### 서비스 디스커버리

타겟 목록을 자동으로 찾는 기능

- 쿠버네티스, EC2, Consul, Docker Swarm 등 지원

**architecture**
{% highlight text %}
Spring Boot App → /actuator/prometheus (메트릭 노출)
                          ↑
                    Prometheus (스크랩)
                          ↓
                 시계열 데이터베이스 저장
                          ↓
                     Grafana (시각화)
{% endhighlight %}

- Prometheus = 모니터링 + 시계열 DB + 알림 시스템
- 저장 모델 = Label-Based Time Series
- 쿼리 언어 = PromQL
- 알림 = AlertManager
- 확장 = Grafana, Thanos, k8s 연동

Grafana 는 이후에 본다.

#### Dependency

{% highlight gradle %}
dependencies {
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    implementation 'io.micrometer:micrometer-registry-prometheus'
}
{% endhighlight %}

#### Spring Actuator 설정

{% highlight text %}
management:
  endpoints:
    web:
      exposure:
        include:
          - health
          - info
          - metrics
          - loggers
          - threaddump
          - prometheus  # Prometheus 엔드포인트 추가

  endpoint:
    health:
      show-details: ALWAYS
{% endhighlight %}

위에 prometheus 를 추가해준다.

#### prometheus.yml 설정

{% highlight yml %}
global:
  scrape_interval: 15s        # 기본 스크랩 간격
  scrape_timeout: 10s         # 스크랩 타임아웃
  evaluation_interval: 15s    # rule 평가 간격
  external_labels:
    monitor: 'my-monitor'     # 외부 레이블, AlertManager 등에서 활용

scrape_configs:               # 모니터링할 타겟 정의
  - job_name: 'node'          # 잡 이름
    static_configs:           # 고정 타겟
      - targets: ['localhost:9100']
        labels:
          env: production     # 레이블 지정

rule_files:                   # alert/rule 파일 경로
  - "alerts.yml"
{% endhighlight %}

스크랩은 메트릭 수집으로 보면 된다. 여기서 alerting rule, recording rule 이라는게 있다. 이 개념을 좀 보자.

- **Alerting Rule**: 특정 조건(예: CPU 사용률 > 90% 이상) 이면 `AlertManager` 로 알림 전송, 이 조건을 계산하는 주기가 바로 `evaluation_interval`

- **Recording Rule**: 자주 쓰는 쿼리 결과를 새로운 시계열로 저장하여 쿼리 성능을 최적화, 이때 자주 쓰는 쿼리의 계산을 발동하는 그 간격 `evaluation_interval`

이 룰들은 자동으로 계속 계산되어야 하며, 이 계산 주기를 정하는 것이 `evaluation_interval` 이다. 나머지 key 들에 대한 설명이다:

- `external_labels`: `Prometheus` 가 다른 `Prometheus` 나 `AlertManager` 로 데이터를 보낼 때 자동으로 붙이는 레이블
- `scrape_configs` 의 `static_configs`: 어떤 대상에서 메트릭을 가져올지를 정해야 하는데, `scrape_configs` 안에 여러 잡을 정의할 수 있고, 각 잡의 타겟을 지정하는 방법 중 하나가 `static_configs` 이다. `Prometheus` 가 수집할 대상이 변하지 않고 고정되어 있다는 의미다.
    - 새로운 서버가 생기면 직접 `yml` 수정 필요

{% highlight yml %}
scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100', 'server2:9100']
        labels:
          env: production
{% endhighlight %}

#### Prometheus Docker Container 구동

보통 프로메테우스는 9090 포트를 쓴다. 기본 구성 파일은 `/etc/prometheus/prometheus.yml` 에 지정시키는 듯하다.

{% highlight bash %}
docker run -d \
  --name prometheus \
  --network spring-net \
  -p 9090:9090 \
  -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml" \
  prom/prometheus
{% endhighlight %}

##### Prometheus PromQL 쿼리 날리기

`http://localhost:9090/query` 로 접속하여 사진의 쿼리를 날려보자.

![assets/img/prometheus-test.png]({{ site.baseUrl }}/assets/img/prometheus-test.png)

나오는 time series 데이터들에 대해서도 label 을 통한 필터링이 가능하다.

##### PromQL 집계함수 사용해보기

트래픽을 분석하기 위해 다음 메트릭을 사용할 수 있다.

- `http_server_requests_seconds_count`
- `http_server_requests_active_seconds_count`

이를 시간을 기준으로 시계열 데이터를 가져와보자.

{% highlight promql %}
rate(http_server_requests_seconds_count[1m])
{% endhighlight %}

rate 집계 함수로 카운터 메트릭의 단위 시간당 증가율을 계산하는 함수인데, 최근 1분 동안의 값 변화량을 기준으로 계산하겠다는 의미이다.

### Grafana

