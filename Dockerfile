FROM node:21-alpine

# RUN addgroup app && adduser -S -G app app
# RUN mkdir /app && chown -R app:app /app
# USER app

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5173 

CMD ["npm", "run", "dev","--","--host","0.0.0.0"]