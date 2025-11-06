# Docker Setup Guide

This guide explains how to run the Vehicle Rental System using Docker.

## Prerequisites

- Docker installed on your system

## Quick Start

### Option 1: Using Single Docker Container (Recommended)

This runs MySQL and Next.js in a single container:

```bash
# Build the Docker image
docker build -t vehicle-rental-app .

# Run the container
docker run -d -p 3000:3000 -p 3306:3306 \
  --name vehicle-rental \
  vehicle-rental-app

# View logs
docker logs -f vehicle-rental
```

The application will be available at: http://localhost:3000

### Option 2: Using Docker Compose

This will start MySQL and Next.js in separate containers:

```bash
# Build and start containers
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### Option 3: Custom Configuration

Run with custom environment variables:

```bash
docker run -d -p 3000:3000 -p 3306:3306 \
  -e DB_USER=myuser \
  -e DB_PASSWORD=mypassword \
  -e DB_NAME=mydb \
  -e ADMIN_USERNAME=myadmin \
  -e ADMIN_PASSWORD=myadminpass \
  --name vehicle-rental \
  vehicle-rental-app
```

## What Happens Automatically

The Docker container automatically:

1. ✅ Starts MySQL server inside the container
2. ✅ Creates database user and grants privileges
3. ✅ Creates the database if it doesn't exist
4. ✅ Installs dependencies using Yarn
5. ✅ Starts the Next.js server (using yarn start)
6. ✅ Initializes database tables (vehicles, users, admin_users, bookings, sessions)
7. ✅ Seeds initial vehicle data (9 vehicles)
8. ✅ Creates admin user (username: admin, password: admin123)

## Container Management

### View logs
```bash
# Single container
docker logs -f vehicle-rental

# Docker Compose
docker-compose logs -f
```

### Stop container
```bash
# Single container
docker stop vehicle-rental

# Docker Compose
docker-compose down
```

### Remove container
```bash
# Single container (this will delete database data)
docker rm -f vehicle-rental

# Docker Compose (keep volumes)
docker-compose down

# Docker Compose (delete volumes)
docker-compose down -v
```

### Restart container
```bash
# Single container
docker restart vehicle-rental

# Docker Compose
docker-compose restart
```

### Access MySQL inside container
```bash
# Single container
docker exec -it vehicle-rental mysql -u vehicleuser -pvehiclepass vehicle_rental

# Docker Compose
docker exec -it vehicle-rental-mysql mysql -u vehicleuser -pvehiclepass vehicle_rental
```

### Access container shell
```bash
# Single container
docker exec -it vehicle-rental sh

# Docker Compose
docker exec -it vehicle-rental-app sh
```

### Persist MySQL data (Single Container)

To persist data across container restarts, use a volume:

```bash
docker run -d -p 3000:3000 -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  --name vehicle-rental \
  vehicle-rental-app
```

## Environment Variables

The following environment variables can be configured:

### Default Values (Single Container)
- `DB_HOST`: localhost (MySQL runs in same container)
- `DB_PORT`: 3306
- `DB_USER`: vehicleuser
- `DB_PASSWORD`: vehiclepass
- `DB_NAME`: vehicle_rental
- `ADMIN_USERNAME`: admin
- `ADMIN_PASSWORD`: admin123
- `NEXT_PUBLIC_API_URL`: http://localhost:3000
- `NODE_ENV`: production

### Docker Compose Configuration
In `docker-compose.yml`, MySQL and app run in separate containers:

**MySQL Container:**
- `MYSQL_ROOT_PASSWORD`: Root password for MySQL
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Application database user
- `MYSQL_PASSWORD`: Application database password

**Application Container:**
- `DB_HOST`: mysql (service name)
- `DB_PORT`: 3306
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `ADMIN_USERNAME`: Admin panel username
- `ADMIN_PASSWORD`: Admin panel password

## Customization

### Change MySQL Credentials (Single Container)

Pass environment variables when running:

```bash
docker run -d -p 3000:3000 -p 3306:3306 \
  -e DB_USER=newuser \
  -e DB_PASSWORD=newpassword \
  -e DB_NAME=newdatabase \
  --name vehicle-rental \
  vehicle-rental-app
```

### Change MySQL Credentials (Docker Compose)

Edit `docker-compose.yml` and update the environment variables for both services:

```yaml
mysql:
  environment:
    MYSQL_ROOT_PASSWORD: your_root_password
    MYSQL_USER: your_user
    MYSQL_PASSWORD: your_password

app:
  environment:
    - DB_USER=your_user
    - DB_PASSWORD=your_password
```

### Change Admin Credentials

Edit `docker-compose.yml`:

```yaml
app:
  environment:
    - ADMIN_USERNAME=your_admin_username
    - ADMIN_PASSWORD=your_admin_password
```

### Persistent Data

**Single Container:**
By default, data is lost when container is removed. Use a volume to persist:

```bash
docker run -d -p 3000:3000 -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  --name vehicle-rental \
  vehicle-rental-app
```

**Docker Compose:**
MySQL data is stored in a Docker volume named `mysql_data`. This persists across container restarts. To reset the database:

```bash
docker-compose down -v
docker-compose up --build
```

## Ports

- **3000**: Next.js application (HTTP server)
- **3306**: MySQL database

## Troubleshooting

### Container won't start
```bash
# Check logs (single container)
docker logs vehicle-rental

# Check logs (Docker Compose)
docker-compose logs app
docker-compose logs mysql

# Verify container is healthy
docker ps
```

### Database connection issues
```bash
# Test MySQL connection (single container)
docker exec -it vehicle-rental mysql -u vehicleuser -pvehiclepass -e "SELECT 1"

# Test MySQL connection (Docker Compose)
docker exec -it vehicle-rental-app mysql -h mysql -u vehicleuser -pvehiclepass -e "SELECT 1"
```

### MySQL fails to start
```bash
# Remove container and start fresh
docker rm -f vehicle-rental
docker run -d -p 3000:3000 -p 3306:3306 --name vehicle-rental vehicle-rental-app

# Check MySQL logs
docker exec -it vehicle-rental tail -f /var/log/mysql/error.log
```

### Reset everything
```bash
# Single container
docker rm -f vehicle-rental
docker rmi vehicle-rental-app
docker build -t vehicle-rental-app .
docker run -d -p 3000:3000 -p 3306:3306 --name vehicle-rental vehicle-rental-app

# Docker Compose
docker-compose down -v
docker rmi vehicle-rental-app
docker-compose up --build
```

### Port already in use
If port 3000 or 3306 is already in use:

**Single Container:**
```bash
# Use different host ports
docker run -d -p 3001:3000 -p 3307:3306 --name vehicle-rental vehicle-rental-app
```

**Docker Compose:**
Edit `docker-compose.yml`:
```yaml
app:
  ports:
    - "3001:3000"  # Change host port to 3001

mysql:
  ports:
    - "3307:3306"  # Change host port to 3307
```

## Production Deployment

For production deployment:

1. **Update environment variables** with secure passwords
2. **Set NODE_ENV=production** (already set in docker-compose.yml)
3. **Use secrets management** instead of plain text passwords
4. **Configure HTTPS** using a reverse proxy (nginx, traefik)
5. **Set up backups** for the MySQL volume
6. **Configure monitoring** and logging

### Example Production Docker Compose

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD_FILE: /run/secrets/mysql_root_password
      MYSQL_DATABASE: vehicle_rental
      MYSQL_USER: vehicleuser
      MYSQL_PASSWORD_FILE: /run/secrets/mysql_password
    secrets:
      - mysql_root_password
      - mysql_password
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    build: .
    restart: always
    environment:
      - DB_HOST=mysql
      - DB_USER=vehicleuser
      - DB_PASSWORD_FILE=/run/secrets/mysql_password
      - NODE_ENV=production
    secrets:
      - mysql_password
    depends_on:
      - mysql

secrets:
  mysql_root_password:
    external: true
  mysql_password:
    external: true

volumes:
  mysql_data:
```

## Default Credentials

### Admin Panel
- URL: http://localhost:3000/admin
- Username: `admin`
- Password: `admin123`

### MySQL (Single Container)
- Host: `localhost`
- Port: `3306`
- User: `vehicleuser`
- Password: `vehiclepass`
- Database: `vehicle_rental`
- Root Password: `rootpassword`

### MySQL (Docker Compose)
- Host: `localhost`
- Port: `3306`
- User: `vehicleuser`
- Password: `vehiclepass`
- Database: `vehicle_rental`

**⚠️ Change these credentials in production!**

## Image Details

- **Base Image:** Node.js 24 Alpine
- **Package Manager:** Yarn (with frozen lockfile)
- **MySQL Version:** Latest available in Alpine repositories (8.x)
- **Size:** ~500MB (optimized Alpine-based image)
- **Ports:** 3000 (HTTP), 3306 (MySQL)

## Support

For issues or questions, check:
- Container logs: `docker-compose logs`
- Application logs inside container: `docker exec -it vehicle-rental-app cat /app/.next/logs`
- MySQL logs: `docker-compose logs mysql`
