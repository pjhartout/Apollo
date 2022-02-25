#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
from pathlib import Path
from typing import Dict

import dotenv
import pandas as pd

DOTENV_KEY2VAL = dotenv.dotenv_values()


def load_settings() -> Dict:
    """Load settings file.

    Returns:
        Dict: settings file
    """
    with open(Path(DOTENV_KEY2VAL["PREP_DIR"]) / "settings.json") as f:
        res = json.load(f)

    return res


def get_gene_id2length(db_name: str) -> pd.DataFrame:
    """

    Args:
        db_name: "gtex" or "tcga"

    Returns:
        pd.Dataframe containing gene ids to length
    """
    gencode_dir = Path(DOTENV_KEY2VAL["DATA_DIR"]) / "structured" / "gencode"
    res = pd.read_csv(
        gencode_dir / f"gene_id2length_{db_name}.csv", index_col=0
    )

    return res["length"]


def flatten_lists(lists: list) -> list:
    """Removes nested lists"""
    result = list()
    for _list in lists:
        _list = list(_list)
        if _list != []:
            result += _list
        else:
            continue
    return result
