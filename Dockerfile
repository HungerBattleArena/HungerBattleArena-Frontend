FROM node:22.12.0 AS build

ARG ENVIRONMENT
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# prepare nginx
FROM nginx:1.29.0-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]