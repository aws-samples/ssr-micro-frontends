FROM node:19-alpine

RUN adduser -D -u 1001 noroot
RUN su noroot

COPY ./ ./

ENV PORT=80

RUN npm ci

EXPOSE 80

CMD ["npm", "start"]