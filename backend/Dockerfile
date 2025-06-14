FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S apexx -u 1001

# Change ownership
RUN chown -R apexx:nodejs /app
USER apexx

EXPOSE 3000
CMD ["npm", "start"]
