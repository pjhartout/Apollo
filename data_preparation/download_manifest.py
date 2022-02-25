#!/usr/bin/env python

"""Downloads and stores manifest file in manifests directory based on filter
defined in tcga_filter.json.

TODO: add logger
"""

import dotenv

from pathlib import Path

from tcga_api_handler import APIHandlerTCGA

from utils import load_settings
settings = load_settings()

TCGA_FILTER = settings["tcga_filter"]

CONSTANTS = dotenv.dotenv_values()



def main():
    APIhandler = APIHandlerTCGA(API_filter=TCGA_FILTER)
    manifest_df = APIhandler.get_manifest()
    output_dir = Path(CONSTANTS["MANIFEST_DIR"])
    output_dir.mkdir(exist_ok=True, parents=True)
    manifest_df.to_csv(output_dir / "manifest.txt", index=False, sep="\t")
    print(f"Written manifest file to {output_dir / 'manifest.txt'}.")


if __name__ == "__main__":
    main()
