---
layout: post
title:  "[멋사 백엔드 19기] TIL 33일차 Java Network Programming - UDP"
date:   2025-10-02 10:04:15 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Network
---

<!--more-->

## 📂 목차
- [UDP](#udp)
	- [예외처리](#예외처리)
	- [실습 코드들](#실습-코드들)
		- [UDP Echo](#udp-echo)
		- [UDP Client](#udp-client)
		- [UDP Broadcast](#udp-broadcast)
- [심화](#심화)
	- [Transport Layer](#transport-layer)
		- [TCP](#tcp)
		- [UDP](#udp-1)
- [Java 파일 경로 다루기](#java-파일-경로-다루기)
	- [Path, Paths](#path-paths)
	- [Path 를 File 로 변환하기](#path-를-file-로-변환하기)
		- [파일 쓰기](#파일-쓰기)
		- [경로 결합 및 해석](#경로-결합-및-해석)
	- [subPath()](#subpath)
	- [URI](#uri)
		- [Round-trip Guarantee](#round-trip-guarantee)
	- [WatchServer API](#watchserver-api)
		- [예외 상황](#예외-상황)
		- [WatchKey](#watchkey)

---

## 📚 본문

### UDP 

**User Datagram Protocol** 의 약자로, 전송 계층 프로토콜 중의 하나이다. 여기서 TCP 는 데이터 단위가 패킷이었지만, UDP 만이 따로 보내는 데이터 단위를 Datagram 이라고 부른다.

특징으로는
- `Connection` 이 없이(**3-Way Handshaking** 없이) 전송한다
- 속도가 빠름
- 신뢰성이 낮음
- 데이터그램이 가볍다
    - 헤더 크가기 8 바이트(TCP 는 최소 20 바이트)
- 1:n 의 브로드 캐스팅이 가능하다

#### 예외처리

- `IOException`: 네트워크 연결 실패, 데이터 전송 중 오류 등 대부분의 입출력 문제
- `UnknownHostException`: 호스트 이름(도메인)을 IP 주소로 변환할 수 없을 때 (DNS 조회 실패)
- `SocketTimeoutException`: 지정된 시간 내에 연결 또는 데이터 읽기가 완료되지 않았을 때
- `ConnectException`: 서버가 해당 포트에서 대기하고 있지 않거나 연결을 거부했을 때

#### 실습 코드들

##### UDP Echo

{% highlight java %}
import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UDPEchoServer {
	private static final int PORT = 7777;
	private static final int BUFFER_SIZE = 8192;

	public static void main(String[] args) {
		try (var socket = new DatagramSocket(PORT)) {
			System.out.println("UDP Echo Server Starting...");
			var buffer = new byte[BUFFER_SIZE];

			while (true) {
				// 클라이언트가 보낸 메시지를 받음
				var packet = new DatagramPacket(buffer, buffer.length);
				socket.receive(packet);

				var message = new String(packet.getData(), 0, packet.getLength());
				System.out.println("받은 메시지 > " + message);

				// 클라이언트에게 받은 메시지를 다시 보냄
				var responseMessage = "Echo > " + message;
				byte[] responseBuffer = responseMessage.getBytes();

				var datagramPacket = new DatagramPacket(
						responseBuffer,
						responseMessage.length(),
						packet.getAddress(),
						packet.getPort());

				socket.send(datagramPacket);
				System.out.println("전송 완료: " + responseMessage);
			}

		} catch (IOException e) {
			e.printStackTrace();
		}

	}
}
{% endhighlight %}

##### UDP Client

{% highlight java %}
public class UDPEchoClient {
	private static final String SERVER_HOST = "localhost";
	private static final int SERVER_PORT = 7777;
	private static final int BUFFER_SIZE = 8192;

	public static void main(String[] args) {
		try (var socket = new DatagramSocket();
		     var keyboard = new Scanner(System.in)) {

			var address = InetAddress.getByName(SERVER_HOST);
			var buffer = new byte[BUFFER_SIZE];
			System.out.println("서버에게 보낼 메시지를 입력해주세요.");

			while (true) {
				var message = keyboard.nextLine();

				if ("quit".equalsIgnoreCase(message)) break;

				var sendData = message.getBytes();
				var sendPacket = new DatagramPacket(sendData, sendData.length, address, SERVER_PORT);

				socket.send(sendPacket);

				var datagramPacket = new DatagramPacket(buffer, buffer.length);
				socket.receive(datagramPacket);

				new String(datagramPacket.getData(), 0, datagramPacket.getLength());
			}

		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
{% endhighlight %}

##### UDP Broadcast

{% highlight java %}
public class UDPBroadcast {
    public static void main(String[] args) {
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setBroadcast(true);

            String message = "브로드캐스트 메시지입니다!";
            byte[] buffer = message.getBytes();

            // 브로드캐스트 주소 (255.255.255.255)
            InetAddress broadcastAddress =
                InetAddress.getByName("255.255.255.255");

            DatagramPacket packet = new DatagramPacket(
                buffer,
                buffer.length,
                broadcastAddress,
                9876
            );

            socket.send(packet);
            System.out.println("브로드캐스트 메시지 전송 완료");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
{% endhighlight %}

### 심화

Transport Layer 의 프로토콜로, OSI 7계층중 4계층에 위치한다.

![osi_model_7_layers.png]({{ site.baseurl }}/assets/img/osi_model_7_layers.png)

기본적으로 신뢰성이 있는 바이트 스트림 전송을 보장하며, IP 는 단순 패킷을 목적지까지 `최선형 전달(best-effort delivery)` 만 제공하므로 **손실, 중복, 순서 뒤바뀜** 문제가 발생하지만, TCP 는 이러한 문제를 해결하여 Application Layer 가 안정적인 통신을 수행할 수 있도록 한다.

OSI 계층의 관점에서 더 살펴보자.

#### Transport Layer

어플리케이션(5-7 계층)과 네트워크(1-3 계층) 사이의 중개자 역할을 하는 이 계층은 **프로세스 간 통신(IPC)** 를 책임진다.

단순히 컴퓨터와 컴퓨터 사이가 아니라 컴퓨터 내부의 프로세스와 상대방의 특정 프로세스를 연결하는 통로를 만든다. 이 통로를 통과하는 전송 계층의 데이터 단위는 `Segement` 이다.

**역할**
- 전송 제어: 큰 데이터를 쪼개서(segment) 보내고, 다시 조립 가능한가?
	- 파일 전송 중 "HelloWorld" 를 보내고, 세그먼트 단위가 "Hello", "World" 로 쪼개짐
	- 수신 측에서 순서가 꼬여 "WorldHello" 로 받아버리면서 데이터 무결성이 깨짐

- 오류 제어: 데이터가 중간에 손상되거나 유실되면 재전송 요구(`ACK`, `NAK`, `Checksum` 등)가 가능한가?
	- 전송 중 **bit-flip**(1이 0으로 변하는 현상)이 생겨 은행 송금 중 10,000 원이 100,000 원으로 잘못 도착
	- 문서 전송 중 "결재 승인" -> "결재 취소" 로 바뀜

- 흐름 제어: 송신 측이 수신 측의 처리 속도를 고려하여 전송량을 조잘할 수 있는가?
	- 클라이언트가 대용량 로그 파일을 초고속으로 전송해버림
	- 서버는 디스크 I/O 가 느려서 못 따라감
	- 결국 데이터 일부 손실(받을 수 있는 공간이 없으면 버려버림)

##### TCP

- **연결 지향(Connection-Oriented)**: 데이터를 전송하기 전 **3-Way Handshake** 로 연결을 성립시킨다.
- **신뢰성 보장(Reliable)**: 손실, 중복, 순서 꼬임을 모두 해결
- **흐름 제어(Flow Control)**: 수신 측의 처리 속도에 맞춰 전송 속도를 조절(Window Size)
- **혼잡 제어(Congestion Control)**: 네트워크가 붕괴되지 않도록 전송량을 자동 조절(**AIMD** 등 알고리즘)
- **스트림 기반(Stream-Oriented)**: 바이트 단위의 연속적 데이터 스트림으로 메시지 경계가 없음

**세그먼트 내부 구조**
{% highlight text %}
0       7 8     15 16    23 24     31
+--------+--------+--------+--------+
|  Source Port    | Destination Port|
+--------+--------+--------+--------+
|          Sequence Number          |
+--------+--------+--------+--------+
|      Acknowledgment Number        |
+--------+--------+--------+--------+
|Off.|Res. |Flags |      Window     |
+--------+--------+--------+--------+
|    Checksum     |  Urgent Pointer |
+--------+--------+--------+--------+
|     Options (0~40B, 존재할 경우)     |
+-----------------------------------+
|               Data ...            |
{% endhighlight %}

- **Source Port(16bit) / Destination Port(16bit)**: 어떤 어플리케이션과 통신할지를 식별
- **Sequence Number(32bit)**: 바이트 스트림 순서 식별
- **Acknowledgement Number(32bit)**: 다음에 기대하는 바이트 번호
- **Data Offset(4bit)**: 헤더 길이를 나타냄 (예: 32비트 워드)
- **Reversed(6bit)**: 확장용, 예약 필드, 미래에 쓰일 필드
- **Flags(6bit - 9bit)**: SYN, ACK, FIN, RST 등 제어 플래그(URG, PSH, ...)
- **Window Size(16bit)**: 흐름 제어
- **Checksum(16bit)**: 오류 검출을 위한 체크섬

**연결 절차**
- **3-Way Handsake**: SYN -> SYN+ACK -> ACK
- 시퀀스 번호 기반으로 세그먼트 전송
	- 손실 시 `ACK flag` 사용하여 재전송 요청
	- 윈도우 기반으로 속도 조절
- **4-Way Handsake**: FIN -> ACK -> FIN -> ACK

**사용 범위**
- 웹, 파일 전송, 이메일 등으로 신뢰성이 필요할 때 사용
- 프로그래머가 직접 재전송, 순서 보장, 흐름 제어를 구현할 필요가 없음
- HTTP(S), FTP, SMTP, SSH 등

**단점**
- 헤더 크기가 최소 20 바이트
- 느림

##### UDP

UDP 는 Handsake 가 없어, 그냥 데이터 그램(세그먼트) 을 내보내게 된다. 이때 보내는 데이터들에서는 순서 보장이 안되며, 중복을 허용하게 된다. 보낸 메시지가 그대로 하나의 데이터그램이 되며 나가게 된다. TCP 와는 달리 **전송 제어, 오류 제어, 흐름 제어**가 없어서 데이터 무결성은 보장할 수 없다.

{% highlight text %}
[ Source Port | Destination Port | Length | Checksum ]
{% endhighlight %}

> 단순 포트, 길이, 체크섬만 있고, 순서, 재전송, 흐름 제어가 없다.

**연결 절차**
- 연결 과정은 없고,
- 그냥 `sendTo()`, `recvFrom()` 으로만 받기만 한다.

**사용 범위**
- 데이터 그램이 TCP 의 세그먼트 보다는 헤더가 작아서 빠르며
- 실시간 통신에 유리하다(손실 몇 개는 무시해도 무관)
- DNS, VoIP, 온라인 게임, 영상 스트리밍

**장점**
- 빠름

### Java 파일 경로 다루기

Java 7 에서 부터는 `java.nio.file` 패키지를 통해 파일 경로를 다룰 수 있다.

#### Path, Paths

{% highlight java %}
import java.nio.file.Path;
import java.nio.file.Paths;
{% endhighlight %}

`import` 를 통해 `Path` 를 가져올 수 있지만, `Path` 는 인터페이스만 제공을 하기 때문에 실제 구현체는 `Paths` 라는 유틸 클래스로 생성해줄 수 있다.

{% highlight java %}
Path relativePath = Paths.get("file/test.txt");
Path absolutePath = Paths.get("(경로 입력)/Desktop/network/file/test.txt");

System.out.println("상대경로 : " + relativePath);
System.out.println("절대경로 : " + absolutePath);
{% endhighlight %}

또한 경로는 존재하지 않는 경로에 대해서도 경로를 정할 수 있다. 무슨 말이냐면 `foo` 파일이 없음에도 불구하고, 해당 경로를 생성시킬 수 있다.

{% highlight java %}
Path path = Paths.get("file/foo");

System.out.println(path);
{% endhighlight %}

아무 오류 없이 정상적으로 출력됨을 볼 수 있다. 이를 `Path` 가 가진 메서드들을 통해 정보를 출력해볼 수 있다.

{% highlight java %}
Path relativePath = Paths.get("file/test.txt");
Path absolutePath = Paths.get("~/Desktop/network/file/test.txt");
Path absentPath = Paths.get("hihi");

Path[] paths = new Path[] {relativePath, absolutePath, absentPath};

for (Path path : paths) {
	try {
		System.out.println("파일명 : " + path.getFileName());
		System.out.println("부모 디렉터리 : " + path.getParent());
		System.out.println("절대 경로 : " + path.toAbsolutePath());
		System.out.println("존재 여부 : " + Files.exists(path));
		System.out.println("파일 크기 : " + Files.size(path) + " bytes");
	} catch (Exception e) {
		System.out.println(e);
	} finally {
		System.out.println();
	}
}
{% endhighlight %}

해당 파일의 존재 여부는 `Files` 유틸을 통해 존재하는지, size 가 얼마인지 등을 알 수 있고, 존재하지 않는 파일들에 대해서의 접근해야지만 얻을 수 있는 정보(`Path.toFile()`, `Files.size()` 등등) 에 대해 `NoSuchFileException` 이 뜸을 볼 수 있다.

**출력**

{% highlight text%}
파일명 : test.txt
부모 디렉터리 : file
절대 경로 : /Users/(username)/Desktop/network/file/test.txt
존재 여부 : true
파일 크기 : 91 bytes

파일명 : test.txt
부모 디렉터리 : ~/Desktop/network/file
절대 경로 : /Users/(username)/Desktop/network/~/Desktop/network/file/test.txt
존재 여부 : false
java.nio.file.NoSuchFileException: ~/Desktop/network/file/test.txt

파일명 : hihi
부모 디렉터리 : null
절대 경로 : /Users/(username)/Desktop/network/hihi
존재 여부 : false
java.nio.file.NoSuchFileException: hihi
{% endhighlight %}

#### Path 를 File 로 변환하기

이제 해당 `Path` 를 파일로 변환시키는 방법을 살펴보자. `Path` 인터페이스의 `toFile` 메서드를 통해 파일을 얻을 수 있다.

{% highlight java %}
import java.io.File;

...

File file = relativePath.toFile();
{% endhighlight %}

##### 파일 쓰기

파일을 생성할 때는 무조건 운영체제의 권한이 필요로 하게 됨을 알고 있자.

{% highlight java %}
Path path = Paths.get("data/output.txt");

// 디렉터리가 없다면 생성
Files.createDirectories(path.getParent());

// 파일에 문자열 쓰기
Files.write(path,
			List.of("Hello", "World"),
			StandardOpenOption.CREATE,
			StandardOpenOption.TRUNCATE_EXISTING);

System.out.println("파일 저장 완료: " + path.toAbsolutePath());
{% endhighlight %}

- `Files.createDirectories`: 해당 부모 경로가 없다면 쭉 생성해준다.
- `Files.write`: 파일에 내용을 쓴다.
- `StandardOpenOption`: `OpenOption` 인터페이스를 구현하는 열거형 클래스이다. 옵션들은 밑에 정리해두었다.

| 옵션 | 설명 | 예시 사용 상황 |
|------|------|----------------|
| **READ** | 파일을 읽기 전용으로 연다. | `Files.newInputStream(path, READ)` |
| **WRITE** | 파일을 쓰기 전용으로 연다. | `Files.newOutputStream(path, WRITE)` |
| **APPEND** | 파일의 끝에 데이터를 덧붙인다. (기존 내용 유지) | 로그 파일 추가 기록 |
| **TRUNCATE_EXISTING** | 기존 파일이 존재하면 내용을 모두 비운 후 새로 쓴다. | 파일 새로 덮어쓰기 |
| **CREATE** | 파일이 없으면 새로 만든다. | 기본적인 파일 생성 시 |
| **CREATE_NEW** | 파일이 이미 존재하면 예외 발생. | 중복 파일 방지 시 |
| **DELETE_ON_CLOSE** | 스트림을 닫을 때 파일을 자동 삭제. | 임시 파일 처리 |
| **SPARSE** | 희소 파일(sparse file)로 생성. (대용량 비어있는 공간 절약) | 대형 파일 테스트 |
| **SYNC** | 모든 데이터와 메타데이터를 디스크에 즉시 기록 (성능 ↓, 안정성 ↑) | DB나 로그의 안정적 쓰기 |
| **DSYNC** | 데이터만 디스크에 즉시 기록 (메타데이터는 나중에) | 빠른 데이터 안정화 |

> `Files` 와 `Paths` 의 메서드들은 다른 포스트에서 심도있게 다룬다.

##### 경로 결합 및 해석

`Path` 의 `resolve()` 를 통해 경로를 얽힘 없이 자동으로 합쳐주고, `normalize()` 를 통해 현재 경로에서 불필요한 즉, 중복된 이름 요소 혹은, `.`, `..` 등을 제거한 경로를 만들 수 있다.

{% highlight java %}
import java.nio.file.Path;
import java.nio.file.Paths;

public class PathJoin {
    public static void main(String[] args) {
		Path base = Paths.get("/Users/user1/Desktop");
		Path child = base.resolve("network/file.txt");  // 결합
		System.out.println("결합된 경로: " + child);

		Path p = Paths.get("/Users/user1/Desktop/network/../file.txt");
		System.out.println("정규화 전: " + p);
		System.out.println("정규화 후: " + p.normalize());
    }
}
{% endhighlight %}


#### subPath()

API: `Path subpath(int beginIndex, int endIndex);`

의 형태이고, 0부터 count 까지의 범위이다. endIndex 는 exclusive 하기 때문에 제외된다.

> /Users/user1/Desktop/hello/example/test.txt  
> /: 0  
> /Users/: 1  
> /Users/user1/: 2

{% highlight java %}
Path base = Paths.get("/Users/user1/Desktop");
System.out.println("서브 경로: " + base.subpath(2, 3));

// 서브 경로: Desktop
{% endhighlight %}

#### URI

`URI` 는 `Uniform Resource Identifier` 의 약자로, 자원에 대해 통합 자원 식별자를 매길 수 있게 한다. 이름 그대로 식별자 용도이다. 보통 다음과 같은 형태를 가지게 된다.

> file:///Users/user1/Desktop/file.txt  
> scheme://example.com:8080/path?query#fragment

여기서 `file://` 은 로컬 파일 시스템 스킴이고 그 뒤에는 경로가 따라온다.

**Scheme**
- `file:///`: 로컬 파일 시스템
- `http://`: HTTP 프로토콜
- `ftp://`: FTP 프로토콜
- `jar:file:///`: JAR 파일 내부

이러한 스킴을 정하는 것은 **파일 시스템 제공자(FileSystemProvider)** 에 의해 관리되고, 그 제공자가 사용하는 스킴으로 URI 를 만들게 된다.

기본적으로 프로바이더는 OS 의 파일 시스템을 의미하기 때문에 `Path.toUri()` 의 경우에는 다음과 같은 특징을 가지게 된다:

- **absolute path** 형태로 변환
- `query(?)`, `fragment(#)` 부분 없음
- authority(`//server` 같은 부분)는 구현에 따라 다름
- 파일이 디렉터리라면 `/` 로 끝남

> shceme: 프로토콜  
> fragment: 문서 내의 특정 위치  
> authority: 서버 주소와 포트

##### Round-trip Guarantee

`Path.of(p.toUri()).equals(p.toAbsolutePath())` 가 보장된다는 의미이다. 즉, Path 를 URI 로 바꿨다가 다시 URI 에서 Path 로 바꾸어도 같은 절대 경로가 되어야 한다는 의미이다.

> 단, 같은 JVM 안에서만 이 보장이 유효함

#### WatchServer API

`java.nio.file.Path` 인터페이스 안에는 디렉터리 변경 감시 기능(파일 변경 이벤트 감시) 관련 메서드가 존재한다.

자바의 `WatchService API` 와 함께 동작하며, 파일 시스템에서 파일 생성, 수정, 삭제 이벤트를 감시할 수 있도록 한다.

{% highlight java %}
WatchKey register(WatchService watcher,
				  WatchEvent.Kind<?>[] events,
				  WatchEvent.Modifier... modifiers) throwsIOException;
{% endhighlight %}

위가 기본 API 이고, `@Overriding` 이 되어 있고, `Watchable` 인터페이스에도 있게 된다(아마 인터페이스를 `@Override` 한 이유는 굳이 `Watchable` 까지 들어가서 명세서를 보도록 안하기 위함이 아닐까 싶다 배울점).

- `Path`: 감시할 디렉터리의 경로
- `WatchService`: 이벤트를 모아주는 이벤트 통지 시스템
- `WatchKey`: 등록된 디렉터리 1곳을 대표하는 키 (이를 토대로 이벤트를 꺼냄)
- `WatchEvent.Kind`: 어떤 종류의 이벤트를 감시할지를 지정
	- `ENTRY_CREATE`: 새 파일이 생성되거나 디렉터리에 들어옴
	- `ENTRY_DELETE`: 파일이 삭제되거나 디렉터리에서 나감
	- `ENTRY_MODIFY`: 파일이 수정됨 (내용/속성 변경)

- `WatchEvent.Modifier`: 이 디렉터리를 감시하되, 어떤 특별한 조건이나 방식으로 감시할 지를 정의
	- 이 구체적인 구현체 인자는 OS 또는 파일시스템 제공자(provider)가 제공하므로 해당 OS 에 맞는 `Modifier` 를 가져와야 한다.

> `WatchEven.Modifier` 는 deprecated

**Mac OS / Linux 예시**
{% highlight java %}
import com.sun.nio.file.SensitivityWatchEventModifier;

dir.register(watcher,
             new WatchEvent.Kind<?>[]{ENTRY_CREATE, ENTRY_MODIFY, ENTRY_DELETE},
             SensitivityWatchEventModifier.HIGH);
{% endhighlight %}

- `LOW`: 10초에 한 번 정도 검사 (부하 적음)
- `MEDIUM`: 2초 정도 간격으로 검사
- `HIGH`: 거의 실시간 감지 (CPU 부하 큼)

> 여러개의 `Modifier` 옵션을 넣을 수 있게 가변 인자로 선언되어 있지만 대부분은 한 개만 쓴다고 하며, 최근 들어서 JDK 21 은 해당 Modifier 옵션을 지정하지 않는 것으로 두고, OS 가 알아서 주기적으로 검사하도록 하게 한다. 따라서 이 인자는 비워도 된다.

##### 예외 상황

- `UnsupportedOperationException`: 지원되지 않는 Modifier 전달
- `ClosedWatchServiceException`
- `NotDirectoryException`
- `IOException`
- `SecurityException`

##### WatchKey

이제 실제 활용을 해보자.

{% highlight java %}
try (WatchService watcher = FileSystems.getDefault().newWatchService()) {

	Path dir = Paths.get("/Users/user1/Desktop/network/file");

	if (!Files.isDirectory(dir))
		throw new IllegalArgumentException("지정한 경로가 디렉터리가 아닙니다: " + dir);

	dir.register(watcher,
					StandardWatchEventKinds.ENTRY_CREATE,
					StandardWatchEventKinds.ENTRY_DELETE,
					StandardWatchEventKinds.ENTRY_MODIFY);

	while (true) {
		try {
			WatchKey key = watcher.poll(10, TimeUnit.SECONDS);
			if (key == null) break;

			for (WatchEvent<?> event : key.pollEvents())
				System.out.println("이벤트: " + event.kind() + " | 파일: " + event.context());

			if (!key.reset()) break;
		} catch (InterruptedException e) {
			Thread.currentThread().interrupt();
			System.out.println("감시 스레드가 인터럽트 되었습니다.");
			break;
		}
	}
}
{% endhighlight %}

1. OS 의 파일시스템이 제공하는 새로운 `WatchService` 를 가져온다.
2. 감시할 디렉토리를 `Path` 로 설정하고, 디렉터리인지 확인해준다.
3. `Path.register` 을 통해 감시 서비스에 등록해준다.
	- `StandardWatchEventKinds` 의 `ENTRY_CREATE`, `ENTRY_MODIFY`, `ENTRY_DELETE` 전부 등록해준다.
	- 즉, 해당 종류들을 감시하는 것을 등록한다.

4. `poll()` 을 통해 로그를 들고온다.
	- `watcher.poll(10, TimeUnit.SECONDS);` 동기로 가져오기 때문에 10초까지 이벤트가 없다면 null 을 반환하게 된다.
	- 무한 블로킹을 하지 않고 일정 시간 기다린 후 반환하는 **[제한 블로킹](#동기-vs-비동기)** 구조를 사용
	- 내부적으로는 **[폴링 스레드](#)**를 통해 따로 처리하는 스레드가 있음(개발자는 이를 볼 수 없음)

5. 가져온 key 가 null 이면
	- 이벤트가 진행된게 없기 때문에 수행 종료

6. 이벤트가 발생하고 `pollEvents()`로 처리하면, 그 순간 `WatchKey`는 일시적으로 비활성 상태가 된다.
	- 이때 이벤트 가 발생된 자원은 `event.context()` 를 통해 확인하고
	- 이벤트 종류를 `event.kind()` 로 확인한다.

7. 마지막으로 `reset()` 을 통해 다시 이벤트를 감시할 수 있도록 한다.
	- 만약 `false` 를 리턴했다면, 디렉터리가 삭제되었거나 `WatchService` 가 닫힌 경우이기에 빠져나간다.

> 사실 상 만약 Interrupt 를 try 내부에서 처리하고 싶다면 다음 구문을 넣어야 한다: `if (Thread.currentThread().isInterrupted()) break;` 기본적으로 비동기 식이기 때문에 처리가 늦어진 이유가 interrupt 발생 때문이라면(외부 다른 스레드에서 현재 스레드의 종료, 시스템 신호나 JVM 종료 요청 때문에 종료 의 경우 혹은 예외 발생) `break` 를 하게 되는 코드인데, 이는 이미 `catch` 로 `InterruptedException` 을 처리할 수 있도록 하게 하였으니 필요 없는 옛구문이다.

---

## ✒️ 용어

###### 동기 vs 비동기

- **완전 비동기**: 메서드 호출 즉시 반환하고, 결과를 나중에 `Callback` 이나 `Future` 로 처리
- **완전 동기**: 메서드 호출 시 결과가 나올 때까지 블로킹
- **제한 블로킹**: 무한 블로킹하지 않고 일정 시간 기다린 후에 반환하는 구조

위에서는 `take()` 보다는 `poll()` 방식을 사용하였고, timeout 까지 지정하여 제한 블로킹 형태로 되었다.

- `take()`: 비동기는 아님, 호출 스레드 자체를 블로킹
- `poll()`: 즉시 반환(non-blocking) 비동기임
- `poll(int, TimeUnit)`: 지정 시간 동안 대기 후 반환, 제한 블로킹이며 완전 비동기는 아님

###### Polling Thread

폴링 뜻은 주기적으로 상태를 확인하는 방식이다. 따라서 CPU 자원을 계속 소모하면서 이벤트가 없을 때도 반복적으로 확인하는 동작을 한다(OS 네이티브 이벤트를 쓰는 경우는 CPU 소모가 거의 없음).

자바에서는 `WatchService` 에서 OS 가 지원하는 이벤트 감지 기능을 활용할 수도 있고, 일부 플랫폼에서는 자체 폴링 스레드를 사용하기도 한다. 어쨋든 간에 폴링 스레드는 `WatchService` 내부에서 주기적으로 실행되는 흐름이다.

여기 나오는 예시는 다음 동작을 한다.
1. 등록된 디렉터리를 주기적으로 체크
2. 변경 사항이 있으면 이벤트 큐에 넣음
3. `poll()` 이나 `take()` 호출 스레드는 이 큐에서 이벤트를 가져오게 됨
