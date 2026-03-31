build:
	cd frontend && npm install && npm run build && cd .. && go build -o captura .

dev-backend:
	go run .

dev-frontend:
	cd frontend && npm run dev

clean:
	rm -f captura && rm -rf frontend/dist tmp/
