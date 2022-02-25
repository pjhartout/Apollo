#!/usr/bin/env bash

source .env

echo "Building gdc-client in ${SRC_DIR}"

mkdir -p $SRC_DIR && cd $SRC_DIR

git clone https://github.com/NCI-GDC/gdc-client

cd gdc-client && pip install . && cd ../
cp gdc-client/bin/gdc-client gdc_client && rm -rf gdc-client
chmod +x $SRC_DIR/gdc_client
