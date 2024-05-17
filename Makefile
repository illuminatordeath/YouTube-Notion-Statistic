build:
	docker build -t youtnotstat .
run:
	docker run -d -p 8082:80 --name youtnotstat --rm youtnotstat