set dotenv-filename := ".env"

default:
	@just --list

[no-exit-message]
install:
	#!/usr/bin/env bash
	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
	nvm install 14
	npm install -g yarn
	yarn install

install-local: install
	#!/usr/bin/env bash
	sudo apt install redis-server
	if [ ! -f /usr/bin/faktory ]; then
		wget https://github.com/contribsys/faktory/releases/download/v1.9.0/faktory_1.9.0-1_amd64.deb
		sudo dpkg -i faktory_1.9.0-1_amd64.deb
	fi
	echo "✅ Faktory installed"
	sudo -u postgres sh -c 'createdb app_development'
	sudo -u postgres psql -d app_development -c  "GRANT ALL ON SCHEMA public TO root;"
	sudo -u postgres psql -d app_development -c  "ALTER USER root WITH SUPERUSER;"
	yarn db:migrate

build *arch:
    ./docker.sh build {{arch}}

push *arch:
    ./docker.sh push {{arch}}

docker +args:
    ./docker.sh {{args}}

up +ARGS:
	docker compose up -d {{ARGS}}

ps:
	docker compose ps

stop APP:
	docker compose stop {{APP}}

create-api-key:
	#!/usr/bin/env bash
	printf "app-%s\n" "$(head -c 48 /dev/urandom | base64 )"

import FILE:
	#!/usr/bin/env bash
	container_id=$(docker compose ps -q db 2>&1 | grep -v "level=warning msg=")
	echo $container_id
	docker cp {{FILE}} $container_id:/db.dump
	echo "\nConnecting to container, run this command:"
	echo ""
	echo "psql -U postgres -d app_development < /db.dump"
	echo ""
	docker exec -it $container_id bash

connect-db:
	#!/usr/bin/env bash
	container_id=$(docker compose ps -q db 2>&1 | grep -v "level=warning msg=")
	echo $container_id
	echo "\nConnecting to container, run this command to access db:"
	echo ""
	echo "psql -U postgres -d ${DB_NAME}"
	echo ""
	docker exec -it $container_id bash
