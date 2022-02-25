#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""create_tissue_file_index.py
Script to create a JSON file index, similar to the code contained in
app.py for the dash app.

Note: Requires changing the .env values to DATADIR from local filesystem.
"""

import json
import os
from pathlib import Path
from typing import Dict, List

import dotenv

from utils import flatten_lists

DOTENV_KEY2VAL = dotenv.dotenv_values()
PUBLIC_DIR = DOTENV_KEY2VAL["PUBLIC_DIR"]
DATA_DIR = DOTENV_KEY2VAL["DATA_DIR"]
REDUCED_DATA_PATH = str(DATA_DIR + "reduced")
REDUCED_DATA_TREE_FILE = (
    Path(PUBLIC_DIR) / "data" / "reduced_tpm_data_index.json"
)


def remove_repeating_words(s: str):
    """

    Args:
        s: Input string

    Returns:
        res: Input string with repeating words removed
    """
    res = ""
    words = s.split(" ")
    for i, word in enumerate(words):
        if i + 1 < len(words) and word != words[i + 1]:
            res += f" {word}"

    res += f" {words[-1]}"

    return res


def path2name(path: str) -> str:
    """Format path to plain English

    Args:
        path: Path to a file containing TPM data

    Returns:
        formatted_path:  Name for a path in plain English
    """
    formatted_path = (
        path.replace(REDUCED_DATA_PATH, "")
        .replace("_", " ")
        .replace(".tpm.json", "")
        .replace("/", " ")
        .lstrip()
        .title()
        .replace("Tcga", "(TCGA)")
        .replace("Gtex", "(GTEx)")
    )

    formatted_path = remove_repeating_words(formatted_path)

    return formatted_path


def remove_dir_from_path(path: str, directory: str):
    """Remove a directory form a string representing a path

    Args:
        path: String resembling path
        directory: String resembling directory to be removed from path

    Returns:
        String resembling input path with directory removed
    """
    return path.replace(directory, "")


def get_tissue_index_from_path(path: str) -> str:
    """Get tissue index from path

    Args:
        path: String representing path to file containing TPM data

    Returns:
        index: Tissue index
    """
    with open(path) as f:
        tissue_data = json.load(f)
        index = str(tissue_data["index"])

    return index


def format_db_options(tpm_files: List[str]) -> List[Dict]:
    """Format database options

    Args:
        tpm_files:  List of TPM files

    Returns:
        options: Dict of [label, value, index]
    """
    options = [
        {
            "label": path2name(f),
            "value": remove_dir_from_path(f, PUBLIC_DIR),
            "index": get_tissue_index_from_path(f),
        }
        for f in tpm_files
    ]

    return options


def main():
    tpm_files = list()
    for root, dirs, files in os.walk(REDUCED_DATA_PATH):
        tpm_files.append(
            [f"{root}/{f}" for f in files if f.endswith(".tpm.json")]
        )

    tpm_files = flatten_lists([file for file in tpm_files if file != list()])
    tcga_tpm_files = list()
    gtex_tpm_files = list()
    for f in tpm_files:
        if "tcga" in f:
            tcga_tpm_files.append(f)
        elif "gtex" in f:
            gtex_tpm_files.append(f)

    tcga_options = format_db_options(tcga_tpm_files)
    gtex_options = format_db_options(gtex_tpm_files)

    db_label_2_tissue_options = [
        {"label": "TCGA", "options": tcga_options},
        {"label": "GTEX", "options": gtex_options},
    ]

    with open(REDUCED_DATA_TREE_FILE, "w") as f:
        json.dump(db_label_2_tissue_options, f)

    print(f"Exported paths to {REDUCED_DATA_TREE_FILE}")


if __name__ == "__main__":
    main()
