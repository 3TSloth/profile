
FROM rust:slim AS builder

# Install build-time dependencies for Diesel (Postgres)
RUN apt-get update && apt-get install -y libpq-dev build-essential pkg-config && rm -rf /var/lib/apt/lists/*


WORKDIR /rust-dir

# Install diesel_cli for running migrations. This is cached.
RUN cargo install diesel_cli --no-default-features --features postgres

# Create a non-root user to own the files
RUN useradd -mU rusty
RUN chown -R rusty:rusty /usr/local/cargo /usr/local/rustup /rust-dir


USER rusty

# Copy manifests to cache dependencies
COPY --chown=rusty:rusty Cargo.toml Cargo.lock ./

# Build a dummy project to cache dependencies. This is more efficient than `cargo fetch`.
RUN set -e; \
    mkdir src && echo "fn main(){}" > src/main.rs && cargo build --release && rm -rf src



# Copy the actual application source code
COPY --chown=rusty:rusty src ./src
COPY --chown=rusty:rusty migrations ./migrations
COPY --chown=rusty:rusty diesel.toml .
COPY --chown=rusty:rusty Rocket.toml .

# Build the application for release
RUN set -e; \
    echo "--- Starting final cargo build --release ---"; \
    cargo build --release; \
    BUILD_EXIT_CODE=$?; \
    if [ $BUILD_EXIT_CODE -ne 0 ]; then \
    echo "ERROR: cargo build --release failed with exit code $BUILD_EXIT_CODE."; \
    exit $BUILD_EXIT_CODE; \
    fi; \
    echo "--- Finished cargo build --release. Verifying binary ---"; \
    ls -l target/release/; \
    if [ ! -f target/release/profile_backend ]; then \
    echo "ERROR: Compiled binary 'profile_backend' not found in target/release/."; \
    exit 1; \
    fi; \
    echo "--- Binary 'profile_backend' found. Build step successful. ---"


#### ---- Final Runtime Stage ---- ####
# Use a minimal, secure base image
FROM debian:stable-slim

EXPOSE 8000

RUN apt-get update && apt-get install -y libpq5 && rm -rf /var/lib/apt/lists/*


RUN useradd -mU rusty
USER rusty

WORKDIR /app


COPY --from=builder --chown=rusty:rusty /rust-dir/target/release/profile_backend /usr/local/bin/profile_backend



COPY --from=builder --chown=rusty:rusty /usr/local/cargo/bin/diesel /usr/local/bin/diesel

COPY --from=builder --chown=rusty:rusty /rust-dir/diesel.toml .
COPY --from=builder --chown=rusty:rusty /rust-dir/Rocket.toml .
COPY --from=builder --chown=rusty:rusty /rust-dir/migrations ./migrations

EXPOSE 8000

# Set the default command to run the application.
CMD ["/usr/local/bin/profile_backend"]