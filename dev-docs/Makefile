SHELL=/bin/bash

all:
	@echo 'chose between one of the following rules:'
	@echo '	make install: will install dependancies for the project'
	@echo '	make dev: will install dependancies and start a development server'
	@echo '	make connect_db: connect to the PostgreSQL db'
	@echo '	make down: will stop the development server'
	@echo '	make rm_db: will remove the db directory (erase all database data)'

install:
	npm install

dev:
	if ! [[ -f .env ]] ; then cp .env.example .env ; fi
	if ! [[ -d db ]]; then mkdir db ; fi
	$(MAKE) install
	docker compose up -d --wait
	docker exec postgres bash -c 'chown -R 0:0 /var/lib/postgresql/data'
	docker exec postgres bash -c 'chmod -R 777 /var/lib/postgresql/data'
	npm run dev -- --port 4343  > dev_server.log 2>&1 &

down:
	docker compose down
	# could be nice to check that the process still exists !
	@set -eux && if [[ $$(ps -Af | grep -e "node.*4343" | wc -l) -ge 4 ]]; then \
		kill $$(ps -Af | grep -e "node.*4343" | awk '{print $$2}' | head -n 1) ; \
	fi

rm_db:
	if [[ -d "${PWD}/db" ]] ; then \
		docker run --rm --mount src=postgres_data,dst=/to_be_deleted busybox 'sh' '-c' 'rm -rf /to_be_deleted/* && chown 0:0 /to_be_deleted' ; \
	fi
	rm ${PWD}/db -rf


connect_db: 
	docker exec -it postgres psql --user=postgres
