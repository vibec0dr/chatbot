# Use the official Meilisearch image as base
FROM getmeili/meilisearch:v1.22.3

# Copy the configuration file into the container
COPY config.toml /meili_data/config.toml

# Copy the entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Keep tini as PID 1 (from base image) and use your entrypoint
CMD ["/usr/local/bin/entrypoint.sh"]
