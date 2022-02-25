#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Script to reduce the size of the preprocessed dataset by only making
available the mean, median, min and max of each tissue. """

import json
import os
from pathlib import Path
from typing import Dict, List

import dotenv
import numpy as np
import pandas as pd
from joblib import Parallel, delayed
from utils import load_settings

settings = load_settings()
SAMPLE_STRATEGIES = settings["sample_strategies"]

# Load values from .env
DOTENV_KEY2VAL = dotenv.dotenv_values()
N_JOBS = int(DOTENV_KEY2VAL["N_JOBS"])
VERBOSE = int(DOTENV_KEY2VAL["VERBOSE"])
STRUCTURED_DIR = DOTENV_KEY2VAL["DATA_DIR"] + "/structured/"
REDUCED_DATA = DOTENV_KEY2VAL["DATA_DIR"] + "/reduced/"


class DatasetReducer:
    def __init__(
        self, index: int, tissue_fname: str, tissue: pd.DataFrame = None
    ) -> None:
        self.index = index
        self.tissue_fname = tissue_fname
        self.tissue_data = tissue

    def reduce_tissue(self) -> pd.DataFrame:
        with np.testing.suppress_warnings() as sup:
            sup.filter(RuntimeWarning, "")
            df_min = np.log2(self.tissue_data.min(axis=1) + 1)
            df_max = np.log2(self.tissue_data.max(axis=1) + 1)
            df_avg = np.log2(self.tissue_data.mean(axis=1) + 1)
            df_median = np.log2(self.tissue_data.median(axis=1) + 1)

            log_df = pd.concat([df_min, df_max, df_avg, df_median], axis=1)
            # We want to set the -inf to the lowest value of log_df to make it
            # intuitive for the user that the lowest expression is selected
            log_df.columns = SAMPLE_STRATEGIES
            return log_df

    def get_skew(self) -> List:
        skew = self.tissue_data.skew(axis=1)
        return skew.tolist()

    def get_std(self) -> List:
        std = self.tissue_data.std(axis=1)
        return std.tolist()

    @staticmethod
    def _remove_duplicated_index(df: pd.DataFrame) -> pd.DataFrame:
        return df[~df.index.duplicated(keep="first")]

    def get_tissue_info(self) -> Dict:
        tissue_info = dict()
        tissue_info["skew"] = self.get_skew()
        tissue_info["std"] = self.get_std()
        tissue_info["measured_samples"] = self.tissue_data.shape[1]
        return tissue_info

    def merge_info_and_reduced_tissue(
        self, tissue_info: pd.DataFrame, tissue_reduced: pd.DataFrame
    ) -> pd.DataFrame:
        tissue_merged = dict()

        # d = {True: "true", False: "false"}
        gene_expression = pd.DataFrame(index=tissue_reduced.index)
        gene_expression = self._remove_duplicated_index(gene_expression)

        skew_std_values = pd.DataFrame.from_dict(
            {key: tissue_info[key] for key in ["skew", "std"]},
        ).set_index(tissue_reduced.index)

        skew_std_values = self._remove_duplicated_index(skew_std_values)

        tissue_reduced_all = dict()
        for i in gene_expression.T:

            tissue_reduced_all[str(i)] = {
                strategy: tissue_reduced.loc[i][strategy].tolist()
                for strategy in SAMPLE_STRATEGIES
            }
            if np.isnan(skew_std_values.loc[i]["skew"]):
                tissue_reduced_all[str(i)]["skew"] = 0
            else:
                tissue_reduced_all[str(i)]["skew"] = skew_std_values.loc[i]["skew"]

            if np.isnan(skew_std_values.loc[i]["std"]):
                tissue_reduced_all[str(i)]["std"] = 0
            else:
                tissue_reduced_all[str(i)]["std"] = skew_std_values.loc[i]["std"]

        tissue_merged["gene_expression"] = tissue_reduced_all
        tissue_merged["number_of_samples"] = tissue_info["measured_samples"]
        return tissue_merged

    def process_tissue(self) -> None:
        if "counts" not in self.tissue_fname:
            self.tissue_data = pd.read_csv(self.tissue_fname, index_col="gene_id")
            tissue_target_dir = REDUCED_DATA + "/".join(
                self.tissue_fname.split("structured", 1)[1].split("/")[:-1]
            )

            Path(tissue_target_dir).mkdir(parents=True, exist_ok=True)

            tissue_info = self.get_tissue_info()

            tissue_reduced = self.reduce_tissue()

            tissue_reduced_with_info = self.merge_info_and_reduced_tissue(
                tissue_info, tissue_reduced
            )
            tissue_reduced_with_info["index"] = str(self.index)
            fn = tissue_target_dir + "/" + Path(self.tissue_fname).stem + ".json"
            with open(fn, "w") as fp:
                json.dump(tissue_reduced_with_info, fp)
            print(f"Done with {fn}")


def main():
    paths = []
    for dataset in ["gtex", "tcga"]:
        for root, dirs, files in os.walk(STRUCTURED_DIR + dataset):
            for file in files:
                paths.append(f"{root}/{file}")

    tissue_indices = [index for index in range(len(paths))]

    def datasetReducerContainerFun(aPayloadObject):
        aPayloadObject.process_tissue()

    runs = [
        DatasetReducer(index, tissue_fname)
        for tissue_fname, index in zip(paths, tissue_indices)
    ]

    Parallel(n_jobs=N_JOBS, verbose=VERBOSE)(
        delayed(datasetReducerContainerFun)(run) for run in runs
    )


if __name__ == "__main__":
    main()
