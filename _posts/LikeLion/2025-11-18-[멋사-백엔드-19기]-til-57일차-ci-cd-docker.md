---
layout: post
title:  "[멋사 백엔드 19기] TIL 57일차 CI CD Docker"
date:   2025-11-18 13:08:01 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL CI CD
---

<!--more-->

## 📂 목차

- [Docker](#docker)
- [컨테이너 vs 이미지](#컨테이너-vs-이미지)
- [Docker 아키텍처 개념](#docker-아키텍처-개념)
- [Docker 설치 및 기본 명령어](#docker-설치-및-기본-명령어)
- [Dockerfile 기본 작성법](#dockerfile-기본-작성법)
- [이미지 빌드 과정 정리](#이미지-빌드-과정-정리)

---

## 📚 본문

### Docker

도커는 어플리케이션을 컨테이너라는 단위로 패키징을 하고 실행할 수 있게 만들어주는 플랫폼이라고 보면 된다. 내 컴퓨터에서만 동작하도록 테스트하는게 아니라 서버에서도 동작이 가능하도록 테스팅을 돕고 여러 컨테이너 간의 소통을 통해 외부 API 호출 테스트도 할 수 있게 된다.

### 컨테이너 vs 이미지

- `Image`: 실행 환경 + 라이브러리 + 어플리케이션이 모두 포함된 설계도(템플릿), 변경되지 않는 읽기 전용 스냅샷과도 같다

- `Container`: 이미지를 실제로 실행한 실행 인스턴스, 가벼운 가상 머신처럼 보이지만 훨씬 빠르고 효율적(OS 를 통째로 띄우지 않고 부분적으로만 가져다 씀) 

### Docker 아키텍처 개념

Docker 가 어떻게 컨테이너를 만들고 실행하는지를 구성하는 내부구조를 말하며, 크게 3가지로 구성된다.

- **Docker Daemon(dockerd)**: 서버 역할을 하며, 컨테이너, 이미지, 네트워크, 볼륨 등을 실제로 생성/삭제/관리한다.
    - 항상 백그라운드에서 실행됨
    - 모든 도커 명령어는 결국 Daemon 에게 전달됨
    - 따라서 CLI 가 실행하는게 아니라 Daemon 이 실행

- **Docker CLI(docker 명령어)**: 사용자가 Docker 를 조작하기 위해 만든 클라이언트 개념
    - 터미널에서 입력하는 `docker run`, `docker ps` 등등이 여기에 해당됨
    - 명령어를 빠르게 daemon 에게 전달하고 결과를 사용자에게 보여준다.

### Docker 설치 및 기본 명령어

#### OS 별 설치 방법

##### MacOS

1. Docker Desktop 다운
2. `.dmg` 파일 실행
3. 설치 후 `docker --version` 으로 정상 설치 확인

##### Windows

1. 공식 사이트에서 Docker Desktop 다운로드
2. 설치 중 WSL2 옵션 활성화 (Windows Home 사용자 필수)
3. 설치 완료 후 재부팅
4. 터미널에서 `docker --version` 정상 설치 확인

#### 기본 명령어 정리

항상 명령어 부분은 많이 사용해야 익숙해진다. 다 외울 필요가 없고 체화하는 형태로 습득한다.

##### Image 관리

- `docker images`: 로컬 이미지 목록 조회
- `docker pull <image_name>:<tag>`: 이미지 다운로드
- `docker rmi <image_hash | image_name>`: 이미지 삭제

> 옵션은 그냥 -`-help` 쳐서 직접 보고 쓰는게 낫다. 그 많은 옵션은 안외워진다.  
모든 명령어는 명령어 그대로 해석하면 된다.

##### Container 관리

- `docker ps`: 실행 중인 컨테이너 목록
- `docker ps -a`
- `docker run <image_name | image_id>`
- `docker start <container_name | container_hash>`
- `docker stop <container_name | container_hash>`
- `docker rm <container_name | container_hash>`
- `docker pause <container_name | container_hash>`
- `docker unpause <container_name | container_hash>`
- `docker restart <container_name | container_hash>`

##### 컨테이너 내부 접속 & 로그 확인

- `docker exec -it <container_name> /bin/bash`: 컨테이너 안으로 들어가기
- `docker logs <container_name>`: 컨테이너 로그 확인
- `docker logs -f <container_name>`: 컨테이너 로그 실시간 확인

##### 이미지 빌드 & 태깅

- `docker build -t <image_name>:<tag> <Dockerfile 경로>`: Dockerfile 로 이미지 생성
- `docker tag <image_id> <repository>:<tag>`: 이미지 태그 변경
- `docker push <repository>:<tag>`: 이미지 Docker Hub 에 업로드

##### Docker Network

- `docker network ls`: 네트워크 목록
- `docker network inspect <network_name>`: 네트워크 상세 정보
- `--network <network_name>`: 컨테이너를 특정 네트워크에 연결

##### 볼륨 관리

- `docker volume ls`: 볼륨 목록
- `docker volume create <volume_name>`: 볼륨 생성
- `docker run -v <volume_name>:<container_path>`: 컨테이너에 볼륨 마운트

##### 시스템 관리

- `docker system df`: Docker 리소스 사용량 확인
- `docker system prune`: 불필요 이미지, 컨테이너, 네트워크 정리

##### Docker 권한 부여

- `sudo usermod -aG docker $USER`

### Dockerfile 기본 작성법

`Dockerfile` 은 텍스트 파일로, 이미지 빌드를 위한 명령어를 순차적으로 작성하는 정의서이다.

보통 실행 환경, 설치 패키지, 어플리케이션 코드, 실행 명령까지 이미지에 포함될 내용을 정의한다.

#### Dockerfile 명령어

- `FROM <image>`: 베이스 이미지를 지정하며, `Dockerfile` 은 항상 이 명령부터 시작한다.

- `WORKDIR <path>`: 작업 디렉터리를 설정하며, 이후 명령어들이 전부 이를 기준으로 실행된다. 즉 `pwd` 가 해당 경로로 되게 된다.

- `COPY <host_path> <container_path>`: 파일/디렉터리를 컨테이너로 복사

- `RUN <shell_script>`: 컨테이너 이미지 빌드 시 실행될 명령어

- `ENV <key>=<value>`: 환경 변수 설정

- `EXPOSE <port>`: 컨테이너 외부에 노출할 포트(문서적 의미만을 지니며 실제로 기능하진 않음, 메타데이터)

- `ENTRYPOINT ["java", "-jar", "app.jar"]`: 컨테이너의 주 실행 프로그램을 지정, 일부 인자만 덮어쓰기가 가능, ENTRYPOINT 프로그램 실행 시에 `CMD` 가 인자로 전달

{% highlight dockerfile %}
FROM ubuntu
CMD ["echo", "Hello World"]

FROM ubuntu
ENTRYPOINT ["echo"]
CMD ["Hello World"]
{% endhighlight %}

- `CMD ["execute", "args"]`: 컨테이너가 시작될 때 기본으로 실행할 명령이며, 딱 한 번만 실행되며 여러 CMD 명령을 넣을 시에 마지막 명령어만 실행된다.

### 이미지 빌드 과정 정리

base image 는 docker hub 에서 참고해서 넣자 보통 alpine, slim 등등이 붙은걸 넣는게 좋다.

{% highlight java %}
FROM openjdk:17

WORKDIR /app

COPY build/libs/app.jar .

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
{% endhighlight %}

이제 이를 다 작성했으면 명령창에서 다음을 입력한다.

{% highlight bash %}
docker build -t my-app:1.0 .
{% endhighlight %}

`dockerfile` 을 잘못 작성해서 build 를 다시 시작하더라도 변하지 않는 레이어에 대해서는 캐시로 사용하고 있기 때문에 그 이후 변경된 layer(명령어) 에 대해서만 재시동을 하기 때문에 빌드 속도가 향상된다. 따라서 레이어는 보통 맨 위는 하위 명령어에 대해 많이 영향을 주는 종속되는 명령을 순서대로 넣는게 좋다.