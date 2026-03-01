FROM node:20-bullseye

# system packages install
RUN apt-get update && \
  apt-get install -y ffmpeg imagemagick webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /root/asura-md

#copy packages 
COPY package.json .
RUN npm install --network-timeout=100000

# copy 
COPY . .

# start command
CMD ["node", "--max-old-space-size=1024", "index.js"]
