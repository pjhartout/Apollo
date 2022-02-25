#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from pathlib import Path
from typing import Dict

import dotenv
import numpy as np
import pandas as pd
from gtfparse import read_gtf
from utils import load_settings

settings = load_settings()
DATABASE2GENCODE = settings["database2gencode_version"]

DOTENV_KEY2VAL = dotenv.dotenv_values()

OUT_DIR = Path(DOTENV_KEY2VAL["DATA_DIR"]) / "structured" / "gencode"
OUT_DIR.mkdir(exist_ok=True, parents=True)

GENCODE_DIR = Path(DOTENV_KEY2VAL["DATA_DIR"]) / "raw" / "gencode"


def compute_common_gene_ids(database1gencode_version: Dict) -> pd.DataFrame:
    """Describe common genes in TCGA and GTEx using collapsed gencode files
    Returns:
        pd.DataFrame containing description of common genes
    """

    db2gencode_gene_ids = {}
    for db, gencode_version in DATABASE2GENCODE.items():
        gencode_file = next(
            f
            for f in os.listdir(GENCODE_DIR)
            if gencode_version in f and "collapsed" in f
        )
        gene_ids = read_gtf(GENCODE_DIR / gencode_file, usecols=["gene_id"])
        gene_ids = gene_ids.drop_duplicates()
        # Add gene_id minus suffix as index
        gene_ids["gene_id_abbrev"] = gene_ids["gene_id"].str.split(".").str[0]
        gene_ids = gene_ids.set_index("gene_id_abbrev", drop=True)
        # Rename gene_id column
        gene_ids[f"gene_id_{db}"] = gene_ids["gene_id"]
        del gene_ids["gene_id"]
        db2gencode_gene_ids[db] = gene_ids

    # Join on common genes
    combined_df = db2gencode_gene_ids["tcga"].merge(
        db2gencode_gene_ids["gtex"], left_index=True, right_index=True, how="inner",
    )
    return combined_df


class DBGeneLength:
    gencode_cols = ["gene_id", "start", "end", "feature"]
    gene_length_scale_factor = 1000

    def __init__(self, db_name: str, gencode_version: str) -> None:
        self.db_name = db_name
        self.gencode_version = gencode_version
        self.gencode_file = next(
            f
            for f in os.listdir(GENCODE_DIR)
            if self.gencode_version in f and "collapsed" in f
        )

    def parse_gencode(self) -> pd.DataFrame:
        """Parses gencode for GTEx/TCGA dataset

        Returns:
            pd.Dataframe: Preprocessed gencode dataframe
        """

        def compute_gencode_length(gencode_df):
            gencode_df["length"] = (
                gencode_df["end"] - gencode_df["start"]
            ) / self.gene_length_scale_factor
            return gencode_df

        def filter_exons(gencode_df):
            return gencode_df[gencode_df["feature"] == "exon"]

        gencode_df = read_gtf(
            GENCODE_DIR / self.gencode_file, usecols=self.gencode_cols
        )
        gencode_df = compute_gencode_length(gencode_df)
        gencode_df = filter_exons(gencode_df)

        return gencode_df

    def transform(self, gene_ids: np.ndarray) -> pd.Series:
        gencode_df = self.parse_gencode()
        gene_ids = gene_ids[f"gene_id_{self.db_name}"].values
        gencode_df = gencode_df[gencode_df["gene_id"].isin(gene_ids)]

        gene_id2length = gencode_df.groupby("gene_id")["length"].sum()
        gene_ids2length = gene_id2length.loc[gene_ids]

        return gene_ids2length


def main():
    common_gene_ids = compute_common_gene_ids(DATABASE2GENCODE)

    GTExGeneLength = DBGeneLength(
        db_name="gtex", gencode_version=DATABASE2GENCODE["gtex"]
    )
    GTEx_gene_id2length = GTExGeneLength.transform(common_gene_ids)
    GTEx_gene_id2length.to_csv(OUT_DIR / f"gene_id2length_gtex.csv", index=True)

    TCGAGeneLength = DBGeneLength(
        db_name="tcga", gencode_version=DATABASE2GENCODE["tcga"]
    )
    TCGA_gene_id2length = TCGAGeneLength.transform(common_gene_ids)
    TCGA_gene_id2length.to_csv(OUT_DIR / f"gene_id2length_tcga.csv", index=True)


if __name__ == "__main__":
    main()
