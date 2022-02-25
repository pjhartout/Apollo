#!/bin/bash
source .env

GENCODE_API="https://api.gdc.cancer.gov/data/25aa497c-e615-4cb7-8751-71f744f9691f"
GENCODE_V26_API="https://storage.googleapis.com/gtex_analysis_v8/reference/gencode.v26.GRCh38.genes.gtf"
GENCODE_V26_GTF="gencode.v26.GRCh38.genes.collapsed.gtf"
GENCODE_V22_API="https://api.gdc.cancer.gov/data/25aa497c-e615-4cb7-8751-71f744f9691f"
GENCODE_V22_GTF="gencode.v22.annotation.gtf.gz"
GENCODE_V22_ANNOTATION="gencode.v22.annotation.gtf"
GENCODE_V22_GENES_COLLAPSED="gencode.v22.genes.collapsed.gtf"

DOWNLOAD_DIR=$DATA_DIR/raw/gencode
mkdir -p $DOWNLOAD_DIR

# Get v26 already collapsed from GTEx
wget -nc -O $DOWNLOAD_DIR/$GENCODE_V26_GTF $GENCODE_V26_API

# Get v22 from tcga
wget -nc -O $DOWNLOAD_DIR/$GENCODE_V22_GTF $GENCODE_V22_API

gzip -d $DOWNLOAD_DIR/*.gz

cd $PREP_DIR
# Collapse TCGA data
echo $DOWNLOAD_DIR/$GENCODE_V22_ANNOTATION
echo $DOWNLOAD_DIR/$GENCODE_V22_GENES_COLLAPSED
python data_preparation/collapse_annotation.py \
  $DOWNLOAD_DIR/$GENCODE_V22_ANNOTATION \
  $DOWNLOAD_DIR/$GENCODE_V22_GENES_COLLAPSED

if [ $? -eq 0 ]
then
  echo "Gencode annotation files downloaded, uncompressed and collapsed successfully."
else
  echo "Script exited with error." >&2
fi
