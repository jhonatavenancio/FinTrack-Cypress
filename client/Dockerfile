# Local-dev container: runs the Vite dev server (HMR-friendly, reads VITE_API_URL at
# container start). For a production static build, add a build stage with
# `npm run build` + a static file server instead of `npm run dev`.
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

EXPOSE 5173

CMD ["npm", "run", "dev"]
