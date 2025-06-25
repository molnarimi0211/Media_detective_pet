#!/bin/bash

# Changing to project's main folder
cd "$(dirname "$0")"

# Building the frontend Docker image.
docker build --no-cache -t frontend-builder ./frontend

# Creating the dist folder if does not exist.
mkdir -p ./nginx/dist

# Copying the dist files from the image to the ./nginx/dist folder.
docker run --rm frontend-builder tar -C /app/dist -cf - . | tar -C ./nginx/dist -xf -
