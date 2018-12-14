# Saisei Report Single Page

- grunt serve : 테스트
- grunt serve dist : 배포

# 배포시 고려사항
0. 폴더 이름 변경
    saisei_report -> report
1. 배포 폴더 경로 -> /opt/stm/target/files/report

2. 배포시 아파치 설정 사항 필요

  <VirtualHost *:5000>
               Alias /saisei_report/ /opt/stm/target/files/saisei_report/
               Use StmService http
  </VirtualHost>

3. index.html과 saisei_report.js파일에서 경로 변경
    - vi상에서 아래와 같이 경로 변경
    :%s/\/saisei_report\//\/report\//g

