# -*- coding: utf-8 -*-
import argparse
import json
import os
import re
from io import StringIO
from pathlib import Path

import dotenv
import pandas as pd
import requests
from utils import get_gene_id2length

DOTENV_KEY2VAL = dotenv.dotenv_values()


def make_tissue2subtissue2sample_id(rawdir: str) -> pd.DataFrame:
    """Construct multi-indexed pd.Series that maps each tissue-subtissue
    combination to the corresponding column names"""
    sample_id_df = pd.read_csv(
        Path(rawdir) / "GTEx_Analysis_v8_Annotations_SampleAttributesDS.txt", sep="\t",
    )
    # SMTS refers to main tissue type, SMTSD refers to subtissue type
    sample_id2tissue_type_subtype_df = pd.DataFrame(
        index=sample_id_df["SAMPID"].values,
        data=sample_id_df[["SMTS", "SMTSD"]].values,
        columns=["tissue", "subtissue"],
    )
    # Now invert to go from tissue-subtissue to sample_id
    tissue2subtissue2sample_id = pd.Series(
        index=pd.MultiIndex.from_frame(sample_id2tissue_type_subtype_df),
        data=sample_id2tissue_type_subtype_df.index.values,
    )
    # Filter for only those that are actually present
    actual_sample_ids = pd.read_csv(
        Path(rawdir) / "GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct",
        skiprows=2,
        nrows=1,
        sep="\t",
    )
    tissue2subtissue2sample_id = tissue2subtissue2sample_id[
        tissue2subtissue2sample_id.isin(actual_sample_ids)
    ]
    return tissue2subtissue2sample_id


def convert_tissue_name(tissue_name: str) -> str:
    return "_".join(re.findall("[\w]+", tissue_name.lower()))


if __name__ == "__main__":
    datadir = Path(os.path.join(DOTENV_KEY2VAL["DATA_DIR"],))
    tissue2subtissue2sample_id = make_tissue2subtissue2sample_id(
        datadir / "raw" / "gtex"
    )
    out_dir = datadir / "structured" / "gtex"
    out_dir.mkdir(parents=True, exist_ok=True)
    relevant_gene_ids = get_gene_id2length("gtex").index.values
    # Now iterate over each of the unique tissues:
    for tissue in tissue2subtissue2sample_id.index.get_level_values(0).unique():
        subtissue2sample_id = tissue2subtissue2sample_id[tissue]
        tissue_nice_name = convert_tissue_name(tissue)
        tissue_dir = out_dir / tissue_nice_name
        tissue_dir.mkdir(exist_ok=True)
        for subtissue in subtissue2sample_id.index.unique():
            subtissue_nice_name = convert_tissue_name(subtissue)
            subtissue_out_file = tissue_dir / f"{subtissue_nice_name}.counts.csv"
            sample_ids = list(subtissue2sample_id[subtissue])
            print(
                f"Loading data for {tissue}-{subtissue} with {len(sample_ids)} columns"
            )
            subtissue_df = pd.read_csv(
                datadir
                / "raw"
                / "gtex"
                / "GTEx_Analysis_2017-06-05_v8_RNASeQCv1.1.9_gene_reads.gct",
                skiprows=2,
                # nrows=10,
                usecols=sample_ids + ["Name"],
                sep="\t",
            )
            # Rename name column
            subtissue_df["gene_id"] = subtissue_df["Name"]
            del subtissue_df["Name"]
            subtissue_df.set_index("gene_id", inplace=True, drop=True)
            # Sort the df according to the order fixed
            subtissue_df = subtissue_df.loc[relevant_gene_ids]
            subtissue_df.to_csv(subtissue_out_file, index=True)
