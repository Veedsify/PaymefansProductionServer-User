# Use a specific version of Bun (e.g., bun:latest)
FROM oven/bun:1 

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb separately to leverage Docker cache
COPY package.json bun.lockb* ./

# Install dependencies with Bun (equivalent to npm install)
RUN bun install 

# Copy the rest of the application code
COPY . .

# Build the application (if needed, Bun has a different build command)
RUN bun run build

# Expose the application port
EXPOSE 3000

# Set default environment variable
ENV NODE_ENV=production

# Start the application with Bun (equivalent to npm start)
CMD ["bun", "start"]
