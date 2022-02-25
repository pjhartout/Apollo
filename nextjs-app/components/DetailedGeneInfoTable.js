import { useMemo, useState } from "react";
import { Context } from "./Store";
import DownloadableTable from "./DownloadableTable";
import columnData from "../public/tableColumns/columnsDetailedGeneInfoTable.json";
import { isUndefined, isEmptyObject } from "../helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "./DetailedGeneInfoTable.module.scss";
import ExperimentalEvidenceCodes from "./ExperimentalEvidenceCodes.js";

const DetailedGeneInfoTable = (gene) => {
  const geneInfo = useMemo(() => {
    return gene.gene[0];
  }, [gene]);

  const pathWayTableData = useMemo(() => {
    if (!isUndefined(geneInfo)) {
      return [
        {
          tableName: "KEGG pathways",
          tableExplainer:
            "The Kyoto Encyclopedia of Genes and Genomes compiles pathways comprising information about genes involved in physiological or pathophysiological pathways.",
          columnDataEntry: "columnsKeggPathways",
          arrayOfObjects: isUndefined(geneInfo.pathway)
            ? []
            : geneInfo.pathway.kegg,
          maxNumberOfRows: 20,
        },
        {
          tableName: "Reactome Pathways",
          tableExplainer:
            "This is a database that documents biological pathways curated by experts.",
          columnDataEntry: "columnsReactomePathways",
          arrayOfObjects: isUndefined(geneInfo.pathway)
            ? []
            : geneInfo.pathway.reactome,
          maxNumberOfRows: 20,
        },
        {
          tableName: "Wiki Pathways",
          tableExplainer:
            "This is a database that documents biological pathways curated by the community.",
          columnDataEntry: "columnsWikiPathways",
          arrayOfObjects: isUndefined(geneInfo.pathway)
            ? []
            : geneInfo.pathway.wikipathways,
          maxNumberOfRows: 20,
        },
        {
          tableName: "Publications mentioning gene",
          tableExplainer: "",
          columnDataEntry: "columnsPublicationsMentioningGene",
          arrayOfObjects: isUndefined(geneInfo.pathway) ? [] : geneInfo.generif,
          maxNumberOfRows: 20,
        },
        {
          tableName: "GO terms related to biological processes",
          tableExplainer: (
            <>
              <span>
                These are gene ontology terms pertaining to a biological process
                that are associated to this gene.
              </span>
              <ExperimentalEvidenceCodes />
            </>
          ),
          columnDataEntry: "columnsGOBiologicalProcess",
          arrayOfObjects: isUndefined(geneInfo.go) ? [] : geneInfo.go.BP,
          maxNumberOfRows: 20,
        },
        {
          tableName: "GO terms related to cellular components",
          tableExplainer: (
            <>
              <span>
                These are gene ontology terms pertaining to a cellular component
                that are associated to this gene.
              </span>
              <ExperimentalEvidenceCodes />
            </>
          ),
          columnDataEntry: "columnsGOCellularComponent",
          arrayOfObjects: isUndefined(geneInfo.go) ? [] : geneInfo.go.CC,
          maxNumberOfRows: 20,
        },
        {
          tableName: "GO terms related to molecular functions",
          tableExplainer: (
            <>
              <span>
                These are gene ontology terms pertaining to a molecular function
                that are associated to this gene.
              </span>
              <ExperimentalEvidenceCodes />
            </>
          ),
          columnDataEntry: "columnsGOMolecularFunction",
          arrayOfObjects: isUndefined(geneInfo.go) ? [] : geneInfo.go.MF,
          maxNumberOfRows: 20,
        },
      ];
    }
  }, [geneInfo]);

  const detailedGeneInfoTables = useMemo(() => {
    if (!isUndefined(pathWayTableData)) {
      return pathWayTableData.map((table) => {
        if (
          isUndefined(table.arrayOfObjects) ||
          isEmptyObject(table.arrayOfObjects)
        ) {
          return <div>No data available for {table.tableName}</div>;
        }

        const arrayOfObjects = !Array.isArray(table.arrayOfObjects)
          ? [table.arrayOfObjects]
          : table.arrayOfObjects;

        return (
          <DownloadableTable
            columnData={columnData}
            tableName={table.tableName}
            tableExplainer={table.tableExplainer}
            columnDataEntry={table.columnDataEntry}
            tableData={arrayOfObjects}
            maxNumberOfRows={table.maxNumberOfRows}
          />
        );
      });
    }
  }, [pathWayTableData]);

  const wikipediaLink = useMemo(() => {
    if (!isUndefined(geneInfo) && !isUndefined(geneInfo.wikipedia)) {
      const link = "https://en.wikipedia.org/wiki/".concat(
        geneInfo.wikipedia.url_stub
      );
      return (
        <span>
          - Wiki for{" "}
          <a href={link} target="_blank" className={styles.anchor}>
            {geneInfo.interpro.desc || geneInfo.alias}
            <span className={styles.icon}>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
            </span>
          </a>
        </span>
      );
    }
  }, [geneInfo]);

  return (
    <>
      {wikipediaLink}
      {!isUndefined(detailedGeneInfoTables) ? detailedGeneInfoTables : null}
    </>
  );
};

export default DetailedGeneInfoTable;
