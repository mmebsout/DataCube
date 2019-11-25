#!/usr/bin/env bash
WORKSPACE_PATH=$PWD/datacube_workspace
mkdir -p $WORKSPACE_PATH/private && mkdir $WORKSPACE_PATH/public
chmod +x $WORKSPACE_PATH/private && chmod +x $WORKSPACE_PATH/public

wget -P  $WORKSPACE_PATH/public http://idoc-herschel.ias.u-psud.fr/sitools/datastorage/user/storageRelease//R7_spire_fts/HIPE_Fits/FTS_SPIRE/OT1_atielens/M17-2/1342228703_M17-2_SPIRE-FTS_15.0.3244_HR_SLW_gridding_cube.fits

docker run --name datacube_and_server \
            -d \
            -p 8000:4200 \
            -p 8081:8081 \
            -v $WORKSPACE_PATH:/data \
            datacube_and_server
echo "Please launch : http://localhost:8000/demo/DataCube"