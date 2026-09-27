#!/bin/bash

# Setup test database for integration tests

echo "Setting up test database..."

# Create test database
podman exec ecommerce-postgres psql -U postgres -c "DROP DATABASE IF EXISTS ecommerce_test;"
podman exec ecommerce-postgres psql -U postgres -c "CREATE DATABASE ecommerce_test;"

echo "Test database created successfully"
