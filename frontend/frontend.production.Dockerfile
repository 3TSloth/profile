FROM denoland/deno:2.3.6 AS builder

WORKDIR /app


COPY deno.json ./

COPY . .


RUN deno task build

FROM nginx:1.27.5-alpine-slim AS final


# Copy the built assets from the 'builder' stage
COPY --from=builder /app/dist /usr/share/nginx/html

# (Optional but Recommended) Copy a custom Nginx config for single-page apps (SPAs)
# This ensures that refreshing a page on a route like /about doesn't result in a 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 and start Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]