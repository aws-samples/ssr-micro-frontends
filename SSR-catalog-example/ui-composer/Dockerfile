FROM node:16-alpine

ENV PORT=80

COPY ./ ./

RUN npm ci

EXPOSE 80

CMD ["npm", "start"]