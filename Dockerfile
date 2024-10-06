# Node.js 최신 LTS 버전 이미지 사용
FROM node:22.8.0-slim

# 앱 디렉토리 생성
WORKDIR /usr/src/app

# package.json과 package-lock.json 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 열기 (웹소켓 포트 예: 3000)
EXPOSE 3000

# 앱 실행
CMD ["npm", "start"]
