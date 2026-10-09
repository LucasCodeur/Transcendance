all:
	@echo 'chose between one of the following rules:'
	@echo '	make install: will install dependancies for the project'
	@echo '	make dev: will install dependancies and start a development server'
	@echo '	make down: will stop the development server'

install:
	npm install

dev:
	docker compose up -d
	npm run dev -- --port 4343 2> dev_server_errors.log > dev_server.log &

down:
	kill $$(ps -Af | grep -e "node.*4343" | awk '{print $$2}' | head -n 1)
	docker compose down
