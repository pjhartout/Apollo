#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""compute_mismatching_gene_length.py

Builds a list of mismatching gene lengths.

example usage from CLI:
 $ python3 compute_mismatching_gene_length.py

"""

import argparse
import json
import os
from pathlib import Path

import dotenv
from gtfparse import read_gtf

DOTENV_KEY2VAL = dotenv.dotenv_values()
DATA_DIR = DOTENV_KEY2VAL["DATA_DIR"]
PUBLIC_DIR = DOTENV_KEY2VAL["PUBLIC_DIR"]
GENCODE_DIR = Path(DATA_DIR) / "raw" / "gencode"


def preprocess_gencode_data(gencode_df):
    """Performs projection of the originally parce gencode dataframe to select relevant parts.

    Args:
        gencode_df (pandas.core.frame.DataFrame):

    Returns:

    """
    # Select genes and disregard the rest (might refine selection criteria later)
    gencode_df = gencode_df.loc[gencode_df["feature"] == "gene"]
    # Select relevant columns
    gencode_df = gencode_df[["gene_id", "seqname", "start", "end"]]
    gencode_df["length"] = gencode_df["end"] - gencode_df["start"]
    # strip version name as it is not relevant in our pipeline
    gencode_df["gene_id_unversioned"] = (
        gencode_df["gene_id"].str.split(".").str[0]
    )
    return gencode_df


def write_unequal_gene_list(non_equal_genes):
    non_equal_genes = non_equal_genes[
        ["gene_id_unversioned", "percent_len_diff"]
    ]
    non_equal_genes = non_equal_genes.set_index("gene_id_unversioned")

    non_equal_genes_dict = {
        "genes_with_nonequal_length": non_equal_genes.to_dict()[
            "percent_len_diff"
        ]
    }
    with open(
        Path(DATA_DIR) / "genes_with_unequal_length.json",
        "w",
    ) as outfile:
        json.dump(non_equal_genes_dict, outfile)


def main():
    gencode_v1 = read_gtf(GENCODE_DIR / "gencode.v22.genes.collapsed.gtf")
    gencode_v2 = read_gtf(
        GENCODE_DIR / "gencode.v26.GRCh38.genes.collapsed.gtf"
    )
    gencode_v1 = preprocess_gencode_data(gencode_v1)
    gencode_v2 = preprocess_gencode_data(gencode_v2)
    gencode_merge = gencode_v1.merge(
        gencode_v2, on="gene_id_unversioned", how="inner"
    )
    gencode_merge["length_diff"] = (
        gencode_merge["length_x"] - gencode_merge["length_y"]
    ).abs()
    non_equal_genes = gencode_merge.loc[gencode_merge.length_diff != 0]
    non_equal_genes["min_len"] = non_equal_genes[["length_x", "length_y"]].min(
        axis=1
    )
    non_equal_genes["percent_len_diff"] = (
        non_equal_genes["length_diff"] / non_equal_genes["min_len"]
    )

    # Data for table 1
    print(non_equal_genes["percent_len_diff"].describe())

    write_unequal_gene_list(non_equal_genes)


if __name__ == "__main__":
    main()
