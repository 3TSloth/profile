FROM denoland/deno:latest

# Set up the working directory and permissions
WORKDIR /app
RUN chown deno:deno /app

# Copy source files and set ownership at the same time
COPY --chown=deno:deno . .
COPY --chown=deno:deno ./.env.development .env.development

# Switch to the non-root user
USER deno

# Expose the default Vite development port
EXPOSE 5173

# Command to start the Vite development server
CMD ["deno", "task", "dev"]
