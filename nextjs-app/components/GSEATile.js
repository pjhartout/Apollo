import { useCallback, useContext, useMemo, useState, useEffect } from "react";
import { Context } from "./Store";

import DownloadableTable from "./DownloadableTable";
import styles from "./Table.module.scss";
import {
  getProteinCodingGeneProperty,
  isEmptyObject,
  isUndefined,
} from "../helpers/helpers";
import { fetchExternalData } from "../helpers/apiHelpers";
import columnData from "../public/tableColumns/columnsGSEATile.json";
import Loader from "./Loader";

const GSEATile = () => {
  /* Here we take care of the gene set enrichment analysis using the stringdb API
     https://string-db.org/cgi/help.pl?subpage=api%23mapping-identifiers
   */
  const [state, _] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [GSEAData, setGSEAData] = useState({});
  const [proteinCodingGenes, setProteinCodingGenes] = useState([]);

  useEffect(() => {
    if (!isUndefined(state.ensemblGeneInfo)) {
      setProteinCodingGenes(
        getProteinCodingGeneProperty(state.ensemblGeneInfo, "display_name")
      );
    } else {
      alert("state.ensemblGeneInfo is undefined");
    }
  }, []);

  useEffect(() => {
    if (proteinCodingGenes.length > 0) {
      const requestOptions = {
        method: "GET",
        headers: new Headers(),
        redirect: "follow",
      };
      const url =
        "https://string-db.org/api/json/enrichment?identifiers=".concat(
          "[",
          proteinCodingGenes.join("%0d"),
          "]"
        );
      setIsLoading(true);
      fetchExternalData(requestOptions, url).then((data) => {
        setIsLoading(false);

        !isUndefined(data)
          ? (data = data.map((row) => {
              row["preferredNames"] = row["preferredNames"].join(";");
              row["inputGenes"] = row["inputGenes"].join(";");
              return row;
            }))
          : data;
        setGSEAData(data);
      });
    }
  }, [proteinCodingGenes]);

  const GSEATable = useMemo(() => {
    return {
      tableName: "GSEA Table",
      columnDataEntry: "GSEATable",
      arrayOfObjects: GSEAData,
      maxNumberOfRows: 20,
    };
  }, [GSEAData]);

  const downloadableTable = useMemo(() => {
    return (
      <>
        <DownloadableTable
          columnData={columnData}
          tableName={GSEATable.tableName}
          columnDataEntry={GSEATable.columnDataEntry}
          tableData={GSEATable.arrayOfObjects}
          maxNumberOfRows={GSEATable.maxNumberOfRows}
        />
        <div>
          Please refer to the{" "}
          <a href="https://string-db.org/cgi/help" target="_blank">
            StringDB documentation
          </a>{" "}
          for more details on the result of the GSEA. You can also conduct a
          GSEA using
          <a href="https://maayanlab.cloud/Enrichr/" target="_blank">
            Enrichr
          </a>
          .
        </div>
      </>
    );
  }, [GSEATable]);

  return (
    <div>
      {isLoading ? (
        <div>
          Computing GSEA on StringDB servers. This can take some time...
          <br />
          <Loader className="loaderRelative" />
        </div>
      ) : !isUndefined(GSEAData) && !isEmptyObject(Object.keys(GSEAData)) ? (
        downloadableTable
      ) : isEmptyObject(Object.keys(proteinCodingGenes)) ? (
        <div> No protein-coding genes selected, so cannot perform GSEA.</div>
      ) : (
        <div>No GSEA has been obtained yet.</div>
      )}
    </div>
  );
};

export default GSEATile;
