#!/bin/bash
set -e
echo "Building TypeScript project..."
npx -p typescript@5.3.3 tsc
echo "Build completed successfully!"
