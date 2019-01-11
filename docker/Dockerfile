# Configure npm by allowing root to use npm
RUN echo "unsafe-perm=true" > ~/.npmrc

# Install nginx to serve static files - BEGIN
# RUN echo "deb http://nginx.org/packages/debian/ wheezy nginx" >> /etc/apt/sources.list.d/nginx.list
# RUN apt-key adv --fetch-keys "http://nginx.org/keys/nginx_signing.key"

RUN yum update
RUN yum -y install nginx openssl ca-certificates java-1.7.0-openjdk.x86_64 wget

RUN wget http://mirrors.sonic.net/apache/maven/maven-3/3.5.3/binaries/apache-maven-3.5.3-bin.zip
RUN yum -y install unzip
RUN cd /opt
RUN unzip apache-maven-3.5.3-bin.zip
RUN mv apache-maven-3.5.3 maven
RUN rm -f apache-maven-3.5.3-bin.zip
RUN nano /etc/profile.d/maven.sh
RUN export PATH=/opt/maven/bin:${PATH}

#RUN rm -rf /etc/nginx/conf.d/*

ADD nginx.conf /etc/nginx/nginx.conf
ADD datacube.nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
# Install nginx to serve static files - END

# Install Datacube
RUN mkdir -p /var/www/html/demo && env

# change directory
WORKDIR /var/www/html/demo

# ------ FRONTEND
# RUN git clone TODO \
#  && cd cube-exp-app-front \
#  && npm install

# ------ BACKEND
# RUN git clone TODO \
#  && cd cube-exp-app-back \
#  && mvn clean install

ENTRYPOINT ["nginx"]
