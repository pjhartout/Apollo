#!/bin/bash
source .env

DOWNLOAD_DIR=$DATA_DIR/raw/gtex
GTEX_ANALYSIS_API="https://storage.googleapis.com/gtex_analysis_v8"
RNA_SEQ_DATA="rna_seq_data"
ANNOTATIONS="annotations"
GENE_READS_FILE="GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct.gz"
SAMPLE_ATTRIBUTES_DS="GTEx_Analysis_v8_Annotations_SampleAttributesDS.txt"
SAMPLE_ATTRIBUTES_DD="GTEx_Analysis_v8_Annotations_SampleAttributesDD.xlsx"
SUBJECT_PHENOTYPES_DS="GTEx_Analysis_v8_Annotations_SubjectPhenotypesDS.txt"
SUBJECT_PHENOTYPES_DD="GTEx_Analysis_v8_Annotations_SubjectPhenotypesDD.xlsx"

declare -a GTEX_LINKS=(
  $GTEX_ANALYSIS_API/$RNA_SEQ_DATA/$GENE_READS_FILE
  $GTEX_ANALYSIS_API/$ANNOTATIONS/$SAMPLE_ATTRIBUTES_DS
  $GTEX_ANALYSIS_API/$ANNOTATIONS/$SAMPLE_ATTRIBUTES_DD
  $GTEX_ANALYSIS_API/$ANNOTATIONS/$SUBJECT_PHENOTYPES_DS
  $GTEX_ANALYSIS_API/$ANNOTATIONS/$SUBJECT_PHENOTYPES_DS
)

cd $PUBLIC_DIR
mkdir -p $DOWNLOAD_DIR
echo $DOWNLOAD_DIR

for link in "${GTEX_LINKS[@]}"
do
  echo $link
  filename="$DOWNLOAD_DIR/${link##*/}"
  wget -nc -O $filename $link
done

cd $DOWNLOAD_DIR

gzip -d $GENE_READS_FILE

echo "GTEx data downloaded succesfully."
