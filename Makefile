SHELL := /bin/bash

dev:
	docker compose up

dev-down:
	docker compose down

npm-install:
	docker compose run --rm --no-deps web /bin/sh -c "npm install"

clean:
	rm -rf public/dist
