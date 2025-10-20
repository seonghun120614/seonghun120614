---
layout: post
title:  "[멋사 백엔드 19기] TIL 32일차 Java Network Programming - TCP"
date:   2025-10-01 10:55:35 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL Java Network
---

<!--more-->

## 📂 목차
- [IP Address](#ip-address)
    - [Subnet Mask](#subnet-mask)
    - [사설 IP 와 공인 IP](#사설-ip-와-공인-ip)
    - [포트 번호](#포트-번호)
- [TCP 통신](#tcp-통신)
- [Java 네트워크 프로그래밍](#java-네트워크-프로그래밍)
    - [InetAddress 클래스](#inetaddress-클래스)
    - [Socket Programming](#socket-programming)
        - [TCP 소켓](#tcp-소켓)
        - [UDP 소켓](#udp-소켓)
        - [TCP Echo 서버 구현](#tcp-echo-서버-구현)
        - [Multi-Threaded Server](#multi-threaded-server)
        - [TCP 채팅 서버](#tcp-채팅-서버)

---

## 📚 본문

### IP Address

IP 주소(Internet Protocol Address)는 인터넷에 연결된 모든 장치에 할당된 고유한 주소 이다.

- IPv4: 127.0.0.1 -> 8 비트씩 4개
- IPv6: 2404:6800:400a:080a:0000:0000:0000:2004 -> 16 비트씩 8개

의 형태를 가진다. 여기서 보통 8비트 단위를 **Octet** 이라고 부르고 IPv6 에서는 :를 기준으로 각각을 필드라고 부른다.

#### Subnet Mask

서브넷 마스크는 네트워크 부분과 호스트 부분으로 나누는 기준을 나타내는 비트 패턴이며, 쉽게 말하면 주소의 어떤 부분이 네트워크인지, 어떤 부분이 장치인지를 나타내는 마스킹이다.

- IPv4 예시
    - IP 주소 192.168.1.10: 11000000.10101000.00000001.00001010
    - 서브넷 마스크 255.255.255.0: 11111111.11111111.11111111.00000000

자리수 끼리 &(and) 연산을 통해 네트워크 부분을 구할 수 있다.

#### 사설 IP 와 공인 IP

**공인 IP**
- **ISP(인터넷 서비스 공급자)**가 제공하는 전세계적으로 유일한 IP 주소
- 외부에서 직접 접근 가능
- 방화벽 등의 보안 설정 필요

> ISP 는 KT, SKT, LG U+ 등등 이 대표적이며, AWS, Azure 같은 클라우드 서버의 퍼블릭 IP 도 그 예이다.

**사설 IP**
- 가정이나 회사 내부 네트워크에서 사용
- 외부에서 직접 접근 불가능
- **NAT(Network Address Translation)**를 통해 인터넷 접속

사설 IP 주소는 공인 IP 와 구분되어 다음 대역을 사용하기로 약속되어 있다.

- Class A: 10.0.0.0 ~ 10.255.255.255
- Class B: 172.16.0.0 ~ 172.31.255.255
- Class C: 192.168.0.0 ~ 192.168.255.255

이렇게 IP 를 통해 타고 들어가면 end user 에 닿을 수 있다.

#### 포트 번호

end user 에 닿았다고 하여서 바로 데이터가 컴퓨터 내부로 들어가는건 아니다. 데이터가 들어갈 올바른 출입구인 포트 번호를 지정해주어야 데이터가 들어갈 수 있다.

- 0 ~ 1023: Well-known ports (HTTP:80, HTTPS:443, FTP:21)
- 1024 ~ 49151: Registered ports
- 49152 ~ 65535: Dynamic/Private ports

위는 그 예시이다. 0-49151 까지는 이미 쓰이고 있기 때문에 보통 커스텀으로 포트를 열때(서버를 열때)는 49152 부터 65535 까지의 포트 번호 중 안쓰는 번호를 사용하여 열어주면 된다.

이렇게 서버의 포트가 열리면 그 때부터 데이터가 들어올 통로를 마련하게 된다.

### TCP 통신

신뢰성 있는 데이터 전송을 보장하는 연결 지향적 프로토콜이다.

- **연결 지향적**: 데이터 전송 전 수신자와 송신자가 3-way handshake 로 연결
- **신뢰성 보장**: 데이터가 유실되거나 순서가 바뀌면 재전송 순서 보정 등을 통해 보장
- **스트림 기반**: 데이터를 패킷 단위가 아니라 바이트 스트림으로 다룸
- **혼잡 제어, 흐름 제어**: 네트워크가 과부하되지 않도록, 수신자가 처리 가능한 만큼만 전송

**동작 과정**
1. 3-Way Handshake:
    - Client -> Server: SYN (연결 요청 신호)
    - Server -> Client: SYN + ACK (연결 허가 + 확인)
    - Client -> Server: ACK (확인 완료)
2. 데이터 전송
    - 데이터를 세그먼트 단위로 잘라 보냄
    - 각 세그먼트에 번호를 붙여 순서 확인
    - 수신 측은 ACK 를 보내어 잘 받았음을 알림
3. 연결 해제 (4-Way Handsake)
    - 서로 FIN 과 ACK 를 주고 받으며 정상적으로 연결을 끊음

### Java 네트워크 프로그래밍

#### InetAddress 클래스

IP 주소를 표현하고 다루는 클래스이다. `java.net` 패키지에 들어있고, 호스트 이름과 IP 주소간의 매핑을 처리하며, 로컬/원격 호스트의 IP 주소를 나타낼 수 있다.

생성자를 호출하지 않고, 정적 메서드 호출을 하여 객체를 생성한다.
- InetAddress.getByName("www.google.com")
- InetAddress.getAllByName("www.google.com"): 도메인 주소에 대한 모든 서버 IP 리턴
- InetAddress.getLocalHost(): 현재 내 컴퓨터의 IP

**isReachable(int timeout)**
{% highlight java %}
import java.net.*;

public class ReachableExample {
    public static void main(String[] args) {
        try {
            // 구글 서버 주소
            InetAddress google = InetAddress.getByName("www.google.com");

            System.out.println("호스트 이름: " + google.getHostName());
            System.out.println("호스트 주소: " + google.getHostAddress());

            // 5초 동안 응답 여부 확인
            if (google.isReachable(5000)) {
                System.out.println("구글 서버에 연결 가능합니다!");
            } else {
                System.out.println("구글 서버에 연결할 수 없습니다.");
            }

            // 로컬호스트 테스트
            InetAddress local = InetAddress.getLocalHost();
            if (local.isReachable(2000)) {
                System.out.println("로컬호스트 연결 가능!");
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
{% endhighlight %}

> 방화벽에 막혀 있으면 실제로 연결 가능한데도 false 를 반환할 수 있으며, 내부적으로 ICMP 연결을 사용한다. ICMP 는 OS 권한이 필요하여 일부 환경에서는 false 가 나올 수 있다.

- isLoopbackAddress(): 자기 자신의 주소인지 확인(localhost)
- isSiteLocalAddress(): 이 주소가 사설 IP 주소인지 확인하는 메서드이다

> IPv6 의 루프백 주소는 ::1 이다.

#### Socket Programming

먼저 소켓을 알아보자. 소켓은 네트워크 통신의 **End-point** 를 의미하며, **프로세스와 네트워크를 연결하는 추상화된 창구**라고 할 수 있다.

- IP 주소: 어느 컴퓨터인가?
- Port 번호: 어떤 프로세스인가?
- Socket: IP + Port 를 합친 네트워크 상의 출입구

따라서 소켓은 두 프로세스가 네트워크를 통해 통신할 수 있게 하는 인터페이스이다. 또한 소켓을 사용하면 양방향 데이터 스트림을 제공하며, TCP 소켓, UDP 소켓의 타입도 결정할 수 있다.

##### TCP 소켓

- 연결 지향적(3-way handshake)
- 신뢰성 보장(순서 보장, 무손실)

##### UDP 소켓

- 비연결 지향적
- 빠르지만 신뢰성 없음

> 조금 손실이 일어나도 괜찮은 데이터라면 UDP 가 좋음

##### TCP Echo 서버 구현

에코 서버는 클라이언트가 서버에게 메시지를 보내면 서버가 클라이언트에게 동일한 메시지로 다시 보내는 구조이다.

{% highlight java %}
public class SimpleEchoServer {
	private final static int PORT = 7777;

	public static void main(String[] args) {

		// 호스트 지정이 없으면 서버가 모든 네트워크의 인터페이스에서 접속을 받을 수 있음
		try (var serverSocket = new ServerSocket(PORT)) {
			System.out.println(PORT + " 포트가 열렸습니다.");

			while (true) {
				/*
				accept() 로 클라이언트가 들어오길 기다림
				클라이언트가 접속을 했다면 client 소켓이 리턴됨

				클라이언트의 소켓을 통해서 in, out 의 연결 통로가 필요(양방향)
				항상 입출력은 하나의 통로에서 동작할 수 없다.
				 */
				try (Socket socket = serverSocket.accept();
				     BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
				     PrintWriter out = new PrintWriter(new BufferedOutputStream(socket.getOutputStream()), true)) {

					System.out.println("클라이언트 " + socket.getRemoteSocketAddress() + " 님 접속 완료");

					String line;

					while ((line = in.readLine()) != null) {
						System.out.println("클라이언트로부터 받은 메시지: " + line);

						out.println("Echo " + line);

						if ("bye".equalsIgnoreCase(line))
							break;
					}
				}
			}
		} catch (IOException e) {
			System.err.println("서버 시작 실패했습니다.");
		}
	}
}
{% endhighlight %}

우선 `Socket` 은 `accept()` 를 통해 통신이 들어오는지 안들어오는지 판단하고, 들어온다면 그때 **3-Way Handshake** 가 일어나게 된다.

정상적인 통신이 이루어졌다면, 올바른 소켓이 만들어지게 되고 여기서 소켓은 `InputStream` 과 `OutputStream` 을 반환하게 되는데, 이 두 통로가 바로 in, out 의 양방향 송수신을 하게 될 창구이다.

{% highlight java %}
socket.getRemoteSocketAddress()
{% endhighlight %}

소켓은 접속한 클라이언트의 소켓 주소를 볼 수 있으며 위 메서드로 정보를 불러오게 된다. 이제 `in.readLine()` 을 무한히 반복하여 `readLine()` 에서 `blocking` 이 되어서 입력을 기다리고, 받은 입력을 다시 out 으로 내보내게 되면서 echo 기능을 수행함을 볼 수 있다.

> `PrintWriter out = new PrintWriter(new BufferedOutputStream(socket.getOutputStream()), true)` 의 두 번째 인자는 println, printf, format 메서드를 호출하면 무조건 그 다음 자동 flush를 하도록 하는 옵션이다.

서버를 다 만들었으니 이제 클라이언트 쪽도 만들어야 한다.

{% highlight java %}
public class SimpleEchoClient {
	private static final String HOST = "localhost";
	private static final int PORT = 7777;

	public static void main(String[] args) {

		// 호스트 지정이 있기에 서버가 특정 IP 주소에만 바인딩 됨
		try (var socket = new Socket(HOST, PORT);
		     var in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		     var out = new PrintWriter(new BufferedOutputStream(socket.getOutputStream()), true);
		     var keyboard = new Scanner(System.in)) {

			System.out.println("접속 완료");
			System.out.println("bye 를 입력하시면 종료됩니다.");

			while (true) {
				// 클라이언트의 입력을 전송
				System.out.print("서버에 전달할 메시지를 입력하세요: ");
				var line = keyboard.nextLine();
				out.println(line);

				// 서버가 응답한 내용을 읽어옴
				var response = in.readLine();

                // [안정성] 서버가 연결을 먼저 끊었을 경우를 확인합니다.
                if (response == null) {
                    System.out.println("서버와의 연결이 끊어졌습니다.");
                    break;
                }

                System.out.println(response);

				if ("bye".equalsIgnoreCase(line))
					break;
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
}
{% endhighlight %}

거의 동일하지만 중요한 것은 `var response = in.readLine();` 을 수행할 때 서버가 해당 유저의 연결을 강제로 끊어버렸을 때이다. 이때는 response 에 null 이 들어가게 되므로 끊었을 때는 유저의 연결도 끊어주어야 하기에 if 문으로 자원을 회수한다.

##### Multi-Threaded Server

위 예시는 사용자가 한 명만 접속을 하게 된다. 2명 부터는 접속이 안되게 되는데, `accept()` 를 통해 소켓을 만들지만 `readLine()` 의 blocking 때문에 이를 호출할 수 없다.

따라서 유저의 입출력을 비동기로 받을 수 있도록 해야하며, 중첩 클래스로 다음과 같이 선언할 수 있다.

{% highlight java %}
static class ClientHandler implements Runnable {
    private final Socket socket;

    ClientHandler(Socket socket) {
        this.socket = socket;
    }

    @Override
    public void run() {
        try (BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
        ) {
            SocketAddress clientAddress = socket.getRemoteSocketAddress();
            System.out.println(clientAddress + " 사용자 접속함");

            String inputLine;
            while ((inputLine = in.readLine()) != null) {
                System.out.println(clientAddress + "로 부터 받은 메시지 :: " + inputLine);
                out.println("Echo::" + inputLine);

                if ("bye".equals(inputLine)) {
                    break;
                }
            }

            System.out.println(clientAddress + " 연결 종료!!");

        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            try {
                socket.close();
            } catch (IOException e) {
                System.out.println(e.getMessage() + "소켓 종료 오류!!");
            }
        }
    }
}
{% endhighlight %}

이렇게 되면 내부적으로 또 다른 처리 흐름으로 전환시켜 `ClientHander` 를 수행하도록 하면 된다.

{% highlight java %}
try (ServerSocket serverSocket = new ServerSocket(PORT)) {
    System.out.println("에코서버 시작");

    while (true) {
        Socket socket = serverSocket.accept();

        //클라이언트별로 각각 통신 할 수 있는 쓰레드가 필요할 것 같아요.
        Thread clientThread = new Thread(new ClientHandler(socket));
        clientThread.start();
    }
} catch (Exception e) {
    throw new RuntimeException(e);
}
{% endhighlight %}

여기서 `Thread` 는 스레드 풀로 동작하게 할 수 있으며, 만약 초과하는 클라이언트 접속에 대해서는 `Waiting Queue` 로 들어가게 해야하며, 클라이언트에게는 `접속 기다리는 중...` 등의 피드백 메시지를 띄워줘야 한다.

{% highlight java %}
ServerSocket serverSocket = new ServerSocket(PORT);
System.out.println("에코 서버 시작, 포트: " + PORT);

// 스레드 풀과 큐 생성
BlockingQueue<Runnable> queue = new ArrayBlockingQueue<>(10); // 큐 용량 10
ThreadPoolExecutor pool = new ThreadPoolExecutor(
        MAX_THREADS,
        MAX_THREADS,
        0L,
        TimeUnit.MILLISECONDS,
        queue
);

while (true) {
    Socket socket = serverSocket.accept();

    // 풀과 큐 상태 확인
    if (pool.getActiveCount() >= MAX_THREADS && queue.remainingCapacity() == 0) {
        // 스레드와 큐가 꽉 찼다면 대기 메시지 전송 후 연결 종료
        try (PrintWriter out = new PrintWriter(socket.getOutputStream(), true)) {
            out.println("서버 접속 대기 중입니다. 잠시 후 다시 시도해주세요.");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            socket.close();
        }
    } else {
        // 처리 가능한 경우 스레드 풀에 제출
        pool.submit(new ClientHandler(socket));
    }
}
{% endhighlight %}

##### TCP 채팅 서버

{% highlight java %}
public class ChatServer {
	private static final int PORT = 7777;
	private static Set<ClientHandler> clients = ConcurrentHashMap.newKeySet();

	private static void broadcast(String message) {
		System.out.println(message);
		for (var client : clients)
			client.sendMessage(message);
	}

	public static void main(String[] args) {
		System.out.println("채팅 서버 시작");

		try (ServerSocket serverSocket = new ServerSocket(PORT)) {
			while (true) {
				Socket socket = serverSocket.accept();
				ClientHandler clientHandler = new ClientHandler(socket);
				clients.add(clientHandler);
				new Thread(clientHandler).start();
			}
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	static class ClientHandler implements Runnable {
		private Socket socket;
		private PrintWriter pw;
		private String nickname;

		public ClientHandler(Socket socket) {
			this.socket = socket;
		}

		@Override
		public void run() {
			try(var br = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
				pw = new PrintWriter(new BufferedOutputStream(socket.getOutputStream()), true);

				String message;
				while ((message = br.readLine()) != null && message.trim().isEmpty())
					pw.println("올바르지 않은 닉네임입니다.");

				nickname = message;
				broadcast(nickname + "님이 들어왔습니다.");

				if (nickname != null)
					while ((message = br.readLine()) != null) {
						if (message.trim().isBlank()) continue;
						broadcast(nickname + "\t" + message);
					}

			} catch (IOException e) {
				System.err.println(e);

			} finally {
				broadcast(nickname + "님이 나갔습니다.");
				pw.close();

				try {
					socket.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		private void sendMessage(String message) {
			if (pw != null) pw.println(message);
		}
	}
}
{% endhighlight %}

다른 코드들은 전부 해석하면 되며, `private static Set<ClientHandler> clients = ConcurrentHashMap.newKeySet();` 쪽과 예외처리의 흐름을 잘 이해하고 코드를 짜야하는 것을 보아야 한다.

만약 `Collections.synchronizedSet(new HashSet<>())` 을 쓰게 된다면 이는 전체 Set 에 lock 을 걸기 때문에 성능 저하가 일어나게 된다. 하지만 `ConcurrentHashMap.newKeySet()` 은:

- [Fine-grained Lock](#fine-grained-lock), [Segment Lock](#segment-lock) 등 내부에 동기화 구현이 최적화되어 있어서 높은 동시성을 지원한다.
- 멀티 스레드 환경에서 컬렉션 보다 더 효율적이게 된다.

이러한 이유로 해당 정적 메서드를 통해 최적화된 동시성을 가진 Set 을 가질 수 있다.

{% highlight java %}
public class ChatClient {
	private static final String HOST = "localhost";
	private static final int PORT = 7777;

	public static void main(String[] args) {
		try (Socket socket = new Socket(HOST, PORT);
		     BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
		     PrintWriter out = new PrintWriter(new BufferedOutputStream(socket.getOutputStream()), true);
		     Scanner sc = new Scanner(System.in);
		) {
			System.out.println("접속 성공 !");

			// receiver
			Thread thread = new Thread(() -> {
				String message;
				try {
					while ((message = in.readLine()) != null)
						System.out.println(message);
				} catch (IOException e) {
					System.out.println(e);
				}
			});

			thread.start();

			System.out.print("닉네임을 입력해주세요: ");
			out.println(sc.nextLine());

			// sender
			String message;
			while (true) {
				message = sc.nextLine();
				if ("bye".equalsIgnoreCase(message)) break;
				out.println(message);
			}

			System.out.println("종료 완료");
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
}
{% endhighlight %}

**클라이언트 입장**
가장 중요한 것은 서버 쪽과의 통신이다. 만약 연결을 끊고 싶을때는 `socket.close()` 를 호출하면 되나, try 로 묶었기 때문에 `try-with-resources` 블럭이 끝나면, 소켓, in, out 등 자원이 회수되게 되고 receive thread 는 자동적으로 닫히게 된다(`in.readLine()` 의 값이 `null` 이 되기 때문). FIN 패킷이 서버로 전송되어 **4Way-handsake** 가 되게 된다.

**서버 입장**
이제 서버 입장이다. 서버 쪽에서는 입력 스트림에 더 이상 읽을게 없다는 것을 깨닫고, `br.readLine()` 에서 블로킹 된 흐름에서 message 가 `null` 이 되기 때문에 try 문을 벗어나게 된다. 이후 `pw.close()` 를 통해 out 통로를 닫고, `socket.close()` 자원까지 호출하여 전부 닫게 된다.

---

## ✒️ 용어

###### Fine-grained Lock

`Lock` 단위를 줄여서 작은 단위에 대한 `Lock` 을 걸어 동시성을 높이는 전략

- 여러 스레드가 서로 다른 key 를 수정할 때 충돌 없이 동시 접근이 가능
- 동시성 성능이 훨씬 좋음

> `ConcurrentHashMap` 은 내부적으로 key들을 버킷(bucket) 단위로 나누고, 버킷마다 lock을 걸거나 원자적 연산을 사용

###### Segment Lock

내부적으로 `Map` 을 여러 개 Segment 로 나누고 각 세그먼트는 자체 Lock 을 가지며, 스레드가 Key 를 추가/삭제할 때 해당 Segment 만 lock 을 거는 것, 즉 세그먼트 개수만큼 동시 접근이 가능하다.