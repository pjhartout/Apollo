#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Reads in the structured data to create static histograms to be displayed in the web app."""

import os
from pathlib import Path

import dotenv
import numpy as np
import pandas as pd
import plotly
import plotly.express as px
import plotly.figure_factory as ff
from joblib import Parallel, delayed

from utils import load_settings

settings = load_settings()
SAMPLE_STRATEGIES = settings["sample_strategies"]

DOTENV_KEY2VAL = dotenv.dotenv_values()
DATA_DIR = DOTENV_KEY2VAL["DATA_DIR"]
PUBLIC_DIR = DOTENV_KEY2VAL["PUBLIC_DIR"]
HISTOGRAM_DIR = Path(PUBLIC_DIR) / "histograms/"
N_JOBS = int(DOTENV_KEY2VAL["N_JOBS"])


class PlotlyHelper:
    def __init__(
        self,
        dataset: str,
        tissue_file: str,
        tissue_data: pd.DataFrame,
        sample_strategy: str,
    ):
        """
        Args:
            dataset: "gtex" or "tcga"
            tissue_file: File name of the tissue
            tissue_data: Tissue data in pandas DataFrame format
            sample_strategy: Sample strategy
        """
        self.dataset = dataset
        self.tissue_name = tissue_file.replace(".csv", "")
        self.tissue_data = tissue_data
        self.sample_strategy = sample_strategy
        self.colormap = px.colors.qualitative.Pastel

    def prepare_tissue(self) -> None:
        """Apply sample strategy to tissue data and remove inf resulting from taking log
         to make the histogram look more homogeneous.

        Returns:
            pd.DataFrame
        """
        np.seterr(divide="ignore")

        if self.sample_strategy == "min":
            self.tissue_data = self.tissue_data.min(axis=1)
        elif self.sample_strategy == "max":
            self.tissue_data = self.tissue_data.max(axis=1)
        elif self.sample_strategy == "avg":
            self.tissue_data = self.tissue_data.mean(axis=1)
        elif self.sample_strategy == "median":
            self.tissue_data = self.tissue_data.median(axis=1)
        else:
            print("Invalid sample strategy")

        # Take logarithm
        self.tissue_data = np.log2(self.tissue_data + 1)

        # Remove zero entries to prevent a "bump" around 0
        self.tissue_data = self.tissue_data.values

    def make_histogram(self) -> plotly.graph_objs._figure.Figure:
        """This function uses plotly's create_distplot function to create an interactive histogram

        Returns:
            histogram: Plotly object containing the histogram
        """
        if self.dataset == "tcga":
            histogram = ff.create_distplot(
                [self.tissue_data],
                ["tissue"],
                bin_size=0.1,
                show_rug=False,
                colors=[self.colormap[2]],
            )
        elif self.dataset == "gtex":
            histogram = ff.create_distplot(
                [self.tissue_data],
                ["tissue"],
                bin_size=0.1,
                show_rug=False,
                colors=[self.colormap[4]],
            )

        else:
            print("Invalid dataset.")

        histogram.update_layout(
            yaxis_type="log",
            xaxis_title="Expression in log<sub>2</sub>(TPM+1)",
            yaxis_title="Number of genes (log<sub>10</sub>(density))",
            title_x=0.5,
            width=600,
            height=400,
            margin=dict(l=0, r=0, b=60, t=0),
            showlegend=False,
        )

        # Add range slider
        histogram.update_layout(
            xaxis=dict(
                rangeslider=dict(visible=True),
            )
        )

        return histogram

    def write_histogram(
        self, histogram: plotly.graph_objs._figure.Figure, target_dir: str
    ) -> None:
        """Write histogram to disk

        Args:
            histogram (plotly.Figure): the histogram
            target_dir (Path): the directory where histogram is written
            sample_strategy (str): the sample strategy adopted for the histogram

        Returns:
            None
        """
        Path(target_dir).mkdir(parents=True, exist_ok=True)
        file_name = (
            str(target_dir) + "/" + self.tissue_name + "." + self.sample_strategy + ".html"
        )
        histogram.write_html(file_name)

    def prepare_make_and_write_histogram(self, target_dir: str) -> None:
        """Prepare tissue data, make Plotly histogram and write HTML plot to filfe

        Args:
            target_dir: Directory where to write the file

        Returns:
            None
        """
        self.prepare_tissue()
        histogram = self.make_histogram()
        self.write_histogram(histogram, target_dir)


if __name__ == "__main__":
    Path(HISTOGRAM_DIR).mkdir(parents=True, exist_ok=True)

    for dataset in ["tcga", "gtex"]:
        print(f"Processing {dataset}")
        data_dir = DATA_DIR + "/structured/" + dataset
        for root, dirs, tissue_files in os.walk(data_dir):
            for tissue_file in tissue_files:
                if "counts" in tissue_file:
                    continue
                tissue_data = pd.read_csv(f"{root}/{tissue_file}", index_col="gene_id")
                # TODO: why does HISTOGRAM_DIR + root.split("structured", 1)[1] not work?
                target_dir = Path(
                    str(HISTOGRAM_DIR) + str(root.split("structured", 1)[1]) + "/"
                )

                def plotlyHelperContainerFun(aPayloadObject):
                    aPayloadObject.prepare_make_and_write_histogram(target_dir)

                runs = [
                    PlotlyHelper(dataset, tissue_file, tissue_data, sample_strategy)
                    for sample_strategy in SAMPLE_STRATEGIES
                ]

                Parallel(n_jobs=N_JOBS, verbose=1)(
                    delayed(plotlyHelperContainerFun)(run) for run in runs
                )
