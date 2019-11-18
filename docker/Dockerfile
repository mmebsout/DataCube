FROM node:8.10-stretch
ADD VERSION .
# Configure npm by allowing root to use npm
RUN echo "unsafe-perm=true" > ~/.npmrc

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

# ------ BACKEND

# Install java
RUN echo "deb http://deb.debian.org/debian stretch-backports main" >> /etc/apt/sources.list.d/nginx.list
RUN apt-get update && apt-get -y dist-upgrade
RUN apt-get -y -t stretch-backports install openjdk-8-jdk

# install maven
RUN apt-get -y install maven

# clone Server
WORKDIR /opt/ 
RUN git clone https://github.com/MizarWeb/DataCubeServer.git \
    && cd DataCubeServer \
    # edit properties : .fits and .nc are found in "/data/private" and "/data/public" folders
    && sed -i -e '/workspace=/ s/=.*/=\/data\//' -e '/workspace_cube=/ s/=.*/=\/data\//' cubeExplorer.properties \
    && sed -i -e '/workspace=/ s/=.*/=\/data\//' -e '/workspace_cube=/ s/=.*/=\/data\//' src/main/resources/conf/cubeExplorer.properties \
    # install server 
    && mvn clean install 

# create /data/private and /data/public folders 
RUN mkdir -p /data/private && mkdir /data/public \
    && chmod +x /data/private && chmod +x /data/public \
    # download test cube
    && wget -P  /data/public http://idoc-herschel.ias.u-psud.fr/sitools/datastorage/user/storageRelease//R7_spire_fts/HIPE_Fits/FTS_SPIRE/OT1_atielens/M17-2/1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits

EXPOSE 8081

# ------- RUN APPs

COPY ./script.sh /
RUN chmod +x /script.sh
ENTRYPOINT ["/script.sh"]