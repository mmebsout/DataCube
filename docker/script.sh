#!/bin/bash

npm --prefix /opt/DataCube start & 

cd /opt/DataCubeServer/target/
java -Xmx5G -jar "$(echo cubeExplorer-*.jar )"