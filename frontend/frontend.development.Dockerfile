FROM rust:slim

EXPOSE 5178

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

WORKDIR /deno-dir

# Give the 'Deno' user permission/ownership to write within its working directory (deno-dir)

RUN chown deno:deno /deno-dir

# Prefer not to run as root
USER deno

# Copy all source files/app as deno (otherwise it does so as root, losing permissions)
COPY --chown=deno:deno . .


CMD ["deno", "task", "dev"]
