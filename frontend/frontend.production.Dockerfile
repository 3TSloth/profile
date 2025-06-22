FROM denoland/deno:latest AS builder

# Set up the working directory and permissions
WORKDIR /app
RUN chown deno:deno /app

# Copy source files and set ownership at the same time
COPY --chown=deno:deno . .


RUN deno task build


