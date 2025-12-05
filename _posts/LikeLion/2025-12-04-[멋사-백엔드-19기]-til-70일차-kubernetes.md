---
layout: post
title:  "[멋사 백엔드 19기] TIL 70일차 Kubernetes"
date:   2025-12-04 14:52:48 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL DevOps
---

<!--more-->

## 📂 목차
- [Kubernetes 구성요소]()
- []()

---

## 📚 본문

### Kubernetes 구성요소

쿠버네티스(Kubernetes, K8s)는 컨테이너 오케스트레이션 플랫폼으로, 컨테이너 기반 애플리케이션을 배포·스케일링·관리·복구하는 표준 도구다. 이를 구성하는 요소는 크게 마스터 노드(Control Plane) 와 워커 노드(Worker Node, Node), 그리고 오브젝트(Object)로 나뉜다.

#### Control Plane 구성요소

마스터 노드라고 불리며 나중에 터미널에서는 `kubectl` 의 명령어를 사용하여 여기에 접근한다. 마스터 노드 내에도 여러 구성 요소가 있다:

**API Server(kube-apiserver)**
- Kubernetes 의 모든 요청이 통과하는 게이트웨이
- kubectl, node, controller 등 모든 컴포넌트가 API 서버와 통신
- 인증/인가, 요청 검증, REST API 제공

**Scheduler(kube-scheduler)**
- **어떤 Pod 를 어떤 Node 에 배치할지** 결정
- CPU/메모리 자원, 노드 상태, 리소스 요구사항 등을 기준으로 스케줄링

**Controller Manager(kube-controller-manager)**
- 클러스터 상태를 desired state 로 유지시키는 관리자
- 여러 컨트롤러들의 집합:
    - Node Controller
    - Deployment Controller
    - ReplicaSet Controller
    - Job Controller
- Pod 개수가 부족해지면 자동 생성 등 자동화 로직 수행

**etcd**
- 쿠버네티스의 모든 상태 데이터를 저장하는 분산 key-value 저장소
- 클러스터의 소스 오브 트루스(State 저장소)
- Control Plane 의 유일한 DB

#### Worker Node 구성요소

보통 우리가 일반적으로 노드라고 부르는 요소들이다.

**kubelet**
- 해당 노드에서 Pod와 컨테이너 실행을 관리한다
- API Server 로 부터 명령을 받고 Pod 를 생성 삭제한다
- liveness, readiness probe 등 헬스체크를 수행

**kube-proxy**
- 쿠버네티스 Service 의 네트워크 라우팅을 담당
- `iptables` 또는 **IPVS** 기반으로 트래픽을 올바른 Pod 로 전달

**Container Runtime**
- 컨테이너 실행 엔진
- Docker, `containerd`, `CRI-O` 등 사용 가능

#### Kubernetes Object(리소스) 구성요소

쿠버네티스는 모든 것들을 Object(YAML 선언) 로 관리한다.

##### Workload 오브젝트

- **Pod**: 컨테이너 1개 이상을 묶은 최소 배포 단위

- **Deployment**: ReplicaSet + 롤링 업데이트/롤백 제공
    - **ReplicaSet**: Pod의 개수를 일정하게 유지하는 컨트롤러

- **StatefulSet**: 고정된 ID 의 Pod 관리(ex. DB, Kafka, Redis Cluster)

- **DaemonSet**: 각 **노드마다 1개**씩 Pod 배치

- **Job**: 한 번 수행 후 종료되는 작업
    - **CronJob**: 스케줄 기반 Job 배치

##### Service 구성요소

- **Service**: Pod 들의 안정적인 접근 엔트포인트(Load Balancing)

- **Type**: ClusterIP, NodePort, LoadBalancer, ExternalName 4가지의 유형이 있다.

- **Ingress**: HTTP / HTTPS 라우팅, 도메인 기반, 경로 기반 라우팅 제공, Ingress Controller 필요

- **Endpoint / EndpointSlice**: Service 가 실제 연결해야 하는 Pod 의 IP 목록을 저장

##### Volume

Pod 내부에서 사용하는 일시적인 스토리지이다.

- **PersistentVolume(PV)**: 관리자가 제공하는 저장소
- **PersistentVolumeClaim(PVC)**: Pod 가 PV 를 요청하는 선언적 방식

- **StorageClass**: 동적 볼륨 프로비저닝(클라우드에서 자동 PV 생성)

##### Config & Secret

- **ConfigMap**: 환경 변수, 설정파일 등 민감하지 않은 설정 값 저장
- **Secret**: 패스워드, 토큰 등 민감한 데이터 저장, Base64 인코딩되어 저장

##### Networking 구성요소

- **Pod Network(CNI)**: Pod 간 통신을 위함, Calico, Flannel, Cilium 등
- **Service Network**: kube-proxy 가 Load Balancing 을 처리
- **Cluster Network**: 모든 Pod 는 서로 통신 가능해야한다는 규칙

##### Security 요소

- **RBAC**: 사용자/서비스 계정의 권한 관리
- **ServiceAccount**: Pod 내부에서 API Server 접근 시 사용하는 계정
- **NetworkPolicy**: Pod 간 네트워크 트래픽 제어 방화벽
- **PodSecurity(PodSecurityPolicy)**

![assets/img/kubernetes-cluster-architecture.svg]({{ site.baseurl }}/assets/img/kubernetes-cluster-architecture.svg)

위들 중에 몇 개만 본다.

### Deployment

Deployment 는 선언적으로 Pod 를 관리하는 가장 흔한 워크로드 오브젝트이다. 주로 다음을 위해 사용하게 된다:

- replica 유지
- 롤링 업데이트 및 롤백
- 선언적 스케일링

{% highlight yml %}
apiVersion: apps/v1
kind: Deployment
metadata:
    name: hello-nginx
spec:
    replicas: 2
    selector:
        matchLabels:
            app: hello-nginx
    template:
        metadata:
            labels:
                app: hello-nginx
        spec:
            containers:
            - name: nginx-container
              image: nginx:1.26-alpine
              ports:
              - containerPort: 80
{% endhighlight %}

가장 기본적인 구조이며, 위를 쓴 후 다음 명령을 적용시킬 수 있다.

{% highlight bash %}
kubectl apply -f <파일명>.yml

kubectl get deployments # deployment 확인
kubectl get pods -l app=hello-nginx # deployment 에 의해 구동된 pod 확인
{% endhighlight %}

위 필드들을 하나하나 보자. 의미가 직관적인 것들은 전부 생략한다.

- `selector.matchLabels`: deployment 가 관리할 Pod를 선택하는 기준
- `template.metadata.labels`: 생성될 Pod 에 붙는 라벨
- `containers[].image`: 실제 실행할 컨테이너 이미지
- `containers[].ports[].containerPort`: 컨테이너 내부 포트(문서화 목적)

위처럼 구동하면 하나의 Pod 가 띄워지게 되며 `localhost:<포트>` 로 접속할 수 있게 된다.

#### Kubectl 로 명령 실습

`kubectl apply -f <파일>` 을 통해 deployment 를 띄운 것을 보았다. 다음 명령도 실행할 수 있다

**Scailing**
{% highlight bash %}
kubectl scale deployment/hello-nginx --replicas=4
{% endhighlight %}

**Image Update/Rolling**

실행 중인 리소스의 컨테이너 이미지를 업데이트하는 명령이다.

{% highlight bash %}
# kubectl set image <리소스타입>/<리소스명> <컨테이너명>=<새이미지> [옵션]
kubectl set image deployment/hello-nginx nginx-container=nginx:1.16.1
{% endhighlight %}

### Service

Kubernetes 에서 Pod 는 일회용 리소스이다. Pod 를 삭제 혹은 재시작을 하면 다시 새로운 IP 가 할당되며, 스케일링 될 대에도 새로운 IP 들이 생성되게 된다. 이러한 엔드포인트의 변동성 때문에 Pod IP 를 직접 사용한다면 프론트 엔드가 백엔드 Pod IP 를 스케일링 되거나 리로딩 될 때 다시 바꿔줘야 하는 문제가 생기며, Pod 가 재시작될 때마다 IP 가 달라져 설정 정보를 바꿔줘야 하며, 여러 Pod 에 트래픽을 분산 할 방법이 없게 된다.

따라서 Service 라는 리소스를 통해 Pod 앞에 위치하는 네트워크를 추상화한 계층을 추가하여 다음의 구조를 가져간다.

{% highlight text %}
[클라이언트] 
    ↓
[Service: 고정 IP/DNS]
    ↓ (로드밸런싱)
[Pod-1] [Pod-2] [Pod-3] ← IP는 계속 바뀌지만 Service는 안정적
{% endhighlight %}

Service 가 제공하는 핵심 기능:
1. **고정 IP 주소**: ClusterIP 는 Service 삭제 전까지 유지
2. **DNS 이름**: `service-name.namespace.svc.cluster.local` 형태로 접근
3. **자동 로드밸런싱**: 여러 Pod 에 트래픽을 균등 분배
4. **헬스체크**: 비정상 Pod 로는 트래픽을 보내지 않음

위를 통해 우리는 Pod 가 변경, 추가, 삭제가 되더라도 안정적인 서비스를 운용 가능하다.

#### Service 타입

1. ClusterIP

클러스터 내부 전용 통신망이며, 외부에선 접근을 못한다.

{% highlight yml %}
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP  # 생략 가능 (기본값)
  selector:
    app: backend
  ports:
    - port: 8080        # Service 포트
      targetPort: 8080  # Pod 컨테이너 포트
{% endhighlight %}

- 프론트 -> 백엔드 API 통신할 때 주로 사용
- 마이크로 서비스 간의 내부 통신
- 데이터베이스, 캐시 서버 접근

2. NodePort

각 노드의 특정 포트를 개방하여 외부 접근을 허용하도록 한다.

{% highlight yml %}
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  type: NodePort
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080  # 30000-32767 범위
{% endhighlight %}

동작 방식:
{% highlight text %}
[외부 클라이언트]
    ↓
http://<노드IP>:30080
    ↓
[노드의 30080 포트]
    ↓
[Service (ClusterIP 자동 생성)]
    ↓
[Pod들]
{% endhighlight %}

- 개발 / 테스트 환경에서 빠른 외부 노출을 위해 사용하며
- 로컬 Kubernetes 클러스터(Docker Desktop, Minikube) 에서 사용한다.

3. LoadBalancer

클라우드 제공자의 로드밸런서를 자동 생성한다.

{% highlight yml %}
apiVersion: v1
kind: Service
metadata:
  name: public-web-service
spec:
  type: LoadBalancer
  selector:
    app: web
  ports:
    - port: 80
      targetPort: 8080
{% endhighlight %}

**동작 방식**

{% highlight text %}
[인터넷]
    ↓
http://a1b2c3-xyz.elb.amazonaws.com
    ↓
[AWS ELB 자동 생성]
    ↓
[Kubernetes Service]
    ↓
[Pod들]
{% endhighlight %}

- AWS, GCP, Azure 등의 클라우드 환경에서만 동작

#### 실습

여기서는 자주 사용하는 NodePort 를 보자.

{% highlight yml %}
---
# Deployment: nginx 컨테이너 실행
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-deployment
spec:
  replicas: 1  # Pod 1개 실행
  selector:
    matchLabels:
      app: hello-nginx  # 이 라벨로 Pod 선택
  template:
    metadata:
      labels:
        app: hello-nginx  # Pod에 부여할 라벨
    spec:
      containers:
      - name: nginx-container
        image: nginx:alpine
        ports:
        - containerPort: 80  # nginx 기본 포트

---
# Service: NodePort로 외부 노출
apiVersion: v1
kind: Service
metadata:
  name: hello-service
spec:
  type: NodePort
  selector:
    app: hello-nginx  # 위 Deployment의 라벨과 일치
  ports:
    - port: 80        # Service 내부 포트
      targetPort: 80  # Pod의 컨테이너 포트
      nodePort: 30080 # 노드에서 개방할 포트 (선택사항)
{% endhighlight %}

- `spec.ports.port`: 서비스가 제공할 포트
- `spec.ports.targetPort`: Pod 로 전달할 포트
- `spec.ports.nodePort`: 노드에서 열 포트(30000-32767)

##### Endpoints

여기서 이를 실행시키면 Docker 내부에서는 Service 가 실행 후 트래픽을 보낼 실제 대상인 Endpoints 라는 구성요소가 자동으로 생성되게 된다.

{% highlight yml %}
apiVersion: v1
kind: Endpoints
metadata:
  name: hello-service
subsets:
- addresses:
  - ip: 10.1.0.15  # Pod IP
    targetRef:
      kind: Pod
      name: hello-deployment-7d4f8c9b6d-x5k2m
  ports:
  - port: 80
    protocol: TCP
{% endhighlight %}

> endpoint = service 가 트래픽을 보낼 실제 대상

아래 명령으로 확인할 수 있다.

{% highlight bash %}
kubectl get endpoints hello-service -o yaml
{% endhighlight %}

##### 로드밸런싱 확인

{% highlight bash %}
kubectl scale deployment hello-deployment --replicas=3

kubectl get pods -o wide
{% endhighlight %}

위를 실행하면 각기 다른 ip 로 3개의 pod 가 실행되고 있음을 볼 수 있고, end point 도 그에 맞게 바뀌는 것을 볼 수 있다.

{% highlight bash %}
kubectl get endpoints hello-service
{% endhighlight %}

이제 `curl` 명령을 통해 실제로 로드 밸런싱이 되는지 보자. 우선 Pod 마다 `index.html` 을 달리 가져가자.

{% highlight bash %}
#!/bin/bash

set -euo pipefail

NUM=1
for container in "$@"; do
    kubectl exec -i "$container" -- sh -c "echo 'Pod ${NUM}' > /usr/share/nginx/html/index.html"
    ((NUM++))
done
{% endhighlight %}

이제 다음을 실행하여 서로 다른 index.html 이 뜨는지 보자.

{% highlight bash %}
for i in {1..10}; do
  curl -s http://localhost:30080
done
{% endhighlight %}

##### kube-proxy 의 역할

각 노드의 `kube-proxy` 가 Service 규칙을 구현하며

{% highlight text %}
[외부 클라이언트] 
    ↓ curl http://192.168.1.100:30080
[노드의 30080 포트]
    ↓ "누가 30080으로 요청"
[kube-proxy의 iptables/IPVS 규칙]
    ↓ "이 트래픽은 hello-service로 가야함을 알림"
    ↓ "hello-service 의 Pod 중 하나를 고름"
    ↓ 로드밸런싱 (랜덤 또는 라운드로빈)
[선택된 Pod 10.1.0.15:80]
    ↓ nginx 응답
[클라이언트에게 응답 반환]
{% endhighlight %}

위처럼 동작하게 된다.

##### Service 에서의 패킷 흐름

**요청 흐름**
1. 클라이언트: curl http://192.168.1.100:30080  
   Src: 203.0.113.50:54321  
   Dst: 192.168.1.100:30080  
   
2. 노드 도착 → kube-proxy 규칙 적용  
   "30080? hello-service 로 가야함을 알아냄"  
   "Pod 3개 중... Pod2 선택"  
   
3. DNAT 수행 (목적지 변경)  
   Src: 203.0.113.50:54321  
   Dst: 10.1.0.16:80  ⬅️ 변경
   
4. Pod 도착 → nginx 처리  
   "GET / HTTP/1.1 받음"

**응답 흐름 (Response)**
5. Pod 응답 전송
   Src: 10.1.0.16:80
   Dst: 203.0.113.50:54321
   
6. 노드에서 SNAT 수행 (출발지 변경)
   Src: 192.168.1.100:30080  ⬅️ 변경됨
   Dst: 203.0.113.50:54321
   
7. 클라이언트 수신
   "192.168.1.100:30080에서 응답이 옴"

##### 전체 아키텍처 요약

{% highlight text %}
┌─────────────────────────────────────────────────────┐
│                  Kubernetes 클러스터                  │
│                                                     │
│  ┌────────────────────────────────────────────────┐ │
│  │              Worker Node                       │ │
│  │                                                │ │
│  │  ┌──────────────────────────────────────────┐  │ │
│  │  │  kube-proxy (DaemonSet)                  │  │ │
│  │  │  - API Server 감시                        │  │ │
│  │  │  - Service/Endpoint 변경 감지              │  │ │
│  │  │  - iptables/IPVS 규칙 업데이트              │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │          ↓ 규칙 적용                            │  │
│  │  ┌──────────────────────────────────────────┐ │  │
│  │  │  Linux Kernel                            │ │  │
│  │  │  ┌──────────────┐  ┌──────────────┐      │ │  │
│  │  │  │  iptables    │  │    IPVS      │      │ │  │
│  │  │  │  (NAT 테이블) │   │   (가상서버)   │      │ │  │
│  │  │  └──────────────┘  └──────────────┘      │ │  │
│  │  └──────────────────────────────────────────┘ │  │
│  │          ↓ 패킷 라우팅                           │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Pod 10.1.0.15:80  (nginx)              │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Pod 10.1.0.16:80  (nginx)              │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Pod 10.1.0.17:80  (nginx)              │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
{% endhighlight %}

### ConfigMap & Secret

어플리케이션을 운영할 때 가장 중요한 원칙 중 하나는 설정과 코드의 분리이다. ConfigMap 과 Secret 은 이를 실현하는 핵심 리소스이다.

#### ConfigMap

보여져도 상관이 없는 설정 데이터를 key-value 쌍으로 저장하는 API 오브젝트이다.

**특징**
1. 환경 독립성: 컨테이너 이미지와 설정을 분리하여 동일한 이미지를 dev/staging/production 환경에서 재사용이 가능하다.
2. 데이엍 형식: UTF-8 문자열 데이터를 저장한다(바이너리 불가)
3. 크기 제한: 1MB 까지 저장 가능하단(etcd 의 오브젝트 크기 제한

{% highlight yml %}
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # 단순 key-value
  database_url: "postgresql://db.example.com:5432"
  log_level: "info"
  
  # 파일 형태의 설정
  app.properties: |
    server.port=8080
    server.timeout=30s
{% endhighlight %}

`apiVersion`, `kind`, `metadata.name` 까지는 전부 동일하다. data 블록에서 단순 key-value 의 형태로 환경변수를 넣어줄 수 있고, 만약 파일로 `app.properties` 라는 것을 넣고 싶을때는 위와 같이 `|` 기호를 통해 key-value 쌍으로 넣어주면 되겠다.

#### Secret

Secret 은 데이터가 base64로 인코딩되어 저장이 되며, 클러스터 설정에 따라 etcd 암호화하여 저장도 가능하다. `ConfigMap` 과 `Secret` 은 둘 다 etcd 에 영구 저장되지만, 나중에 배울 `Volume` 의 마운트 시에 ConfigMap 은 일반 파일시스템으로, Secret 은 tmpfs 라는 메모리에 마운트 되어 Pod 삭제 시 사라지게 된다.

**기능**
- Base64 인코딩: 데이터가 base64 로 인코딩되어 저장
- etcd 암호화: 클러스터 설정에 따라 `etcd` 에 암호화되어 저장 가능
- 메모리 저장: `Secret` 을 volume 으로 마운트하면 `tmpfs(RAM)` 에 저장되어 디스크에 기록되지 않음
- RBAC 분리: `Secret` 과 `ConfigMap` 파일을 분리함으로써 접근 권한 달리 설정 가능

{% highlight yml %}
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque  # 가장 일반적인 타입
data:
  username: YWRtaW4=  # base64 encoded "admin"
  password: cGFzc3dvcmQxMjM=  # base64 encoded "password123"
{% endhighlight %}

> data 블록 대신 stringData 블록을 쓰면 굳이 encoding 값을 안넣어도 자동으로 base64로 인코딩 해준다.  
> stringData:  
>     username: admin  
>     password: password
>
> 또한 Kubernetes 1.21+ 에서는 불변 설정을 지원한다.  
> immutable: true

##### Secret 베스트 프랙티스

Secret 은 base64 인코딩일 뿐 암호화는 아니다. 이를 해결하기 위해 다음을 보자:

**방법1: etcd 암호화 활성화**

정확한 보안을 위해서는 `EncryptionConfiguration` 타입을 사용하여 암호화를 활성화해준다.

{% highlight yml %}
# EncryptionConfiguration
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              secret: <base64-encoded-32-byte-key>
{% endhighlight %}

위처럼 aes 방식의 암호화를 시켜 불러올 수 있다. 이런 `EncryptionConfiguration` 은 작성만 하면 되는게 아니라 다음 `kube-apiserver` 시작 옵션으로 적용시켜줘야 한다.

{% highlight bash %}
kube-apiserver --encryption-provider-config=<encription-config>.yaml
{% endhighlight %}

**방법2: 외부 Secret 관리 솔루션 사용**

- **Sealed Secrets**: GitOps 워크플로우에 적합하며 암호화된 Secret 을 Git에 안전하게 저장한다
- **External Secrets** Operator: AWS Secrets Manager, HashiCorp Vault 등과 연동한다.
- **HashiCorp Vault**: 동적 Secret 생성, 자동 로테이션, 세밀한 접근 제어

**방법3: RBAC 엄격하게 설정**

Role 구성 요소를 통해 값의 접근을 제어할 수 있다.

{% highlight yml %}
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    resourceNames: ["db-secret"]  # 특정 Secret만 접근
    verbs: ["get"]
{% endhighlight %}


### Volume

쿠버네티스의 Pod 와 컨테이너는 기본적으로 휘발성 스토리지를 사용하는 것을 알고 있을 것이다. 이를 휘발되지 않도록 하는게 Volume 이며 이를 사용하면:

- 데이터 영속화(Persistence) 가 가능
- 여러 컨테이너의 공유 스토리지 사용 가능
- 외부 스토리지 연결 가능

와 같은 기능으로 해결할 수 있다.

> 컨테이너의 파일시스템은 컨테이너 이미지에서 시작되는데, 컨테이너 내부에서 파일을 생성하거나 수정하면, 그 변경사항은 컨테이너 레이어에만 기록되며, 컨테이너가 삭제되면 당연히 레이어도 함께 사라지게 된다.

#### Ephemeral Volume 임시 볼륨

Pod 의 생명주기와 같이 움직이며 종류로는 다음이 있다:

- EmptyDir: 빈 디렉토리로 시작, Pod 내 컨테이너 간 임시 파일 공유용이다.
- ConfigMap: 설정 파일을 Volume 으로 마운트 할 때, Emphemeral Volume 으로 마운트
- Secret: 민감 정보를 tmpfs 라는 메모리에 저장

위는 전부 `Emphemeral Volume` 이다.

{% highlight yml %}
volumes:
  - name: cache-volume
    emptyDir: {}  # 임시 캐시 디렉토리
{% endhighlight %}

#### Persistent Volume 영속성 볼륨

Pod 와 독립적으로 존재하며 Pod 가 삭제되어도 데이터는 유지가 된다.

**PersistentVolume 만들기**
{% highlight yml %}
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 1Gi                    # 이 창고의 총 용량
  accessModes:
    - ReadWriteOnce                 # 한 번에 한 노드만 읽기/쓰기 가능
  hostPath:
    path: /tmp/data                 # 노드의 실제 디렉토리
  persistentVolumeReclaimPolicy: Retain  # PVC 삭제 후 데이터 처리 방식
{% endhighlight %}

- `accessModes`
    - `ReadWriteOnce`: 한 노드에서 읽기/쓰기 가능
    - `ReadOnlyMany`: 여러 노드에서 읽기만 가능
    - `ReadWriteMany`: 여러 노드에서 읽기/쓰기 가능

> 노드와 Pod 는 다른 개념이다. 노드는 여러 Pod 가 있을 수 있다 -> 동시 마운트 가능  
> 다른 노드의 Pod -> 동시 마운트 불가

- `hostPath`: `/tmp/data`
    - 쿠버 네티스 **노드(워커 노드)**의 실제 디렉토리를 말하며, 이 디렉토리를 PV 로 등록한다는 의미이다.

> 주의 사항은 HostPath 는 로컬 노드(오로지 하나)의 디렉토리를 항상 사용한다. 하지만 멀티 노드 환경에서는 Pod 가 Node A 에 스케줄링을 하려면 Node A의 /tmp/data 를 사용하도록 지정해야 하며, Pod 가 재시작되어 Node B 로 이동할 수 도 있어 이때는 Node B 의 /tmp/data 를 사용하게 된다. 따라서 이런 경우는 테스트/개발 환경에서만 이를 사용하는게 권장된다.

- `persistentVolumeReclaimPolicy`: PVC 가 삭제된 후 PV 의 데이터를 어떻게 처리할지
    - `Retain`: 데이터 보존, 수동 정리 필요
    - `Delete`: PV 와 실제 스토리지 자동 삭제

이제 생성되었는지 확인해보자.

{% highlight bash %}
kubectl apply -f pv-hostpath.yaml

kubectl get pv
{% endhighlight %}

Status 컬럼은 아무도 안사용하고 있는지 여부를 말해준다.

#### Persistent Volume Claim 생성

{% highlight yml %}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce         # PV와 일치해야 함
  resources:
    requests:
      storage: 500Mi        # 1Gi PV 중 500Mi만 요청
{% endhighlight %}

**PVC의 바인딩 로직**

Kubernetes가 자동으로 **적합한 PV를 찾아서 연결** 한다:

**과정**
1. `accessModes` 가 일치하는가?
2. PV 의 용량이 요청량보다 크거나 같은가?
3. `storageClassName` 이 일치하는가? (지정 안 했으면 무시)

조건 만족하는 PV 중 가장 작은 것을 선택하게 된다.

#### Deployment 에서 PVC 사용하기

{% highlight yml %}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: volume-demo-deploy
spec:
  replicas: 1
  selector:
    matchLabels:
      app: volume-demo
  template:
    metadata:
      labels:
        app: volume-demo
    spec:
      containers:
      - name: nginx-container
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:              # 컨테이너 관점
        - name: my-data-volume     # volumes에서 정의한 이름
          mountPath: /data         # 컨테이너 내부 경로
      volumes:                     # Pod 관점
      - name: my-data-volume
        persistentVolumeClaim:
          claimName: my-pvc        # PVC 이름 지정
{% endhighlight %}

**데이터 흐름**

- **호스트 노드**: `/tmp/data`
- **PV (my-pv)**: Kubernetes 추상화 레이어
- **PVC (my-pvc)**: 사용자 요청
- **Pod Volume (my-data-volume)**: Pod 내부 Volume
- **컨테이너**: `/data` 경로로 마운트

> PVC 는 요청, PV 는 실제 저장소

이제 제대로 동작되고 있는지 다음을 테스트한다

{% highlight bash %}
kubectl exec -it <pod-name> /bin/sh -- sh -c "echo 'Hello, world!' > <mount-path>/memo.txt"
kubectl delete pod/<pod-name>
kubectl get pods
kubectl exec -it <pod-name> /bin/sh -- cat <mount-path>/memo.txt
{% endhighlight %}

제대로 pv 가 올라가고 정상적으로 마운팅됐다면 `memo.txt` 는 삭제되어도 계속 살아있어야 할 것이다.

##### Node

물리적 / 논리적으로 분리된 컴퓨팅 자원을 노드라고 하는데 `kubectl get nodes` 를 통해 노드를 볼 수 있다.