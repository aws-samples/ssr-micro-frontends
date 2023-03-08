FROM --platform=linux/amd64 node:19-bullseye-slim

COPY ./ ./

ENV PORT=80
ENV NODE_ENV="production"

RUN npm ci

EXPOSE 80

CMD ["npm", "start"]