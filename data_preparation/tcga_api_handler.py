# -*- coding: utf-8 -*-


import json
import re
from io import StringIO
from typing import List

import numpy as np
import pandas as pd
import requests


class APIHandlerTCGA:
    # TODO:
    # - Finish docstrings
    # - Check imports
    # - Test
    def __init__(
        self,
        API_filter,
        url: str = "https://api.gdc.cancer.gov/",
        format: str = "TSV",
        size: int = 16000,
    ):
        """
        Args:
            filter:
            url:
            format:
            size:
        """
        self.filter = API_filter
        self.url = url
        self.format = format
        self.size = size

    def get_manifest(self) -> pd.DataFrame:
        """Get manifest file applying a filter

        Returns:
            pd.DataFrame
        """
        params = {
            "filters": json.dumps(self.filter),
            "return_type": "manifest",
            "format": self.format,
            "size": self.size,
        }

        response = requests.get(f"{self.url}/files", params=params)
        content = StringIO(response.content.decode("utf-8"))
        manifest_df = pd.read_csv(content, sep="\t")

        return manifest_df

    def _get_fields_for_endpoint(
        self, fields: List[str], endpoint: str
    ) -> pd.DataFrame:
        """Get fields for endpoint from GDC API

        Args:
            fields: List of fields to request from API
            endpoint: API endpoint

        Returns:
            pd.DataFrame containing data from API response
        """
        params = {
            "filters": json.dumps(self.filter),
            "fields": ",".join(fields),
            "format": self.format,
            "size": self.size,
        }

        response = requests.get(f"{self.url}/{endpoint}", params=params)
        content = StringIO(response.content.decode("utf-8"))
        df = pd.read_csv(content, sep="\t")
        return df

    @staticmethod
    def convert_name(tissue_name: str) -> str:
        return "_".join(re.findall("[\w]+", tissue_name.lower()))

    @staticmethod
    def load_counts(path: str) -> pd.DataFrame:
        out_df = pd.read_csv(path, sep="\t", index_col=0, header=None,)
        out_df.index.name = "gene_id"
        return out_df[out_df.columns[0]]

    @staticmethod
    def make_disease_type2primary_site2file_id(
        case_id2file_id: pd.DataFrame, case_id2disease_info: pd.DataFrame
    ) -> pd.Series:
        combined_df = (
            case_id2file_id.rename("file_id")
            .to_frame()
            .merge(case_id2disease_info, how="left", left_index=True, right_index=True,)
        )
        return pd.Series(
            data=combined_df["file_id"].values,
            index=pd.MultiIndex.from_frame(
                combined_df[["disease_type", "primary_site"]]
            ),
        )

    def get_file_id2file_name(self) -> pd.Series:
        file_df = self._get_fields_for_endpoint(["file_name"], "files")

        file_id2file_name = pd.Series(
            index=file_df["id"].values, data=file_df["file_name"].values
        ).str[
            :-3
        ]  # remove .gz part

        return file_id2file_name

    def get_case_id2file_id(self, file_ids) -> pd.DataFrame:
        """Given file_id's in directory, returns case_id2file_id"""
        case_df = self._get_fields_for_endpoint(["files.file_id"], "cases")
        case_df.set_index("id", drop=True, inplace=True)
        # Convert all irrelevant file_id's to nan
        case_df[(~case_df.isin(file_ids))] = np.nan
        # Some pandas magic to quickly get a case_id2file_id
        case_id2file_id = case_df.stack().dropna().reset_index(drop=True, level=1)
        return case_id2file_id

    def get_case_id2disease_info(self) -> pd.DataFrame:
        case_df = self._get_fields_for_endpoint(
            ["primary_site", "disease_type"], "cases"
        )
        case_df.set_index("id", drop=True, inplace=True)
        return case_df

    def get_file_id2sample_type(self) -> pd.Series:
        case_df = self._get_fields_for_endpoint(
            [
                "cases.samples.portions.analytes.aliquots",
                "cases.samples.sample_type",
                "file_id",
            ],
            "files",
        )
        file_id2sample_type = pd.Series(
            index=case_df["file_id"].values,
            data=case_df["cases.0.samples.0.sample_type"].values,
        )
        file_id2sample_type = file_id2sample_type.apply(self.convert_name)

        return file_id2sample_type
