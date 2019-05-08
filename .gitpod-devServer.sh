export URL=$(gp url 8080 | cut -d \/ -f 1-3)
export PATH=$PATH:$(pwd)/node_modules/.bin

qrcode ${URL}
echo Public URL of dev server is: ${URL}

$(sleep 5 && gp preview $(gp url 8080)package.json)

tabris serve -l
