FROM denoland/deno:latest

# Setup the 'Deno' user (and group)

RUN useradd -mU deno

# Set up the working directory and permissions
WORKDIR /app
RUN chown deno:deno /app

# Copy source files and set ownership at the same time
COPY --chown=deno:deno . .

# Switch to the non-root user
USER deno


CMD ["deno", "task", "dev"]
