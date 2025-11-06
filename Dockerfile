# Use Node.js 24
FROM node:24-alpine

# Install MySQL server and client
RUN apk add --no-cache mysql mysql-client

# Initialize MySQL data directory
RUN mkdir -p /run/mysqld && \
    chown -R mysql:mysql /run/mysqld && \
    mysql_install_db --user=mysql --datadir=/var/lib/mysql

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application files
COPY . .

# Build Next.js application
RUN yarn build

# Create directory for MySQL data
RUN mkdir -p /var/lib/mysql && chown -R mysql:mysql /var/lib/mysql

# Set default environment variables
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_USER=vehicleuser
ENV DB_PASSWORD=vehiclepass
ENV DB_NAME=vehicle_rental
ENV ADMIN_USERNAME=admin
ENV ADMIN_PASSWORD=admin123
ENV NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NODE_ENV=production

# Expose ports (3000 for Next.js, 3306 for MySQL)
EXPOSE 3000 3306

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["yarn", "start"]
