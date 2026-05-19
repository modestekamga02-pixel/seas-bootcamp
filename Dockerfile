# Use the official Node.js 20 image as the base
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files first to optimize build caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application code (including your fixed server.js)
COPY . .

# The app listens on port 3000
EXPOSE 3000

# Command to run the application
CMD [ "npm", "start" ]
