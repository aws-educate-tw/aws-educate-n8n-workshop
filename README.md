# aws-educate-n8n-workshop


## Build generate_chart.zip

```bash
docker run --platform linux/amd64 --rm --entrypoint /bin/sh -v "$PWD":/var/task amazon/aws-lambda-nodejs:20 -c "cd /var/task/src/generate_chart && rm -rf node_modules package-lock.json && dnf install -y zip && npm install && zip -r /var/task/generate_chart.zip ."
```


## Test the Chart Generator API
```bash
curl -X POST \
  'https://b8kpxud0ge.execute-api.us-east-1.amazonaws.com?output=html' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "line",
    "labels": ["第一週", "第二週", "第三週", "第四週"],
    "data": [5, 15, 12, 25]
}'
```


## n8n Docker run command (use it after CloudFront is ready)

```
DOMAIN="USE YOU OWN CloudFrontURL REMOVE https://"

sudo docker stop n8n
sudo docker rm n8n

sudo docker run -d \
  --name n8n \
  -p 5678:5678 \
  -e GENERIC_TIMEZONE="Asia/Taipei" \
  -e TZ="Asia/Taipei" \
  -e N8N_BASIC_AUTH_ACTIVE="true" \
  -e N8N_BASIC_AUTH_USER="admin" \
  -e N8N_BASIC_AUTH_PASSWORD="supersecret" \
  -e N8N_PUSH_BACKEND="sse" \
  -e N8N_HOST="$DOMAIN" \
  -e N8N_EDITOR_BASE_URL="https://$DOMAIN" \
  -e WEBHOOK_URL="https://$DOMAIN" \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n:latest
```


```
