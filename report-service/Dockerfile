FROM golang:alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o report-service main.go

FROM alpine:latest

WORKDIR /app

COPY --from=builder /app/report-service .

EXPOSE 50051

CMD ["./report-service"]