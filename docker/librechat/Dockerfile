FROM ghcr.io/danny-avila/librechat:v0.8.0

# Optional extra tools copied in by CI or local builds. CI places bundled artifacts into
# .docker/bin (repo root) — these will be copied into the image at /usr/local/bin.
# Local builds will create an empty .docker/bin so COPY succeeds even if no extras are present.
COPY .docker/bin/ /usr/local/bin/
RUN [ -d /usr/local/bin ] && chmod +x /usr/local/bin/* || true
