# Distributed Rate Limiting Middleware

A distributed rate limiting middleware built using Node.js, Redis, and Docker to protect APIs from abuse and enforce fair usage across user tiers.

The system uses the Token Bucket algorithm with Redis as a centralized store, enabling consistent rate limits across multiple servers behind a load balancer.

## Features

Tier-based rate limiting (Basic, Pro users)

Distributed request tracking using Redis

Token Bucket algorithm for burst traffic handling

Stateless middleware supporting horizontal scaling

Dockerized setup for easy deployment

Low-latency request validation using Redis

## Rate Limiting Strategy

###This project implements the Token Bucket Algorithm.

Tier	Limit
Basic	10 : requests/min
Pro	100 : requests/min

###Workflow

Each incoming request consumes a token.

If tokens are available → request allowed.

If the bucket is empty → request rejected.

Tokens refill over time based on the configured rate.

This allows short bursts of traffic while enforcing long-term limits

## Tech Stack

Node.js

Express.js

Redis

Docker

Nginx / Load Balancer

## Running with Docker

### Start the services using Docker Compose:
```

docker-compose up --build

```

This will start:

Node.js API server

Redis container
```

Example docker-compose.yml
version: "3"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379

  redis:
    image: redis:7
    ports:
      - "6379:6379"

```
## API Usage

```
const rateLimiter = require("./middleware/rateLimiter");

app.use("/api/basic", rateLimiter("basic"));
app.use("/api/pro", rateLimiter("pro"));
Example Response (Rate Limit Exceeded)
{
  "error": "Rate limit exceeded. Please try again later."
}

```
## HTTP status code:
```
429 Too Many Requests
```
## Future Improvements

API key-based rate limiting

Redis cluster support

Rate limit analytics dashboard

Monitoring with Prometheus/Grafana

## Author

Atul Pal

GitHub: https://github.com/atulpal02

LinkedIn: https://linkedin.com/in/atulpal02
