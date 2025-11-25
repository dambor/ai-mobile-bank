FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY api.py .
COPY secure-connect-setools.zip .

# Cloud Run expects the container to listen on port 8080
ENV PORT=8080

CMD ["python", "api.py"]
