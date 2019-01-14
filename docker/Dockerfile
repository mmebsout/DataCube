FROM node:8.7.0-wheezy
# Configure npm by allowing root to use npm
RUN echo "unsafe-perm=true" > ~/.npmrc

# Install nginx to serve static files - BEGIN
RUN echo "deb http://nginx.org/packages/debian/ wheezy nginx" >> /etc/apt/sources.list.d/nginx.list
RUN apt-key adv --fetch-keys "http://nginx.org/keys/nginx_signing.key"

RUN apt-get update && apt-get -y dist-upgrade
RUN apt-get -y install nginx openssl ca-certificates java-1.8.0-openjdk.x86_64 wget

# install maven
RUN wget http://mirrors.sonic.net/apache/maven/maven-3/3.5.3/binaries/apache-maven-3.5.3-bin.zip
RUN apt-get -y install unzip
RUN cd /opt
RUN unzip apache-maven-3.5.3-bin.zip
RUN mv apache-maven-3.5.3 maven
RUN rm -f apache-maven-3.5.3-bin.zip
RUN nano /etc/profile.d/maven.sh
RUN export PATH=/opt/maven/bin:${PATH}

RUN rm -rf /etc/nginx/conf.d/*

ADD nginx.conf /etc/nginx/nginx.conf
ADD datacube.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
# Install nginx to serve static files - END

# Install Datacube
RUN mkdir -p /var/www/html/demo && env

# change directory
WORKDIR /var/www/html/demo

# ------ FRONTEND
RUN git clone https://github.com/MizarWeb/DataCube.git \
  && cd DataCube \
  && npm install

# ------ BACKEND
RUN git clone https://github.com/MizarWeb/DataCubeServer.git \
    && cd DataCubeServer \
    && mvn clean install

ENTRYPOINT ["nginx"]
