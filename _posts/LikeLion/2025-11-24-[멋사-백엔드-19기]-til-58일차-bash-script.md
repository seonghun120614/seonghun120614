---
layout: post
title:  "[멋사 백엔드 19기] TIL 58일차 Bash Script"
date:   2025-11-24 09:43:51 +0900
categories: 멋쟁이사자처럼 멋사 백엔드 TIL shell
---

<!--more-->

## 📂 목차

- [기초 개념](#기초-개념)
    - [Shell](#shell)
	- [Shell과 Terminal/Command Line 차이](#shell과-terminalcommand-line-차이)
	- [Script 파일 만들기와 실행 방법](#script-파일-만들기와-실행-방법)
        - [OS 별 패키지 매니저](#os-별-패키지-매니저)
        - [Vim 통한 기본 실행](#vim-통한-기본-실행)
	- [chmod +x script.sh](#chmod-x-scriptsh)
	- [./script.sh](#scriptsh)
	- [sh script.sh](#sh-scriptsh)
	- [주석과 기본 구조](#주석과-기본-구조)

- [기본 명령어](#기본-명령어)
	- [파일/디렉터리 관련](#파일디렉터리-관련)
        - [tree](#tree)
        - [find](#find)
        - [locate](#locate)
        - [ls](#ls)
        - [less](#less)
        - [wc](#wc)
        - [ln](#ln)
	- [텍스트 처리](#텍스트-처리)
        - [printf](#printf)
    - [프로세스/시스템 관련](#프로세스시스템-관련)
        - [ps](#ps)
        - [top](#top)
        - [kill](#kill)
        - [df](#df)
        - [du](#du)
- [변수와 데이터](#변수와-데이터)
	- [변수 선언과 사용](#변수-선언과-사용)
	- [배열과 연관 배열 (Associative Array, Bash 4 이상)](#배열과-연관-배열-associative-array-bash-4-이상)

- [조건문과 반복문](#조건문과-반복문)
	- [조건문](#조건문)
	- [논리 연산자](#논리-연산자)
	- [확장 test](#확장-test--)
	- [case](#case)
	- [for, while, until](#for-while-until)

- [함수와 스크립트 구조](#함수와-스크립트-구조)
	- [함수 선언과 호출](#함수-선언과-호출)
	- [스크립트 모듈화](#스크립트-모듈화)

- [입출력과 파일 처리](#입출력과-파일-처리)
	- [표준 입출력](#표준-입출력)
	- [stdin, stdout, stderr](#stdin-stdout-stderr)
	- [리다이렉션](#리다이렉션)
	- [grep](#grep)
	- [awk](#awk)
    - [sed](#sed)
    - [cut](#cut)
    - [sort](#sort)
    - [uniq](#uniq)
	- [tr](#tr)

- [스크립트 고급 기능](#스크립트-고급-기능)
	- [명령어 치환과 프로세스 치환](#명령어-치환과-프로세스-치환)
	- [배열과 문자열 고급 처리](#배열과-문자열-고급-처리)
	- [정규식 사용](#정규식-사용)
	- [날짜/시간 처리 (date, sleep)](#날짜시간-처리-date-sleep)
	- [trap "commands" SIGNAL](#trap-과-시그널-처리)

- [자동화 및 실용 예제](#자동화-및-실용-예제)
	- [백업 스크립트](#백업-스크립트)
	- [배치 작업(cron) 연동](#배치-작업cron-연동)
	- [시스템 점검 스크립트](#시스템-점검-스크립트)
	- [로그 분석 자동화](#로그-분석-자동화)
    - [배포/빌드 자동화 스크립트](#배포빌드-자동화-스크립트)

---

## 📚 본문

### 기초 개념

#### Shell

사용자가 운영체제와 상호작용하기 위해 제공도는 명령어 인터페이스이며, 사용자가 입력한 명령을 해석하고 OS 커널에게 전달하는 프로그램이다.

**역할**
- 명령어 인터프리터
- 프로세스 관리
- 스크립트 처리
- 환경 관리

**종류**
- Bash: Linux/Unix 의 기본 shell
- Zsh: Bash 보다 풍부한 기능을 제공하며 Mac 기본 shell
- Fish: 사용자 편의성을 강조한 shell
- PowerShell: Window 환경에서 사용하는 shell

#### Shell과 Terminal/Command Line 차이

보통 터미널은 사용자와 컴퓨터를 연결하는 입출력 인터페이스이다. 원래는 물리적인 터미널 장치였고, 현재는 GUI/CLI 프로그램으로 구현되어 있기 때문에 우리는 여기서 놀게 된다.

- **Mac**: `Terminal`, `iTerm2`
- **Linux**: `GNOME Terminal`, `Konsole`
- **Windows**: `Command Prompt`, `Windows Terminal`, `PowerShell`

반면 쉘이라는 것은 사용자가 입력한 명령을 해석하고 OS 커널에 전달한다. 입출력은 terminal 이, 실제 명령의 해석과 전달은 쉘이 담당한다.

{% highlight text %}
사용자 입력
    │
    ▼
Terminal (입력/출력 인터페이스)
    │
    ▼
Shell (명령어 해석기)
    │
    ▼
OS 커널 (프로세스 생성, 파일/네트워크 제어)
    │
    ▼
하드웨어
{% endhighlight %}

#### Script 파일 만들기와 실행 방법

명령어 창에는 항상 한 명령어 단위로 실행을 처리하는 것을 볼 수 있는데, 여러 명령어를 처리하고 싶을 때는 스크립트 파일을 만드는 것을 고려할 수 있다.

{% highlight bash %}
touch myscript.sh
{% endhighlight %}

스크립트 파일은 `.sh` 확장자로 시작하며, 윈도우에서는 `.bat` 혹은 파워쉘이면 `.ps1` 로 만들 수 있다. 각자 가지고 있는 텍스트 편집기가 있을 것이다. mac 이나 linux 는 vim 을 많이 사용하며, 없다면 설치해주자.

##### OS 별 패키지 매니저

우분투와 데비안은 `apt-get` 패키지 관리자를 사용하여 다양한 소프트웨어를 다운로드 할 수 있다.

**Ubuntu / Debian**
{% highlight bash %}
sudo apt-get update
sudo apt-get install vim -y
vim --version
{% endhighlight %}

반면 페도라, 센트os, RHEL 계열은 yum, dnf 를 쓰며, 이를 통해 다운할 수 있다.

**Fedora / CentOS / RHEL**
{% highlight bash %}
sudo dnf install --update
sudo yum install --update

sudo dnf install vim -y
sudo yum install vim -y

vim --version
{% endhighlight %}

> dnf 가 더 최신이다.

**MacOS**

보통 mac 은 vim 이 기본적으로 있기 때문에 별도의 설치를 안해도 된다.

##### Vim 통한 기본 실행

{% highlight bash %}
vim script.sh
{% endhighlight %}

위와 같이 입력 후 편집 창이 뜨면 `i` 를 입력하여 다음을 입력해준다.

{% highlight bash %}
echo "Hello, world!"
{% endhighlight %}

그런 후 `esc` 를 눌러서 `:wq` 혹은 `:x` 로 쓰기 후 저장을 하도록 하자.

{% highlight bash %}
cat script.sh
bash script.sh
{% endhighlight %}

위 명령어를 통해 실행하면 `Hello, world!` 가 출력될 것이다.

#### chmod +x script.sh

가끔 만든 `script.sh` 가 실행 안될 때는 권한이 없는 것을 살펴보자.

{% highlight bash %}
ls -al
{% endhighlight %}

권한 확인은 아래와 같이 뜨는 곳에서 해석할 수 있다.

![assets/img/file-authorities.png]({{ site.baseurl }}/assets/img/file-authorities.png)

- 1번째 문자: 파일 종류(`-`, `d`, `l`, `c`, `b`)
    - `-`: 일반 파일
    - `d`: 디렉터리
    - `l`: 심볼릭 링크
    - `c`: 문자 디바이스 파일
    - `b`: 블록 디바이스 파일
- 2-4번째 문자: 소유자 권한
    - `r`: 읽기 권한 on, 4를 의미
    - `w`: 쓰기 권한 on, 2를 의미
    - `x`: 실행 권한 on, 1을 의미
- 5-7번째 문자: 그룹 권한
- 8-10번째 문자: 기타 사용자 권한

위 개념을 토대로 `chmod` 명령어를 통해 `script.sh` 의 실행 권한을 바꿀 수 있다.

{% highlight bash %}
chmod u+x script.sh
{% endhighlight %}

현재 user 에게 실행 권한 x 를 부여하는 것이다(- 를 넣으면 권한 뺌).

{% highlight bash %}
chmod 100 script.sh
{% endhighlight %}

위와 같이 8진수를 각각 3개의 숫자에 넣어서 권한을 바꿀 수도 있다.

#### ./script.sh

`bash script.sh` 말고도 현재 디렉토리와 스크립트 파일을 통해 경로를 지정해주면 Linux/Unix/MacOS 환경에서는 이를 현재 디렉터리에 있는 스크립트를 실행하도록 할 수 있다.

이때는 실행 권한이 무조건 필요하게 된다.

#### sh script.sh

이 실행 명령어는 실행 권한이 없어도 실행이 가능하며 `bash script.sh` 도 이것의 한 예이다.

#### 주석과 기본 구조

{% highlight bash %}
#!/bin/bash
# 이 스크립트는 "Hello, World!"를 출력합니다.

echo "Hello, World!"  # 출력 명령
{% endhighlight %}

맨 첫줄에는 보통 `Shebang` 이라고 해서 해당 스크립트를 어떤 Shell 로 실행할지를 지정하는 라인이다. 맨 첫 줄에 나오게 된다.

### 기본 명령어

일단 기초적인 명령들은 다 빼고 얻어갈 수 있는 것들만 넣었다.

#### 파일/디렉터리 관련

##### tree

디렉터리 구조를 트리형태로 볼 수 있다.

{% highlight bash %}
tree -L 2
{% endhighlight %}

`-L` 은 하위 어느 계층까지 트리로 보여줄지이며, 깊이가 2 이게 된다.

##### find

특정 조건에 맞는 파일이나 디렉터리를 재귀적으로 검색하며, 옵션으로는 -name, -type 등이 있다.

{% highlight bash %}
# 현재 디렉터리 이하에서 모든 txt 파일 검색
find . -name "*.txt"

# /home 이하에서 디렉터리 이름이 backup으로 시작하는 것 찾기
find /home -type d -name "backup*"
{% endhighlight %}

> `find` 는 전통적인 Unix 스타일 명령어라서 `long-option` 스타일이 아니다. GNU 스타일의 명령어만 long-option 을 쓴다.

##### locate

미리 구축된 데이터베이스를 사용하여 파일을 빠르게 검색한다.

{% highlight bash %}
locate script.sh
{% endhighlight %}

이를 칠려고 할때 다음 경고창이 뜰 수 있다.

{% highlight bash %}
WARNING: The locate database (/var/db/locate.database) does not exist.
To create the database, run the following command:

  sudo launchctl load -w /System/Library/LaunchDaemons/com.apple.locate.plist
{% endhighlight %}

맞는 명령어를 실행하여 `locate` 명령을 다시 수행할 수 있다.

##### ls

- `-l`: 상세 정보
- `-a`: 숨김 파일까지 전부
- `-h`: 사람이 읽기 쉬운 단위로(KB, MB)

{% highlight bash %}
ls -lha
{% endhighlight %}

##### less

큰 파일을 스크롤하면서 읽을 수 있는 페이지 뷰어이다.

{% highlight bash %}
less script.sh
{% endhighlight %}

##### wc

파일의 줄 수, 단어 수, 문자 수 확인

- `-l`:  줄 수
- `-w`: 단어 수
- `-c`: 문자 수

##### ln

파일 또는 디렉터리 링크를 생성할 수 있다. 윈도우로 치면 바로가기 정도가 될 것이다.

{% highlight bash %}
ln -s /home/user/script.sh ~/script-link.sh
{% endhighlight %}

위 명령으로 ~ 디렉터리에 `script-link.sh` 를 생성할 수 있다.

#### 텍스트 처리

##### printf

C언어의 `printf()` 와 동등한 방식으로 동작하며, 출력 형식을 포맷 문자열로 정확히 지정할 수 있다. 개행 자동 추가는 없고 `\n` 을 명시적으로 넣어야 줄바꿈이 된다.

{% highlight bash %}
printf "%s\n" "Hello"
{% endhighlight %}

쉘 스크립트를 쓰다보면 이제 함수 자체가 인자를 받는 방법이 어떤 형태로 받는지 보일 것이다. 띄어쓰기를 구분해서 받게 된다. 또한 모든 변수가 기본적으로 형태는 문자열임을 알 수 있다(숫자로 보이더라도 결국 문자다).

{% highlight bash %}
printf "%.3f\n" 3.141592
{% endhighlight %}

#### 프로세스/시스템 관련

##### ps

{% highlight bash %}
ps
ps aux # 자세한 옵션 포함 전체 목록
ps aux | grep nginx 
{% endhighlight %}

- a: 모든 사용자 프로세스
- u: 상세 정보 표시(CPU/메모리 사용량)
- x: 터미널에 연결되지 않은 프로세스 포함

##### top

실시간으로 CPU/메모리/프로세스 상태를 보여주는 인터랙티브 모니터링 도구

{% highlight bash %}
top -b -n 1 # 배치모드로 한 번만 출력, batch, num
top -u <user> # 특정 사용자 프로세스만 표시, user
top -p 1234 # 1234 프로세스만 추적, process
top -d 1 # 1초마다 갱신, delay
{% endhighlight %}

##### kill

{% highlight bash %}
kill <PID>
kill -9 <PID>   # 강제 종료
{% endhighlight %}

- `kill -<signal_code> <PID>`: 시그널 코드를 보내 특정 동작을 유도하는 명령

##### df

디스크 사용량 및 파티션 정보를 확인하는 명령어

{% highlight bash %}
df -h
{% endhighlight %}

- `-h`: 사람이 읽기 쉬운 단위로 표시
- `-T`: 파일 시스템 타입 표시

##### du

{% highlight bash %}
du -sh .
{% endhighlight %}

파일/디렉터리의 실제 디스크 점유 용량 확인

- `-s`: 총합만 표시
- `-h`: 사람이 읽기 쉬운 단위로 표시
- `-d 1`: 하위 1단계 디렉터리만 표시

### 변수와 데이터

#### 변수 선언과 사용

- 전역 변수는 대문자
- 로컬 변수는 소문자(함수)
- 스네이크 케이스를 씀
- 문자 혹은 _ 만 된다

{% highlight bash %}
NAME="Seonghun"
{% endhighlight %}

쉘 스크립트는 띄어쓰기에 대해 정해져 있는 규칙이 있기 때문에(인자 구별) 등호 양 옆에 쓰지 않기를 주의하자.

{% highlight bash %}
printf "My name is %s and I am ${age} years old." "${NAME}" 26
{% endhighlight %}

위와 같이 달러 기호를 통해 변수를 사용할 수 있다. 중괄호는 생략해도 되는데, 뒤에 나오는 문자와 구별되게 하기 위해 되도록 `${}` 를 쓰는게 좋을 듯하다.

**$(()) 수식 표현식 및 계산 사용**
{% highlight bash %}
COUNT=1
COUNT=$((COUNT + 1))
echo $COUNT
{% endhighlight %}

수정하고 싶을때는 `$(())` 의 표현식의 산술 계산을 할 수 있는 문법을 쓴다.

**환경 변수 등록하기**
{% highlight bash %}
export VAR="Global"
{% endhighlight%}

특정 변수를 환경변수로 내보내고 싶을때 `export` 함수를 쓴다. 이는 다른 프로세스 간의 통신을 할 수 있는 변수이기 때문에 통신을 위해서도 사용할 수 있다.

**명령어 결과 저장하기**
{% highlight bash %}
DATE=$(date +%Y-%m-%d)
{% endhighlight %}

`$()` 말고 \`\`\` \`\`\` 도 사용할 수 있다.

#### 배열과 연관 배열 (Associative Array, Bash 4 이상)

배열은 다음과 같이 선언한다. 인자와 마찬가지라고 보면 된다.

{% highlight bash %}
FRUITS=("apple" "banana" "cherry")
echo ${FRUITS[0]}
{% endhighlight %}

만약에 값 전체를 출력하고 싶을때는 `@` 와일드 카드를 사용한다.

{% highlight bash %}
echo ${FRUITS[@]}
{% endhighlight %}

다음과 같이 `map` 형도 넣을 수 있다.

{% highlight bash %}
declare -A USER=([hi]="hello" [1]=1000.123)
USER[name]="Seonghun"
USER[age]=25
{% endhighlight %}

{% highlight bash %}
USER[@] # values 가져오기
!USER[@] # 모든 키 가져오기
{% endhighlight %}

### 조건문과 반복문

#### 조건문

{% highlight bash %}
if [ 조건 ]; then
    명령
elif [ 조건 ]; then
    명령
else
    명령
fi
{% endhighlight %}

쉘 스크립트는 다른 프로그래밍 언어와는 다르게 모든 변수가 문자열로 되어 있다고 앞서 말했었다. 따라서 숫자의 텍스트를 비교할 때는 <, > 와 같은게 아니라 `-gt`, `-lt` 와 같은 다소 파이썬의 magic method 함수명 과 유사한 기능을 하는 부등호를 사용한다.

{% highlight bash %}
#!/bin/bash
NUM=10

if [ $NUM -gt 0 ]; then
    echo "양수입니다."
elif [ $NUM -lt 0 ]; then
    echo "음수입니다."
else
    echo "0입니다."
fi
{% endhighlight %}

숫자 텍스트 비교
- -eq
- -ne
- -gt
- -lt
- -ge
- -le

문자열 비교
- =: 같음
- !=: 다름
- -z STRING: 문자열 길이가 0인가?
- -n STRING: 문자열 길이가 0이 아닌가?

파일 비교
- -f: 파일 이냐 아니냐

#### 논리 연산자

`-o`, `-a`, `!` 와 같은 논리 연산자가 있으며, `or`, `and`, `not` 과 각각 동일하다.

#### 확장 test [[ ]]

bash 에서는 위와 같이 직관적이지 않고, 공백이 굉장히 엄격한 조건문을 써야하다보니 불편했다. 이런 조건문을 써야하는 것에 반해 나온 기능이 확장 test([[  ]]) 기능이 있다.

오로지 bash 에서만 지원하며, 기능이 더 강력해진다. 문자열 비교 시에 >, < 가 가능하며(ASCII 기준), 패턴 매칭을 지원하며, 논리 연산자 &&, || 를 안전하게 사용 가능하다.

{% highlight bash %}
NAME="Seonghun"

if [[ $NAME == Seong* ]]; then
    echo "이름이 Seong으로 시작합니다."
fi

if [[ $A -lt $B && $B -lt 20 ]]; then
    echo "B는 20보다 작습니다."
fi
{% endhighlight %}

위와 같이 사용할 수 있으며, glob 패턴 외의 졍규표현식을 통해서도 비교할 수 있다

{% highlight bash %}
if [[ $NAME =~ ^Seong ]]; then
    echo "이름이 Seong으로 시작합니다."
fi
{% endhighlight %}

#### case

{% highlight bash %}
#!/bin/bash
COLOR="red"

case $COLOR in
    "red")
        echo "빨강"
        ;;
    "blue")
        echo "파랑"
        ;;
    *)
        echo "기타 색상"
        ;;
esac
{% endhighlight %}

#### for, while, until

{% highlight bash %}
for ITEM in apple banana cherry
do
    echo "과일: $ITEM"
done
{% endhighlight %}

위에서 보다시피 in 은 for 반복문에서 리스트/배열 요소를 순차적으로 순회한다.

{% highlight bash %}
for i in {1..5}
do
    echo "숫자: $i"
done

# C 스타일
for ((i=0; i<5; i++))
do
    echo "C 스타일 숫자: $i"
done

{% endhighlight %}

이외의 반복문은 다음과 같다.

{% highlight bash %}
COUNT=1
while [ $COUNT -le 5 ]
do
    echo "COUNT = $COUNT"
    ((COUNT++))
done

COUNT=1
until [ $COUNT -gt 5 ] # while 과 동일
do
    echo "COUNT = $COUNT"
    ((COUNT++))
done

for i in {1..5}
do
    if [ $i -eq 3 ]; then
        echo "3은 건너뛰기"
        continue
    fi
    if [ $i -eq 5 ]; then
        echo "5이면 종료"
        break
    fi
    echo "숫자: $i"
done
{% endhighlight %}

### 함수와 스크립트 구조

#### 함수 선언과 호출

코드 블럭을 모듈화하여 재사용성을 높일 수 있는 수단으로 함수 기능이 있다.

{% highlight bash %}
function 함수명() {

}

함수명() {
    ...
}
{% endhighlight %}

위 두 형태로 정리할 수 있고, 함수 내부에서 스크립트 내 변수를 사용을 할 수 있다.

{% highlight bash %}

A=10
B=20

function calc() {
    A=100
    let B=300

}

calc()
echo "$A"
echo "$B"
{% endhighlight %}

`calc` 를 저렇게 해두면 A 는 전역 변수를 들고오기 때문에 그대로 100이 세팅이 되어 100이 출력되고, B 는 20이 그대로 출력이 될 것이다.

{% highlight bash %}
say() {
    printf "hi, %s!" "$1"
}

say "Seonghun"
{% endhighlight %}

위와 같이 인자도 전달할 수 있다. 이때 인자를 전달할 때는 공백으로 인자를 구분한다 이는 배열의 `[@]` 의 반환값도 같아서 다음과 같이 호출할 수도 있다.

{% highlight bash %}
fruits() {
    for fruit in "$@"; do
        echo $fruit
    done
}

FRUITS=("apple" "banana" "cherry")
fruits "$FRUITS[@]"
{% endhighlight %}

unpacking 기능과 유사하다.

{% highlight bash %}
count() {
    for (( i=0; i<$1; i++ ))
    do
        echo $i
    done
}

count 10
{% endhighlight %}

첫번째 인자만 가지고 오고 싶으면 위와 같이 입력한다.

{% highlight bash %}
printall() {
    local args=("$@")
    for (( i=0; i<$#; i++))
    do
        printf "args %d : %s\n" "$i" "${args[$i]}"
    done
}

printall "hello" "world" "!!!"
{% endhighlight %}

index 와 함께 출력하고 싶다면 위와 같이 입력해주면 된다. 이때 `$@` 를 그대로 배열로 보고 `printf` 에 적용하면 `"${@[$i]}"` 의 파싱이 안된다고 한다. 따라서 local 로 선언하여 배열로 선언해주고 사용하는 것이 바람직하다.

{% highlight bash %}
myfunc() {
    return 5
}

myfunc
echo $?   # ← 종료 상태 코드
{% endhighlight %}

함수의 반환값은 **종료 코드**이다. 종료코드는 `$?` 로 조회할 수 있다. 종료코드는 0-255 까지의 값을 가지며, 0이 정상적인 종료 코드, 나머지는 전부 실패 코드이다. 만약 255 를 넘어서는 숫자가 입력된다면 `mod 256` 연산을 통해 조정된다.

#### 스크립트 모듈화

`.sh` 파일의 코드가 되게 길어지면 이는 유지 보수가 어려워질 것이다. 파일을 나눠서 이를 관리할 수 있으며, 각 파일에서는 `bash <파일명>` 을 호출하거나 source 명령어를 통해서 혹은 `. <파일명>.sh` 도 가능하다.

{% highlight text %}
project/
 ├── utils.sh
 ├── config.sh
 └── main.sh
{% endhighlight %}

위와 같이 파일들이 있다고 치자.

{% highlight bash %}
### utils.sh
#!/bin/bash

log() {
    echo "[LOG] $1"
}

sum() {
    echo $(( $1 + $2 ))
}

### config.sh
API_URL="https://myapi.com"
TOKEN="ABCDEF12345"

### main.sh
#!/bin/bash

# 모듈 불러오기
source ./utils.sh
source ./config.sh

log "스크립트 시작"
echo "API: $API_URL"
echo "Sum: $(sum 10 20)"
{% endhighlight %}

`source` 를 import 와 동일하게 보면 되겠다. 이때 중요한 것은 상대/절대 경로를 잘 써야한다.

{% highlight bash %}
source "$(dirname "$0")/utils.sh"
{% endhighlight %}

위 방식으로 스크립트 어떤 디렉토리에서 실행하든 간에 스크립트 위치 기준으로 모듈을 로드하게 해준다. 이때 주의할 점은 source 된 파일은 현재 shell 에 변수/함수를 그대로 등록해버리기 때문에 모듈별 이름이 충돌 가능하며, 가능하면 변수는 local, 함수는 prefix (접두사, 에를 들어 `(파일명)_(함수명)`) 를 사용하도록 한다.

또한 변수만 모아놓은 파일(`.conf`)를 선언할 수 있다. 일반적으로 설정값이나 환경정보/옵션/경로 등등을 저장할 수 있는 텍스트 기반 설정파일이며, 거의 모든 운영체제, 서버, 네트워크 시스템, 어플리케이션 등등이 이 `.conf` 파일을 통해 설정을 읽어들인다.

- `/etc/nginx/nginx.conf`
- `/etc/apache2/apache2.conf`
- `/etc/my.cnf`
- `/etc/redis/redis.conf`
- `/etc/systemd/system/*.service` <- INI 형식

일반적으로 conf 파일은 그냥 텍스트이며 설정 파일로 JSON, INI, 다양한 Key-Value 형식 등등이 사용된다. 어떤걸 쓰든 자기 마음이다.

**스크립트 작성 베스트 프랙티스**

{% highlight bash %}
#!/bin/bash  
#
# backup-database.sh - 데이터베이스 백업 스크립트
# 작성자: 홍길동
# 작성일: 2025-03-09
# 용도: 매일 오전 2시 데이터베이스 백업
#
# 사용법: ./backup-database.sh [database_name]
#

set -euo pipefail  # 안전한 스크립트 실행

# 환경 변수로 디버그 모드 제어
if [ "${DEBUG:-0}" = "1" ]; then
    set -x  # 디버그 모드 활성화
fi

# 스크립트가 있는 디렉토리 경로 얻기
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 설정 파일 로드
source "$SCRIPT_DIR/config.sh"
{% endhighlight %}

- `set -e`: 어떤 명령이더라도 에러가 발생(즉, 종료 코드가 0이 아님)하면 즉시 스크립트를 종료한다
- `set -u`: 정의되지 않은 변수를 사용하면 에러로 처리하고 종료한다
    - 기본 bash 에서는 정의되지 않은 변수는 빈 문자열로 인식한다.
- `set -o pipefail`: 어느 한 명령어라도 실패하면 전체 실패로 간주한다.
- `${DEBUG:-0}`: 값이 없으면 기본값 0으로 설정
- `${BASH_SOURCE}`: 예약된 특수 변수이며, bash 애서 제공하는 읽기 전용 내장 배열이다.
    - 첫번째(0-index) 에 스크립트 파일 경로가 들어있다.
    - 두번째(1-index) 에 source 로 불러온 상위 파일이 있다
    - 세번째(2-index): 또 상위 파일..
    - 즉 호출 스택의 파일명이 들어가 있다.

### 입출력과 파일 처리

#### 표준 입출력

표준 입출력은 프로그램이 실행될 때 기본적으로 연결되는 3가지 데이터 스트림을 일컫는다. 이들은 프로그램과 외부 환경이 데이터를 주고받는 기본 통로를 말하며

- STDIN(0)
- STDOUT(1)
- STDERR(2)

세 가지 기본 데이터 스트림이 있다.

#### stdin, stdout, stderr

프로그램이 기본적으로 입력을 받아들이는 통로로 STDIN 이 있다.

**STDIN**

기본적으로 키보드 입력이 여기에 연결되며, 스트림 번호는 0번으로 지정되어 있다.

{% highlight bash %}
read name
echo "이름은 $name 입니다"
{% endhighlight%}

또는 파일에서 입력을 받는 형태

{% highlight bash %}
cat < input.txt
{% endhighlight %}

**STDOUT**

프로그램이 정상적으로 출력하는 데이터 통로이며, 기본적으로 터미널 화면에 연결된다.

{% highlight bash %}
echo "Hello"
echo "Hello" > out.txt
{% endhighlight %}

**STDERR**

오류 메시지를 출력하는 전용 통로이며, STDOUT 과는 분리되어 있다. 오류 메시지와 일반 메시지를 구분하기 위해서이다.

{% highlight bash %}
ls missingfile 2> error.log
{% endhighlight %}

여기서 화살표를 쓰는 것을 볼 수 있는데 **리다이렉션**이라고 하며, 이를 살펴보자.

#### 리다이렉션

`>`: STDOUT 로 파일로 덮어쓰기
`>>`: STDOUT 로 파일에서 이어쓰기(append)
`<`: STDIN 로 파일에서 가져오기
`2>`: STDERR 만 파일로 기록
`&>`: STDOUT + STDERR 을 모두 리다이렉션
`2>&1`: STDERR 을 STDOUT 으로 합치기(정상 출력과 오류 출력 모두 동일시)

> `&> file` 와 `> file 2>&1` 는 동일한 기능이지만, 전자는 Bash 전용으로 더 간단하게 리다이렉션 가능하고, `> file 2>&1` 는 POSIX 호환이 되겠다.

#### grep

해당 명령은 자주 쓰일 일이 많을텐데, 텍스트 필터링 전용으로 쓰이며, 패턴을 검색할 수 있다. 기능은 특정 문자열이나 정규식 패턴이 포함된 행을 출력한다.

{% highlight bash %}
# example.txt 에서 "error" 포함된 행 찾기
grep "error" example.txt

# 대소문자 구분 없이 검색
grep -i "error" example.txt

# 행 번호 출력
grep -n "error" example.txt
{% endhighlight %}

#### awk

컬럼 단위로 데이터를 처리할 때 강력하며, 기본 구조는 `awk '패턴 {액션}' <file>` 로 쓰인다. 이는 직접 해보는 것이 빠르다.

{% highlight bash %}
# 공백 기준으로 2번째 컬럼 출력
awk '{print $2}' data.txt

# 조건부 출력: 2번째 컬럼이 100 이상인 행
awk '$2 >= 100 {print $0}' data.txt
{% endhighlight %}

> csv 파일, 로그 파일 처리에 자주 사용된다. `$0` 은 전체 열을 의미한다.

#### sed

Stream Editor 의 약자이고, 텍스트 파일이나 파이프 입력을 라인 단위로 수정, 치환 삭제 할 때 사용하는 강력한 도구이다.

{% highlight bash %}
sed '명령' 파일
{% endhighlight %}

위가 문법이며 다음 형태로 많이 쓰인다.

{% highlight bash %}
sed 's/old/new/' file         # 첫 번째 old만 치환
sed 's/old/new/g' file        # 해당 라인의 old 모두 치환

sed '3d' file        # 3번째 라인 삭제
sed '1,5d' file      # 1~5번째 라인 삭제

sed -n '1,5p' file   # 1~5 라인 출력

sed -i 's/test/TEST/g' file   # 파일을 직접 수정
{% endhighlight %}

#### cut

cut 은 텍스트에서 특정 필드(Field) 또는 문자 범위만을 잘라낼 때 사용한다.

{% highlight bash %}
cut -d ':' -f 1 /etc/passwd   # 1번째 필드 출력
cut -d ':' -f 1,3 /etc/passwd # 1, 3번째 필드 출력
{% endhighlight %}

`-d` 는 `delimiter` 이다.

{% highlight bash %}
cut -c 1-5 file     # 1~5번째 문자 출력
cut -c 3- file      # 3번째 문자부터 끝까지
{% endhighlight %}

#### sort

파일 또는 파이프 입력을 오름차순/내림차순으로 줄 기준 정렬한다.

{% highlight bash %}
sort file            # 기본 오름차순
sort -r file         # 내림차순, reverse

sort -k 2 file       # 2번째 컬럼 기준 정렬
sort -k 2 -n file    # 2번째 컬럼 숫자 정렬
sort -t ',' -k 3 csv.csv # CSV에서 3번째 컬럼 정렬
{% endhighlight %}

`-k` 를 column 으로 인식하고, t를 통해 구분자를 바꿀 수 있다.

#### uniq

uniq 는 연속된 line 끼리 비교하여 중복되면 제거한다. 일반적으로 반드시 sort 와 함께 사용한다.

{% highlight bash %}
sort names.txt | uniq
{% endhighlight %}

**완전 정렬 + 카운트 + 내림차순 조합**
{% highlight bash %}
sort file | uniq -c | sort -nr
{% endhighlight %}

#### tr

transpose 약자인 듯하다.

{% highlight bash %}
echo "hello world" | tr 'a-z' 'A-Z'
echo "a b c" | tr ' ' ','

# --digit
echo "abc123" | tr -d '0-9'

# --squeeze
echo "hello     world" | tr -s ' '
# => "hello world"
{% endhighlight %}

### 스크립트 고급 기능

#### 명령어 치환과 프로세스 치환

명령어 치환은 명령어 실행 결과를 문자열처럼 다른 명령어 안에서 사용하는 방식이며, 명령어의 출력값을 변수처럼 취급할 수 있다.

{% highlight bash %}
# $(command/function) = `command`

TODAY=$(date +%Y-%m-%d)
echo $TODAY
{% endhighlight %}

프로세스 치환은 Bash 에서만 지원되는 고급 기능이며, 명령어의 출력 또는 입력을 파일처럼 취급할 수 있게 한다.

{% highlight bash %}
# <(command)

diff <(ls /etc) <(ls /usr)
{% endhighlight %}

이전에 리다이렉션 기능과 같은 의미를 담는다. 위는 입력을 임시 파일처럼 읽기만 하는 용도로 쓸 수 있고 `diff tmp1 tmp2` 와 같게 되며, 입력 프로세스 치환은 이런 임시 파일을 만들 필요가 없게 한다.

{% highlight bash %}
echo "hello" > >(sed 's/hello/HELLO/')
{% endhighlight %}

echo 의 출력을 sed 로 보내게 된다. 이때 `|` 와 유사하지 않나 생각할 수 있는데, 프로세스 치환은 특수 파일을 생성하게 된다. 보통 `/dev/fd/64` 과 같은 파일 디스크립터를 만들고 프로세스 치환은 임시파일이 아닌 파일 디스크립터를 통해 데이터를 전달하게 된다.

#### 배열과 문자열 고급 처리

배열에서 특정 구간만을 빼오도록 처리할 수 있는 슬라이싱 기능을 제공한다.

{% highlight bash %}
FRUITS=("apple" "banana" "cherry")

# ${array[@]:offset:length}

echo ${FRUITS[@]:1:2}  # banana cherry
{% endhighlight %}

이때 폐구간임을 주의하자

{% highlight bash %}
# 요소 추가
FRUITS+=("grape")

# 요소 삭제
unset FRUITS[1]
{% endhighlight %}

위에서 안다룬 `*` 도 보자. bash 에서는 `join()` 함수는 없지만, IFS 라는 특수 변수를 바꿔주면 구분자를 변경시킬 수 있다.

{% highlight bash %}
FRUITS=("apple" "banana" "cherry")

IFS=','   # 구분자 지정
JOINED="${FRUITS[*]}"
echo "$JOINED"
{% endhighlight %}

`*` 를 쓰면 배열이 아닌 문자열로 받아올 수 있다. 이때 배열의 구분자가 띄어쓰기로 되어있는게 `,` 로 바뀌게 된다.

#### 정규식 사용

정규식은 `[[ string =~ regex ]]` 의 문법으로 사용하며, 캡처 그룹 추출을 하게 된다. 캡처 그룹의 결과는 `BASH_REMATCH` 배열에 저장한다.

- BASH_REMATCH[0]: 전체 매칭
- BASH_REMATCH[1..n]: 캡처 그룹들

> regex를 변수로 줄 때는 따옴표를 주의해야 한다.  
> 올바른 예: [[ $s =~ $re ]]

#### 날짜/시간 처리 (date, sleep)

date 는 +와 함께 원하는 포맷의 날짜와 시간을 출력하도록 하는 함수이다.

{% highlight text %}
date +%s
date +%s%N # 나노초
date '+%Y-%m-%d %H:%M:%S'
{% endhighlight %}

sleep 함수는 몇 초 동안 해당 프로세스를 대기할 것인지를 정한다.

#### trap 과 시그널 처리

Bash 스크립트 실행 중 특정 시그널(Signal) 이 발생했을 때, 그 시그널을 가로채서(Trap) 지정한 명령을 실행하도록 하는 기능이다.

**특정 시그널을 잡아서 처리**
{% highlight bash %}
trap "commands" SIGNAL
{% endhighlight %}

> 시그널이 들어오면 commands 실행

**여러 시그널을 한 번에 처리**
{% highlight bash %}
trap "commands" SIGINT SIGTERM
{% endhighlight %}

**트랩 해제**
{% highlight bash %}
trap - SIGNAL
trap -p # 설정된 트랩 확인
{% endhighlight %}

{% highlight bash %}
#!/bin/bash

cleanup() {
    echo "⛔ Ctrl+C 감지! 임시 파일 삭제 중..."
    rm -f /tmp/tempfile
    echo "정리 완료."
}

trap cleanup SIGINT

echo "임시 파일 생성..."
touch /tmp/tempfile

echo "5초 동안 대기... (Ctrl+C 눌러봐)"
sleep 5

echo "완료"
{% endhighlight %}

### 자동화 및 실용 예제

#### 백업 스크립트

중요한 파일 / 디렉토리를 압축하여 날짜 기준으로 백업하는 자동화 스크립트이다.

{% highlight bash %}
#!/bin/bash

set -euo pipefail

SOURCE_DIR="/var/www/project"
BACKUP_DIR="/backup"

DATE=$(date +"%Y-%m-%d_%H-%M-%S")

mkdir -p "$BACKUP_DIR"

# gzip 형태로 압축
tar -czf "${BACKUP_DIR}/project_${DATE}.tar.gz" "$SOURCE_DIR"

echo "[Backup Completed] ${BACKUP_DIR}/prroject_${DATE}.tar.gz"
{% endhighlight %}

#### 배치 작업(cron) 연동

Cron 데몬이라고도 불리며, 크론은 시스템 부팅 시 자동 실행되는 명령들이다. 보통 `/var/log/cron` 등에 로그를 기록하게 된다.

**Crontab 파일**
- 개별 사용자 또는 시스템 전체가 사용하는 스케줄 정의 파일
- 사용자별 위치: `/var/spool/cron/<username>`
- 시스템 전체: `/etc/crontab`

{% highlight bash %}
crontab -l # 확인
crontab -e # 수정
crontab -r # 삭제
{% endhighlight %}

crontab -e 를 통해서 다음 형식을 입력할 수 있다.

{% highlight text %}
*    *    *    *    *
분   시   일   월   요일
{% endhighlight %}

**각 필드 설명**
- *: 모든 값
- ,: 여러 값
- -: 범위
- /: 주기적 실행

**요일 숫자**
- 0 또는 7: 일요일
- 1: 월요일

**매 1분마다 실행**
{% highlight text %}
* * * * * /path/to/script.sh
{% endhighlight %}

**매일 3시 30분에 실행**
{% highlight text %}
30 3 * * * /path/to/script.sh
{% endhighlight %}

**월-금, 평일 오전 9시 실행**
{% highlight text %}
0 9 * * 1-5 /path/to/script.sh
{% endhighlight %}

#### 시스템 점검 스크립트

{% highlight bash %}
# CPU 사용률 확인
top -bn1 | grep "Cpu(s)" | awk '{print $2}'

# 메모리 사용률 확인
free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}'

# 디스크 사용률 확인
df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1
{% endhighlight %}

#### 로그 분석 자동화

{% highlight bash %}
#!/bin/bash

LOG_FILE="/var/log/app.log"
OUTPUT="/var/log/app_error_summary.txt"
KEYWORD="ERROR"

grep "$KEYWORD" "$LOG_FILE" > /tmp/error_lines.log

ERROR_COUNT=$(wc -l < /tmp/error_lines.log)

echo "=== Error Summary ===" > "$OUTPUT"
echo "Date: $(date)" >> "$OUTPUT"
echo "Keyword: $KEYWORD" >> "$OUTPUT"
echo "Error Count: $ERROR_COUNT" >> "$OUTPUT"

# 필요 시 알림 전송
# curl -X POST -H "Content-Type: application/json" -d "{\"count\":$ERROR_COUNT}" https://notify.example.com
{% endhighlight %}

#### 서버 상태 모니터링 스크립트

{% highlight bash %}
#!/bin/bash

LOG_FILE="/var/log/monitor.log"

# CPU 사용률 확인
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)

# 디스크 사용률 확인
DISK=$(df -h / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

# 임계값 초과 시 알림
if [ $(echo "$CPU > 80" | bc) -eq 1 ]; then
    echo "[$(date)] WARNING: CPU 사용률 ${CPU}%" >> "$LOG_FILE"
fi

if [ $DISK -gt 90 ]; then
    echo "[$(date)] WARNING: 디스크 사용률 ${DISK}%" >> "$LOG_FILE"
fi
{% endhighlight %}

#### 배포/빌드 자동화 스크립트

{% highlight bash %}
#!/bin/bash
set -euo pipefail

# 설정
BACKUP_DIR="/backup"
LOG_FILE="/var/log/backup.log"
RETENTION_DAYS=30
DB_NAME="production_db"
DB_USER="backup_user"
DB_PASS="secure_password"  # 주의: 실제 환경에서는 환경변수나 별도 설정 파일 사용 권장

!!! danger "보안 경고: 비밀번호 평문 저장"
    **스크립트에 비밀번호를 평문으로 저장하는 것은 매우 위험합니다!**

    **더 안전한 방법:**
    1. **환경 변수 사용:**
       ```bash
       # 환경 변수에서 읽기
       DB_PASS="${DB_PASSWORD}"

       # 실행 시 환경 변수 전달
       DB_PASSWORD="mypass" ./backup.sh
       ```

    2. **별도 설정 파일 사용 (권한 제한):**
       ```bash
       # /etc/backup.conf 파일에 저장 (600 권한)
       source /etc/backup.conf

       # 설정 파일 예시
       # DB_PASS="secure_password"

       # 파일 권한 설정
       chmod 600 /etc/backup.conf
       chown root:root /etc/backup.conf
       ```

    3. **비밀번호 프롬프트:**
       ```bash
       # 실행 시 비밀번호 입력 받기
       read -s -p "데이터베이스 비밀번호: " DB_PASS
       echo
       ```

    4. **Secrets 관리 도구 사용:**
       - AWS Secrets Manager
       - HashiCorp Vault
       - Kubernetes Secrets

# 로깅 함수
log() {
    local level=$1
    shift
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] [$level] $*" | tee -a "$LOG_FILE"
}

# 에러 처리
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# 정리 함수
cleanup() {
    if [ -f /tmp/backup.lock ]; then
        rm -f /tmp/backup.lock
    fi
}

trap cleanup EXIT

# 중복 실행 방지
if [ -f /tmp/backup.lock ]; then
    error_exit "백업이 이미 실행 중입니다"
fi

touch /tmp/backup.lock

log "INFO" "백업 프로세스 시작"

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR" || error_exit "백업 디렉토리 생성 실패"

# 날짜별 서브 디렉토리
TODAY=$(date +%Y%m%d)
BACKUP_PATH="$BACKUP_DIR/$TODAY"
mkdir -p "$BACKUP_PATH"

# 데이터베이스 백업
log "INFO" "데이터베이스 백업 시작"
if mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_PATH/database.sql"; then
    log "INFO" "데이터베이스 백업 완료"
else
    error_exit "데이터베이스 백업 실패"
fi

# 파일 백업
log "INFO" "파일 백업 시작"
if tar -czf "$BACKUP_PATH/files.tar.gz" /var/www/html; then
    log "INFO" "파일 백업 완료"
else
    error_exit "파일 백업 실패"
fi

# 오래된 백업 삭제
log "INFO" "오래된 백업 정리 시작"
find "$BACKUP_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;
log "INFO" "오래된 백업 정리 완료"

# 백업 크기 확인
BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
log "INFO" "백업 완료 - 크기: $BACKUP_SIZE"

log "INFO" "백업 프로세스 종료"
{% endhighlight %}
