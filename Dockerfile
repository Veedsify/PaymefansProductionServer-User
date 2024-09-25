# Use a specific version of Node.js for consistency
FROM node:20.2.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application (if needed)
RUN npm run build

# Expose the application port
EXPOSE 3000

# Set default environment variable
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
