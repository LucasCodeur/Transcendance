SHELL=/bin/bash

all:
	@echo 'chose between one of the following rules:'
	@echo '	make install: will install dependancies for the project'
	@echo '	make start_db: will start the db in its container'
	@echo '	make start: will start a development server'
	@echo '	make dev: start_db + start'
	@echo '	make connect_db: connect to the PostgreSQL db'
	@echo '	make stop_db: will stop the db'
	@echo '	make stop: will stop the development server'
	@echo '	make down: stop_db + stop'
	@echo '	make rm_db: will remove the db directory (erase all database data)'

install:
	npm install

start_db:
	if ! [[ -f .env ]] ; then cp .env.example .env ; fi
	if ! [[ -d db ]]; then mkdir db ; fi
	$(MAKE) install
	docker compose up -d --wait -y
	docker exec postgres bash -c 'chown -R 0:0 /var/lib/postgresql/data'
	docker exec postgres bash -c 'chmod -R 777 /var/lib/postgresql/data'

start:
	npm run dev -- --port 4343  > dev_server.log 2>&1 < /dev/null &


dev:
	$(MAKE) start_db
	$(MAKE) start

stop:
	set -eux && if [[ $$(ps -Af | grep -e "node.*4343" | wc -l) -ge 4 ]]; then \
		kill $$(ps -Af | grep -e "node.*4343" | awk '{print $$2}' | head -n 1) ; \
	fi

stop_db:
	docker compose down

down:
	$(MAKE) stop_db
	# could be nice to check that the process still exists !
	$(MAKE) stop

rm_db:
	if [[ -d "${PWD}/db" ]] ; then \
		docker run --rm --mount src=postgres_data,dst=/to_be_deleted busybox 'sh' '-c' 'rm -rf /to_be_deleted/* && chown 0:0 /to_be_deleted' ; \
	fi
	rm ${PWD}/db -rf


connect_db: 
	docker exec -it postgres psql --user=postgres
