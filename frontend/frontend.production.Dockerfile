FROM rust:slim AS builder

RUN apt-get -y update && apt-get -y upgrade

# Install curl as the Deno installer uses it when Python isn't available (alternatively we could install Python)
RUN apt-get install -y curl

# # Making sure we have the toolchain for installing Rust + building Deno from source

RUN apt-get install -y build-essential && apt-get install -y cmake && apt-get install -y clang

# Setup the 'Deno' user (and group)

RUN useradd -mU deno

# Build Deno from source 

RUN cargo install --root /home/deno/ deno --locked

# Update the path

ENV PATH=$PATH:/home/deno/bin

# Limit only the 'Deno' user to read and execute Deno:

RUN chmod 540 /home/deno/bin/deno && chown deno:deno /home/deno/bin/deno

# Set up the working directory and permissions
WORKDIR /app
RUN chown deno:deno /app

# Copy source files and set ownership at the same time
COPY --chown=deno:deno . .

# Switch to the non-root user
USER deno

RUN deno task build


FROM nginx:1.27-alpine


COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
