FROM oven/bun:1.2.18

WORKDIR /app
COPY . .
RUN bun install
