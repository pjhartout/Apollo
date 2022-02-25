#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
from pathlib import Path

import dotenv
import pandas as pd
from tcga_api_handler import APIHandlerTCGA
from utils import get_gene_id2length, load_settings

# TODO: move to utils?
inv_series = lambda s: pd.Series(data=s.index.values, index=s.values)

settings = load_settings()
TCGA_FILTER = settings["tcga_filter"]

DOTENV_KEY2VAL = dotenv.dotenv_values()
RAW_DIR = Path(DOTENV_KEY2VAL["DATA_DIR"]) / "raw" / "tcga"
OUT_DIR = Path(DOTENV_KEY2VAL["DATA_DIR"]) / "structured" / "tcga"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    APIHandler = APIHandlerTCGA(API_filter=TCGA_FILTER)
    file_ids = os.listdir(RAW_DIR)

    case_id2file_id = APIHandler.get_case_id2file_id(file_ids)

    case_id2disease_info = APIHandler.get_case_id2disease_info()

    disease_type2primary_site2file_id = APIHandler.make_disease_type2primary_site2file_id(
        case_id2file_id, case_id2disease_info
    )

    file_id2sample_type = APIHandler.get_file_id2sample_type()
    file_id2file_name = APIHandler.get_file_id2file_name()

    relevant_gene_ids = get_gene_id2length("tcga").index.values.tolist()

    # TODO refactor this
    for disease_type in disease_type2primary_site2file_id.index.get_level_values(
        0
    ).unique():
        disease_nice_name = APIHandler.convert_name(disease_type)
        disease_dir = OUT_DIR / disease_nice_name
        disease_dir.mkdir(exist_ok=True)
        primary_site2file_id = disease_type2primary_site2file_id[disease_type]
        for primary_site in primary_site2file_id.index.unique():
            primary_site_nice_name = APIHandler.convert_name(primary_site)
            primary_site_dir = disease_dir / primary_site_nice_name
            primary_site_dir.mkdir(exist_ok=True)
            file_ids = primary_site2file_id[[primary_site]].values
            # Map sample_id to relevant part of file_id's
            rel_sample_type2file_id = inv_series(file_id2sample_type[file_ids])
            for sample_type in rel_sample_type2file_id.index.unique():
                rel_file_ids = rel_sample_type2file_id[[sample_type]]
                # Now start appending these files in one dataframe, columns for
                # each sample
                this_fname = f"{sample_type}.counts.csv"
                this_df = pd.DataFrame(index=relevant_gene_ids)
                this_df.index.name = "gene_id"
                for i, file_id in enumerate(rel_file_ids):
                    exprs = APIHandler.load_counts(
                        RAW_DIR / file_id / file_id2file_name[file_id]
                    ).rename(file_id)
                    this_df = this_df.merge(
                        exprs, left_index=True, right_index=True, how="left"
                    )
                this_df.to_csv(primary_site_dir / this_fname, index=True)
                print(
                    f"Done for {disease_nice_name}-{primary_site_nice_name}-{sample_type} ({len(rel_file_ids)} samples)"
                )


if __name__ == "__main__":
    main()
