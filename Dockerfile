# syntax=docker/dockerfile:1

# Use official node image as the base image
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-alpine

# Use production node environment
ENV NODE_ENV production

# Prepare app directory
WORKDIR /usr/src/app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --no-audit --no-fund

# Copy application files
COPY . .

# Run the application
CMD npm run start