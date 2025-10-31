FROM nginx:1.25-alpine

# Remove defaults
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/nginx.conf

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy site (single HTML file)
COPY index.html /usr/share/nginx/html/

# Simple 404
RUN echo '<!DOCTYPE html><html><head><title>404</title><style>*{margin:0;padding:0}body{font:18px sans-serif;padding:50px;text-align:center}a{color:#0066cc}</style></head><body><h1>404</h1><p>Not found</p><a href="/">Home</a></body></html>' > /usr/share/nginx/html/404.html

# Permissions and cache directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    mkdir -p /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chmod -R 755 /var/cache/nginx

USER nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
