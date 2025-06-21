FROM rust:latest

EXPOSE 8000

# Add user 'rusty' and give it control over its own working directory
RUN useradd -mU rusty && mkdir /rust-dir/ && chown rusty:rusty /rust-dir/

USER rusty

WORKDIR /rust-dir/

COPY --chown=rusty:rusty . .

RUN cargo install diesel_cli --no-default-features --features postgres

ENTRYPOINT ["/bin/bash", "-c", "export DATABASE_URL=postgresql://$(cat /run/secrets/db_user):$(cat /run/secrets/db_password)@$(cat /run/secrets/db_name)/postgres && diesel setup && cargo run"] 


