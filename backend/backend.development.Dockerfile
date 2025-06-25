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

COPY --chown=rusty:rusty . .


