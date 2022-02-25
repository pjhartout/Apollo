# Data Preparation Pipeline

We recommend carrying out the steps below on a workstation or server with at
least 16GB of RAM and a stable internet connection over a sustained period of
time to avoid crashes and loss of data.

## Installation

- Install [Poetry](https://python-poetry.org/), and activate the environment (i.e. `$ poetry shell`).
- Create `.env` file containing:

  ```
  ROOT_DIR=<Apollo-root-directory>/
  PREP_DIR=${ROOT_DIR}/data_preparation/
  MANIFEST_DIR=${PREP_DIR}/manifests
  SRC_DIR=${PREP_DIR}/bin
  PUBLIC_DIR=${ROOT_DIR}/nextjs-app/public/
  DATA_DIR=${PUBLIC_DIR}/data/
  N_JOBS=-1
  VERBOSE=100
  ```
  make sure you replace `<Apollo-root-directory>` with your actual path to the root of this project.

- Download [GDC client ](https://github.com/NCI-GDC/gdc-client) by running `$ ./install_gdc_client`.

- Download [GENCODE](https://www.gencodegenes.org/human/releases.html), [GTEx](https://gtexportal.org/home/), and [TCGA](https://www.cancer.gov/about-nci/organization/ccg/research/structural-genomics/tcga) data.

  - GENCODE, run: `$ ./get_gencode_data.sh`
  - GTEx, run: `$ ./get_gtex_data.sh`
  - TCGA, run: `$ ./get_tcga_data.sh`

- Compute gene length for each dataset by running `$ python ./make_gencode_gene2length.py`

- Structure the datasets.

  - GTEx, run: `$ python ./structure_gtex_data.py`
  - TCGA, run: `$ python ./structure_tcga_data.py`

- Compute the TPM value for each gene in each sample by running `$ python ./compute_tpm.py`

- To compute tissue level statistics for each gene, run `$ python ./reduce_dataset.py`.

- Then, create an index of the tissues available and create the distplots used in the app:

  - `$ python ./create_tissue_file_index.py`
  - `$ python ./export_distplots.py`

- We also need to compile a list of genes with mismatching length between GENCODE versions used by TCGA and GTEx. Get the list by running:
  - `$ python ./compute_mismatching_gene_length.py`


- Finally, run the application locally as indicated in the main `README.md` file.
