# base node image
FROM node:22-bookworm-slim as base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates

# Build the app
FROM base as build
ARG COMMIT_SHA
ENV COMMIT_SHA=$COMMIT_SHA
WORKDIR /myapp
ADD package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# prisma files will be generated in the production image, see below
ADD . .
# Mount the secret and set it as an environment variable and run the build
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    pnpm prisma generate && \
    pnpm run build

# Setup production node_modules
FROM base as production-deps
ENV NODE_ENV=production
WORKDIR /myapp
ADD package.json pnpm-lock.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Finally, build the production image with minimal footprint
FROM base
ENV FLY="true"
ENV PORT="8080"
ENV NODE_ENV="production"
WORKDIR /myapp
COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma
COPY --from=build /myapp/build /myapp/build
ADD . .
CMD ["litefs", "mount"]
