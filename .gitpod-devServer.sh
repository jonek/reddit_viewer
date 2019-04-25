export URL=$(gp url 8080 | cut -d \/ -f 1-3)

qrcode ${URL}
echo Public URL of dev server is: ${URL}
tabris serve -l