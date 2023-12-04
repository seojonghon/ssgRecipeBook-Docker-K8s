🐳 한끼얼마 Docker && Kubernetes##🚢
1. 👨‍💻 기존의 한끼얼마 프로젝트 (Front-end, Back-end -> Docker && Kubernetes)
https://github.com/seojonghon/ssg_project_Recipe-web

메인.png

2. 📚프로젝트 시작전/중 주요 개념 정리
로드밸런서 (서버에 가해지는 부하는 분산해 주는 장치 또는 기술을 통칭)
MetalLB : 쿠버네티스 클러스터 내에서 로드 밸런싱을 제공하기 위한 오픈 소스 프로젝트
➡️ 로드밸런서가 존재하지 않으면 Pending 상태가 지속
Redis(DB) : 오픈 소스 인메모리 데이터베이스 시스템
➡️ 키-값(key-value) 저장소 형태의 데이터베이스(키를 사용하여 데이터를 빠르게 검색하고 업데이트할 수 있습니다) +Redis는 캐싱, 실시간 분석, 대기열 관리, 세션 저장, 게임 서버 및 실시간 메시징과 같은 여러 다양한 응용 분야에서 사용되는 강력한 데이터베이스 시스템)
디플로이먼트 : 배포 기능을 세분화 한 것으로 파드와 레플리카셋에 버전 관리 기능을 추가한 것.
➡️단순히 실행시켜야 할 파드 개수를 유지하는 것 뿐만 아니라 앱을 배포할 때 롤링 업데이트 하거나, 앱 배포 도중 잠시 멈췄다가 다시 배포할 수 있습니다
롤링 업데이트 : 소프트웨어 또는 서비스의 새 버전을 이전 버전으로 교체하거나 업그레이드하는 프로세스
3. 시스템 아키텍쳐
k8s아키.PNG

4. 🌏 개발 및 운영 환경
⚙️ 기술 스택
Static Badge Static Badge Static Badge Static Badge Static Badge Static Badge

⌨️ 개발 환경
OS: Static Badge
IDE: Static Badge Static Badge
5. 도커 파일 작성(React, RedisDB, Flask)
5-1 Docker File(React)
⚒️ 빌드 단계 : node 이미지를 기반으로 애플리케이션의 빌드 과정을 수행
FROM node AS build-docker
RUN mkdir /ssg-app
WORKDIR /ssg-app
COPY . .
RUN npm install && npm run build
⏯️실행 단계 : 빌드 결과물을 Nginx 웹 서버에 배포하여 실행
FROM nginx AS run-docker
COPY --from=build-docker /ssg-app/build /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
FROM node AS builded-docker : Node라는 Docker 이미지를 기반으로 새로운 빌드 단계를 생성
RUN mkdir /ssg-app : '/my-app' 디렉토리를 생성합니다.
WORKDIR /ssg-app : 이후의 명령들이 실행되는 작업 디렉토리를 '/ssg-app'으로 설정
. . : Dockerfile이 위치한 디렉토리의 모든 파일과 디렉토리를 현재 작업 디렉토리('/ssg-app')로 복사합니다.
RUN npm install
RUN npm run build : npm 명령어 실행후 빌드
FROM nginx AS run-docker :Nginx라는 Docker 이미지를 기반으로 런타임 단계 생성
/ssg-app/build 디렉터리의 내용을 Nginx의 기본 웹 루트 디렉터리인 /usr/share/nginx/html/ 로 복사
CMD ["nginx", "-g", "daemon off;"] daemon off라는 명령어를 통해 background가 아닌 foreground로 nginx를 실행
Docker ignore 파일 작성
->빌드속도 향상, 불필요한 파일 제외
build
node_modules
App.test.js
logo.svg
reportWebVitals.js
setupTests.js
.gitignore
Dockerfile
package-lock.json
README.md
5-2 Dockerfile(Redis Database)
FROM redis:alpine
COPY ./redis.conf /usr/local/etc/redis/redis.conf
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
COPY ./redis.conf /usr/local/etc/redis/redis.conf : 호스트 시스템의 현재 디렉토리에서 Redis 설정 파일을 컨테이너 내의
/usr/local/etc/redis/ 디렉토리로 복사
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ] : 지정 경로 내에 있는 Redis 서버를 실행
5-3 Docker File(Flask)
WORKDIR /rest-recipe-book
COPY . .
RUN apt-get update -y && \
apt-get install -y python3 python3-pip && \
pip install wheel && \
pip install -r requirements.txt && \
chmod +x app.sh
ENV FLASK_APP=app
ENV FLASK_DEBUG=false
ENV APP_CONFIG_FILE=/rest-recipe-book/config/production.py
CMD ["./app.sh"]
WORKDIR /rest-recipe-book : 작업 디렉터리 설정
COPY . . : 현재 디렉토리의 모든 파일을 컨테이너로 복사
RUN ... : 패키지 설치와 애플리케이션 의존성 설치
ENV ... : 환경 변수 설정
CMD ["./app.sh"] : 애플리케이션 실행
🚢6 Kubernetes 환경
6-1 쿠버테티스 아키텍쳐링


6-2쿠버네티스 실행 환경 구축 :
vagrant up ---->
vagrant ssh master
vagrant@master-node:~$
strictARP 모드를 활성화
->네트워크 보안과 안정성을 높임
kubectl get configmap kube-proxy -n kube-system -o yaml | \ > sed -e "s/strictARP: false/strictARP: true/" | \ > kubectl apply -f - -n kube-system Warning: resource configmaps/kube-proxy is missing the kubectl.kubernetes.io/last-applied-configuration annotation which is required by kubectl apply. kubectl apply should only be used on resources created declaratively by either kubectl create --save-config or kubectl apply. The missing annotation will be patched automatically. configmap/kube-proxy configured
7. DB 매니페스트 파일 작성 및 실행
➡️토큰 값을 물리적 DB에 두면 사용자 편의성이 감소 할 수 있으므로 인 메모리 데이터 서버인 Redis를 도입하여 토큰 값을 사용할 때 빠른 처리가 가능해짐.
7-1. Redis k8s 설계
Deployment
항목	값
API 그룹/버전	apps/v1
리소스 유형	Deployment
디플로이먼트 이름	redis-depolyment
셀렉터로 대상을 지정할 레이블	app: redis
레플리카(파드) 수	1
컨테이너 이름	redis-container
도커허브 이미지 이름	seojonghun/recipe-redis:1.0
컨테이너 포트 설정	containerPort: 6379
Service
항목	값
API 그룹/버전	apps/v1
리소스 유형	Service
서비스 이름	redis-service
셀렉터로 대상을 지정할 레이블	app: redis
서비스 유형	ClusterIP
프로토콜	TCP
서비스 포트	6379
컨테이너 포트 설정	containerPort: 6379
➡️ DB서버는 외부에 노출 시킬 필요가 없으므로 서비스는 ClusterIP로 설정
Redis aml파일 소스코드(Deployment && Service)
##Deployment

apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-depolyment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis-container
        image: seojonghun/recipe-redis:1.0
        ports:
        - containerPort: 6379
        volumeMounts:
        - name: redis-data
          mountPath: /data
    volumes:
    - name: redis-data
      emptyDir: {}
      
---
## Service

apiVersion: v1
kind: Service
metadata:
  name: redis
  labels:
    app: redis
spec:
  selector:
    app: redis
  ports:
  - name: redis
    protocol: TCP
    port: 6379
    targetPort: 6379
  type: ClusterIP
7-2 로드밸런싱을 하기위해 metalb 설치
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.11/config/manifests/metallb-native.yaml
kubectl create configmap backend --from-literal=REDIS_HOST=172.17.63.144 <-- 레디스클러스터IP
8. 백엔드 매니페스트 파일 작성 및 실행
8-1. Back-end k8s 설계
Deployment
항목	값
API 그룹/버전	apps/v1
리소스 유형	Deployment
디플로이먼트 이름	flask-backend-deployment
셀렉터로 대상을 지정할 레이블	app: app: flask-backend-app
레플리카(파드) 수	5
컨테이너 이름	flask
도커허브 이미지 이름	seojonghun/ssg_flask_backend:3.0
컨테이너 포트 설정	containerPort: 5000
Service
항목	값
API 그룹/버전	v1
리소스 유형	Service
서비스 이름	backend-lb
셀렉터로 대상을 지정할 레이블	app: app: flask-backend-app
서비스 유형	LoadBalancer
서비스 포트	5000
컨테이너 포트 설정	5000
프로토콜	TCP
Back-end-lb yaml파일 소스코드(Deployment && Service)
##Service

apiVersion: v1
kind: Service
metadata:
  name: backend-lb
spec:
  selector:
    app: rest-flask-backend-app
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000
  type: LoadBalancer
	loadBalancerIP: 10.0.0.3
---

## Deployment

apiVersion: apps/v1
kind: Deployment
metadata:
  name: rest-flask-backend-deployment
spec:
  selector:
    matchLabels:
      app: rest-flask-backend-app
  replicas: 5
  template:
    metadata:
      labels:
        app: rest-flask-backend-app
    spec:
      containers:
      - name: flask
        image: seojonghun/ssg_flask_backend:3.0
        env:
          - name: REDIS_HOST
            valueFrom:
              configMapKeyRef:
                name: backend
                key: REDIS_HOST
        ports:
        - containerPort: 5000
          protocol: TCP
9. Front-end 매니페스트 파일 작성 및 실행
9-1. Front-end k8s 설계
Deployment
항목	값
API 그룹/버전	apps/v1
리소스 유형	Deployment
디플로이먼트 이름	react-frontend-deployment
셀렉터로 대상을 지정할 레이블	app: react-frontend-app
레플리카(파드) 수	1
컨테이너 이름	react
도커허브 이미지 이름	image: seojonghun/:2.0
컨테이너 포트 설정	containerPort: 80
Service
항목	값
API 그룹/버전	v1
리소스 유형	Service
서비스 이름	frontend-lb
셀렉터로 대상을 지정할 레이블	app: react-frontend-app
서비스 유형	LoadBalancer
서비스 포트	80
컨테이너 포트 설정	80
프로토콜	TCP
다단계 도커 빌드로 인해 nginx 포트인 80번을 targetPort로 설정 해야 한다.
Front-end-lb yaml파일 소스코드(Deployment && Service)
## Deployment

apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: react-frontend-app
  template:
    metadata:
      labels:
        app: react-frontend-app
    spec:
      containers:
      - name: react
        image: seojonghun/:2.0
        ports:
        - containerPort: 80

---
## service

apiVersion: v1
kind: Service
metadata:
  name: frontend-lb
spec:
  selector:
    app: react-frontend-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 80
  type: LoadBalancer
	loadBalancerIP: 10.0.0.4

10. 🔧 Issue & Troubleshoo3.2.1.
Nginx
운영 서버의 웹 서버로 Nginx를 설치
비동기 기반 구조라 더 적은 리소스를 사용해서 요청을 처리할 수 있음
Nginx의 설정을 변경
80 포트로 서비스하도록 함
static 경로를 지정해 정적 리소스를 서빙할 수 있도록 함
✅도커나 쿠버네티스 환경에서 리액트부분을 배포할때 nginx를 왜사용하는가?
리버스 프록시 : 클라이언트 요청을 대신 받아 내부 서버로 전달해주는 것
1.정적 파일 서빙 : 리액트 앱은 빌드 과정을 거쳐 정적 파일로 생성되고 이러한 정적파일을 효율적으로 제공
2.리버스 프록시 : nginx는 리버스 프록시로서 역할을 수행합니다, 클라이언트의 요청을 적절한 백앤드 서비스로 라우팅 하고 부하분산을 관리합니다(서버 부하 관리)
3.보안 : nignx는 HTTPS를 통한 트래픽 암호화, IP필터링등 다양한 보안 기능을 제공합니다.
➡️이번 프로젝트에서는 nginx의 정적 파일 서빙 역할만 사용
⚠️ 기존 React 기반으로 도커 파일 작성 후 이미지 생성시 크기가 700MB가 넘어가게 되는 문제발생
✅ 다단계 도커 빌드를 통해 이미지 크기를 175MB 수준으로 줄일 수 있었습니다.

⚠️ denied: requested access to the resource is denied ? 빌드한 이미지가 Dokcer Hub에 푸시안됨 현상
✅ 원인은 Docker 컨테이너에서 변경사항이 발생했는데 Push전에 Commit을 안한게 원인 (변경사항 없을땐 그냥 Push가능)
