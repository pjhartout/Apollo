#!/bin/bash
source .env

python download_manifest.py

echo "Data directory:" "$DATA_DIR"
DOWNLOAD_DIR=$DATA_DIR/raw/tcga

mkdir -p $DOWNLOAD_DIR
MANIFEST_FILE=manifest.txt
cd $DOWNLOAD_DIR

# Use gdc-client to download files according to the manifest file
$SRC_DIR/gdc_client download -m $MANIFEST_DIR/$MANIFEST_FILE
gzip -d */*.gz
cd ../

echo "TCGA data downloaded successfully"
