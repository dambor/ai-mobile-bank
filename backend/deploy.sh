#!/bin/bash

# Replace with your Google Cloud Project ID
PROJECT_ID=$(gcloud config get-value project)
APP_NAME="pnc-bank-api"
REGION="us-central1" # Change as needed

echo "Deploying to Project: $PROJECT_ID"

# Build the image using Cloud Build
gcloud builds submit --tag gcr.io/$PROJECT_ID/$APP_NAME

# Deploy to Cloud Run using env_vars.yaml to avoid special character issues
gcloud run deploy $APP_NAME \
  --image gcr.io/$PROJECT_ID/$APP_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --env-vars-file env_vars.yaml

echo "Deployment complete."
