install:
	poetry install
	cd nextjs-app/ && npm install
	wget https://polybox.ethz.ch/index.php/s/ISAUplTJkO9VGrs/download/download && mv download nextjs-app/public/ && cd nextjs-app/public/ && unzip download && cd ../../

format:
	poetry install
	poetry run isort .
	poetry run black .
	cd nextjs-app/ && prettier components/* helpers/* hooks/* pages/* styles/* views/* --write

deploy:
	wget https://polybox.ethz.ch/index.php/s/ISAUplTJkO9VGrs/download
	mv download nextjs-app/public/ && cd nextjs-app/public/ && unzip download && cd ../ && npm install && npm run build && npm run start

dev:
	cd nextjs-app/ && npm run dev
