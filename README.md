# Saisei Report Single Page
배포 폴더 경로 -> saisei_report

배포시 아파치 설정 사항 필요

  <VirtualHost *:5000>
               Alias /saisei_report/ /opt/stm/target/files/saisei_report/
               Use StmService http
  </VirtualHost>