---
layout: post
title:  Collection
date:   2025-08-28 14:11:47 +0900
categories: ComputerScience Java
---

<!--more-->

## 📂 목차
- [Collection](#collection)
    - [Collections 활용](#collections-활용)
    - [List Interface 에 대한 Collections 활용](#list-interface-에-대한-collections-활용)
        - [CopyOnWriteArrayList](#copyonwritearraylist)
    - [Set Interface 에 대한 Collections 활용](#set-interface-에-대한-collections-활용)
        - [TreeSet](#treeset)
        - [EnumSet](#enumset)
        - [LinkedHashSet](#linkedhashset)
    - [Queue Interface 에 대한 Collections 활용](#queue-interface-에-대한-collections-활용)
        - [LinkedList](#)
        - [PriorityQueue](#priorityqueue)
        - [BlockingQueue Interface](#blockingqueue-interface)

---

## 📚 본문

### Collection

참고: [Java API](https://docs.oracle.com/javase/8/docs/api/java/util/Collection.html)

#### Collections 활용

- `clear`: c의 모든 요소에 대해 제거한다.
- `retainAll`: c의 최대 공통 부분을 찾는다(교집합)
- `collection1.contains(collection2)`: 해당 원소가 포함되는지 찾는다.
- `Iterator<E> iterator()`: 순회용 `Iterator` 를 반환한다.
- `Object[] toArray()`: 배열로 변환한다.

#### List Interface 에 대한 Collections 활용

- `Collections.sort(list)`: 주어진 리스트를 오름차순으로 정리한다.
- `Collections.rotate(list, movement)`: movement 만큼 오른쪽으로 2칸 회전한다.
- `Collections.shuffle(list)`: 원소들을 무작위로 섞는다.
- `Collections.fill(list, 0)`: list를 0으로 채운다.
- ⭐️ `Collections.synchronizedList(new ArrayList<>())`: 동기화된 list 를 생성한다.
- ⭐️ `Collections.unmodifiableList(list)`: 읽기 전용 리스트를 만든다.
- `Collections.frequency(list, element)`: element 의 빈도를 반환한다.
- `Collections.max() / .min()`
- `Collections.swap(list, idx1, idx2)`: idx1 과 idx2 자리의 값을 교환한다.

##### CopyOnWriteArrayList

동기화와 읽기 위주의 최적화를 제공하는 리스트이다. 멀티스레드 환경에서 읽기가 많을 때 사용한다.

#### Set Interface 에 대한 Collections 활용

- `Collections.synchronizedSet(set)`: set을 받아 동기화되는 `Set` 을 반환한다.
- `Collections.unmodifiableSet(set)`: set을 받아 읽기 전용 `Set` 을 만든다.

> unmodifiableXXXX 와 같이 쓰기 보다  
그냥 unmodifiableCollection 을 쓰면 된다.  
synchronized 도 마찬가지이다.

##### TreeSet

`Set` 인터페이스를 구현하는 클래스이며, ordered 의 특징을 가진다. `Comparator` 을 통해 정렬 순서를 정할 수 있다. 내부적으로는 이진 트리 기반의 레드-블랙 트리가 쓰인다.

##### EnumSet

enum 타입 전용의 `Set` 을 생성한다. enum 요소를 Set 으로 관리할 때 효율적이다.

##### LinkedHashSet

`HashSet` 인데 순서를 가지고 싶은 경우 사용한다.

#### Queue Interface 에 대한 Collections 활용

FIFO 구조를 가지는 인터페이스이며, 

- `BlockingDeque`
- `BlockingQueue`
- `Deque`
- `TransferQueue`

의 하위 인터페이스가 있다. 위에서의 `add`, `remove` 와는 좀 다르게 다음 행위를 한다.

- `offer(e)`: e 요소를 추가한다. 실패 시 `false` 를 반환한다. 
- `poll()`: 요소를 제거한다. 비어 있으면 `null` 을 반환한다.
- `peek()`: 다음 요소를 확인하며 비어 있으면 `null` 을 반환한다.

구현체를 보자.

##### LinkedList

여러 개의 `Node` 가 연결되어서 저장되는 구조로 확장이 용이하다.

- 읽기 성능 느림
- 첫 요소(`addFirst()`, `removeFirst()`)
- 마지막 요소(`addLast()`, `removeLast()`)

##### PriorityQueue

우선순위 큐라고 부르며, `Comparable` 을 구현하여 사용하거나 `Comparator` 기반의 정렬을 한다.

{% highlight java %}
import java.util.*;

class Student {
    int mathScore;
    int englishScore;

    public Student(int mathScore, int englishScore) {
        this.mathScore = mathScore;
        this.englishScore = englishScore;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        Student other = (Student) obj;
        return this.mathScore == other.mathScore &&
                this.englishScore == other.englishScore;
    }

    @Override
    public int hashCode() {
        return Objects.hash(mathScore, englishScore);
    }

}

public class Solution {
    public static void main(String[] args) {
        Queue<Student> queue = new PriorityQueue<>((o1, o2) -> {
            if (o1.mathScore == o2.mathScore)
                return o1.englishScore - o2.englishScore;
            return o1.mathScore - o2.mathScore;
        });

        queue.add(new Student(90, 85));
        queue.add(new Student(75, 95));
        queue.add(new Student(90, 80));
        queue.add(new Student(60, 70));
        queue.add(new Student(75, 85));

        // Queue 출력 (poll로 순서 확인)
        while (!queue.isEmpty()) {
            Student s = queue.poll();
            System.out.println("Math: " + s.mathScore + ", English: " + s.englishScore);
        }
    }
}
{% endhighlight %}

##### BlockingQueue Interface

큐가 비어있다면 `take()` 에서 대기하고 꽉 차면 `put()` 에서 대기한다.  
이를 **blocking** 이라고 한다.

**구현체**
- `ArrayBlockingQueue`: 고정 크기 배열 기반
- `LinkeBlockingQueue`: 링크드 노드라 크기 유연
- `PriorityBlockingQueue`: 우선순위 큐 + 블로킹
- `DelayQueue`: 일정 시간 후에 요소가 처리되는 큐
- `SynchronousQueue`: 요소가 들어오면 바로 Consumer 에게 전달

**Blocking**

큐가 가득 차 있으면 새로운 요소를 넣을 수 없게 된다.  
그 순간 `put()` 을 호출한 스레드는 블로킹이 되어 대기 큐로 이동하며,  
큐에 공간이 생길 시 자동으로 다시 `ready queue` 로 가서 실행될  
준비를 하게 된다. `take()` 도 동일

실제로 코드를 보자.

{% highlight java %}
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

class Producer implements Runnable {
    private final BlockingQueue<Integer> queue;

    public Producer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            for (int i = 1; i <= 5; i++) {
                System.out.println("Producer: " + i + " 생성");
                queue.put(i); // 큐가 꽉 차면 블로킹
                Thread.sleep(500); // 생산 속도 조절
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

class Consumer implements Runnable {
    private final BlockingQueue<Integer> queue;

    public Consumer(BlockingQueue<Integer> queue) {
        this.queue = queue;
    }

    @Override
    public void run() {
        try {
            while (true) {
                Integer data = queue.take(); // 큐가 비면 블로킹
                System.out.println("Consumer: " + data + " 소비");
                Thread.sleep(1000); // 소비 속도 조절
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

public class BlockingQueueExample {
    public static void main(String[] args) {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(2); // 최대 2개 저장 가능

        Thread producer = new Thread(new Producer(queue));
        Thread consumer = new Thread(new Consumer(queue));

        producer.start();
        consumer.start();
    }
}
{% endhighlight %}