FROM denoland/deno:latest AS builder

# Set up the working directory and permissions
WORKDIR /app
RUN chown deno:deno /app

# Copy source files and set ownership at the same time
COPY --chown=deno:deno . .
COPY --chown=deno:deno ./.env.development .env.development


# Switch to the non-root user
USER deno


RUN deno task build




FROM rust:slim-bullseye AS rust_builder

# Set the working directory.
WORKDIR /app


# Copy the dependency manifest.
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock



# Now copy the actual source code and build the application.
COPY ./src ./src
COPY ./Rocket.toml ./Rocket.toml
RUN cargo build --release

# Stage 3: Create the final, minimal production image
# Use a minimal "distroless" base image for a small and secure final container.
FROM gcr.io/distroless/cc-debian12

# Set the working directory.
WORKDIR /app

# Copy the static frontend assets from the 'builder' stage.
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/game/starrunner ./dist/starrunner

# Copy the compiled Rocket server binary from the 'rust_builder' stage.
COPY --from=rust_builder /app/target/release/profile_frontend .
COPY --from=rust_builder /app/Rocket.toml ./Rocket.toml



# Expose the port Rocket will run on.
EXPOSE 8000

# The command to run the server when the container starts.
CMD ["./profile_frontend"]
