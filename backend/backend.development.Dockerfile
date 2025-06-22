FROM rust:slim

# Install build-time dependencies for Diesel (Postgres)
RUN apt-get update && apt-get install -y libpq-dev build-essential pkg-config && rm -rf /var/lib/apt/lists/*

WORKDIR /rust-dir

# Create a non-root user
RUN useradd -mU rusty
RUN chown -R rusty:rusty /rust-dir
USER rusty

# Install diesel_cli
RUN cargo install diesel_cli --no-default-features --features postgres

# Copy manifests and fetch dependencies to a separate layer for caching
COPY --chown=rusty:rusty Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && cargo fetch && rm -rf src


