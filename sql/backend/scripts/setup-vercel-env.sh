#!/bin/bash

# Script to add environment variables to Vercel
# Make sure you're logged in to Vercel CLI first: vercel login

echo "Setting up Vercel environment variables..."
echo "Note: For production environment, these will be set for 'production' scope"
echo ""

# Function to add environment variable
add_env() {
  local key=$1
  local value=$2
  echo "Adding $key..."
  echo "$value" | vercel env add "$key" production
}

# Server Configuration
add_env "NODE_ENV" "production"
add_env "PORT" "3000"
add_env "HOST" "0.0.0.0"

# Database Configuration
add_env "DATABASE_HOST" "103.186.63.189"
add_env "DATABASE_NAME" "aus_dev_chronicle_dev"
add_env "DATABASE_USER" "chronicle"
add_env "DATABASE_PASSWORD" "V8OHd&2+)wO2;8;l"
add_env "DATABASE_PORT" "3306"

# AI Configuration
add_env "OPENROUTER_API_KEY" "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"

# Security - Update this after deployment with your actual Vercel URL
add_env "ALLOWED_ORIGINS" "http://localhost:4200,http://localhost:3000"

# Logging
add_env "LOG_LEVEL" "info"

# Query Limits
add_env "MAX_QUERY_RESULTS" "1000"
add_env "QUERY_TIMEOUT_MS" "30000"

echo ""
echo "✓ All environment variables have been added to Vercel!"
echo ""
echo "IMPORTANT: Don't forget to update ALLOWED_ORIGINS with your actual frontend URL after deployment!"
echo "You can do this with: vercel env add ALLOWED_ORIGINS"
