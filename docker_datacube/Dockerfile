FROM node:8.10-stretch
ADD VERSION .
# Configure npm by allowing root to use npm
RUN echo "unsafe-perm=true" > ~/.npmrc

# Proxy runtime
ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV http_proxy=$HTTP_PROXY
ENV https_proxy=$HTTPS_PROXY


# ------ FRONTEND
WORKDIR /opt
RUN git clone https://github.com/MizarWeb/DataCube.git 
WORKDIR /opt/DataCube 

# add "--host 0.0.0.0" to listen to all the interfaces from the container
RUN npm install -g json
RUN json -I -f package.json -e "this.scripts.start='ng serve --proxy-config proxy.conf.js --host 0.0.0.0'"

RUN npm install -g npm \
    && npm install ng \
    && npm install

EXPOSE 4200
# ------- RUN APP

ENTRYPOINT npm start