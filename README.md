# Docker Node template
Template for getting started with Node.js and Docker development

## Setup

1. Use this template
2. Initalize git repository
3. Update `name` in *package.json* 
4. Build image
    ```
    docker build . -t <your username>/docker-node-template
    ```
5. Run image (change port)
    ```
    docker run -p 49161:8080 --name docker-node-template -d <your username>/docker-node-template
    ```

## Docker commands

### Check logs

``` 
# Get container ID
$ docker ps

# Print app output
$ docker logs <container id>

# Example
Running on http://localhost:808
```

### Enter container

```
docker exec -it <container id> /bin/bash
```

## Docker compose 

```
version: '3'

services:
  docker-node-template: 
    build: /path/to/docker-node-template/
    container_name: docker-node-template
    volumes:
      - /paht/to//docker-node-template/:/usr/src/app
      - /usr/src/app/node_modules
    ports:
      - 49161:8080
    command: npm run dev
```


Build image and run container
```
docker-compose up -d 
```

## Sources 

* [Dockerizing a Node.js web app](https://nodejs.org/en/docs/guides/nodejs-docker-webapp)