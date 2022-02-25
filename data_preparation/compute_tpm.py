#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Compute tpm files for all .counts files in the structure data directory"""
import os
from pathlib import Path
from typing import Dict, Generator, Tuple

import dotenv
import pandas as pd
from joblib import Parallel, delayed

DOTENV_KEY2VAL = dotenv.dotenv_values()
DATA_DIR = DOTENV_KEY2VAL["DATA_DIR"]
N_JOBS = int(DOTENV_KEY2VAL["N_JOBS"])
VERBOSE = int(DOTENV_KEY2VAL["VERBOSE"])

GENCODE_DIR = Path(DATA_DIR) / "structured" / "gencode"

GTEX_GENE_ID2LENGTH_PATH = GENCODE_DIR / "gene_id2length_gtex.csv"
TCGA_GENE_ID2LENGTH_PATH = GENCODE_DIR / "gene_id2length_tcga.csv"

STRUCTURE_GTEX_DATA_DIR = Path(DATA_DIR) / "structured" / "gtex"
STRUCTURE_TCGA_DATA_DIR = Path(DATA_DIR) / "structured" / "tcga"


def compute_tpm(
    counts_df: pd.DataFrame, gene_id2length: pd.DataFrame
) -> pd.DataFrame:
    """Compute TPM values

    Args:
        counts_df: Dataframe containing counts
        gene_id2length: Dictionary of gene ID to gene length

    Returns:
        pd.DataFrame: containing the TPM values
    """
    scaling_factor = 1e6
    # Compute RPK
    out_df = counts_df.divide(gene_id2length.length, axis="index")
    # Compute scaling factor for each sample (i.e. column)
    sample_id2scaling_factor = out_df.sum(0) / scaling_factor
    # Compute TPM
    tpm_df = out_df.divide(sample_id2scaling_factor, axis="columns")

    return tpm_df


def file_generator(
    data_dir: str, file_type_specifier: str
) -> Generator[Tuple[str, str], None, None]:
    """Generator yielding structured GTEx/TCGA files

    Args:
        db_name: String specifying the database ("gtex" or "tcga")
        file_type_specifier: String specifying the type of a data file

    Returns:
        Generator: Tuple of (full path, file basename)
    """
    for root, subdirs, files in os.walk(data_dir):
        if not subdirs:
            for f in files:
                if f.split(".")[1] == file_type_specifier:
                    full_path = root + "/"
                    file_basename = f.split(".")[0]
                    yield (full_path, file_basename)


def counts2tpm(
    full_path: str, file_basename: str, db_name: str, db2gene_id2length: Dict
) -> None:
    """Compute TPM values from a counts file and write to CSV

    Args:
        full_path: Path to counts file
        file_basename: Name of counts file
        db_name: 'tcga' or 'gtex'
        db2gene_id2length: Dict of DB name to  gene id to length dataframe

    Returns: None
    """
    counts_df = pd.read_csv(full_path + file_basename + ".counts.csv", index_col=0)
    tpm_df = compute_tpm(counts_df, db2gene_id2length[db_name])
    output_file_name = f"{file_basename}.tpm.csv"
    tpm_df.to_csv(Path(full_path) / output_file_name)
    print(f"Computed TPM for {file_basename} ({counts_df.shape[1]} samples)")


def main():
    db2gene_id2length = {
        "gtex": pd.read_csv(GTEX_GENE_ID2LENGTH_PATH, index_col=0),
        "tcga": pd.read_csv(TCGA_GENE_ID2LENGTH_PATH, index_col=0),
    }
    db_name2data_dir = {
        "gtex": STRUCTURE_GTEX_DATA_DIR,
        "tcga": STRUCTURE_TCGA_DATA_DIR,
    }
    for db_name, data_dir in db_name2data_dir.items():
        Parallel(n_jobs=N_JOBS, verbose=VERBOSE)(
            delayed(counts2tpm)(full_path, file_basename, db_name, db2gene_id2length)
            for full_path, file_basename in file_generator(data_dir, "counts")
        )


if __name__ == "__main__":
    main()
