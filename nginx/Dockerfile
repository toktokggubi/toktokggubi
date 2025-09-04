# nginx/Dockerfile
FROM nginx:alpine
# No COPY for config here, it will be mounted via volumes in docker-compose files.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
