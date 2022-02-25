import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import { Context } from "./Store";

import {
  isEmptyObject,
  isUndefined,
  isNull,
  removeGeneVersion,
} from "../helpers/helpers";

import DownloadableTable from "./DownloadableTable";
import Button from "./Button";
import Loader from "./Loader";
import { fetchExternalData } from "../helpers/apiHelpers";
import columnData from "../public/tableColumns/columnsGeneInfoTile.json";
import styles from "./EnsemblTile.module.scss";
import { withStyles } from "@material-ui/core/styles";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import { MdExpandMore } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import caps from "../public/caps.json";
import lengthInfo from "../public/data/genes_with_unequal_length.json";

const ENSEMBL_POST_CAP = caps.ENSEMBL_POST_CAP;

const parseEnsemblAPIResponse = (response) => {
  return Object.values(response).map((obj, index) => {
    return isNull(obj)
      ? {
          strand: "",
          display_name: "",
          start: "",
          assembly_name: "",
          biotype: "",
          seq_region_name: "",
          db_type: "",
          source: "",
          species: "",
          end: "",
          id: Object.keys(response)[index],
          logic_name: "",
          version: 1,
          object_type: "",
          description: "",
        }
      : obj;
  });
};

const getLengthDiffInfo = (gene) => {
  gene.isDifferentLength = Object.keys(
    lengthInfo.genes_with_nonequal_length
  ).includes(gene.id)
    ? lengthInfo.genes_with_nonequal_length[gene.id].toPrecision(4)
    : 0;
  return gene;
};

const addLengthDiffInfo = (ensemblGeneInfo) => {
  return ensemblGeneInfo.map((entry) => {
    return isUndefined(entry.canonical_transcript)
      ? entry
      : getLengthDiffInfo(entry);
  });
};

const AccordionSummaryWithStyles = withStyles({
  content: {
    marginTop: 20,
    marginBottom: 20,
  },
})(AccordionSummary);

const EnsemblTile = () => {
  /*
    This component displays information on the selected genes obtained from an
    external API endpoint, namely https://rest.ensembl.org.
  */
  const [state, dispatch] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [ensemblUnreachable, setEnsemblUnreachable] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const generalGeneInfoTile = useMemo(() => {
    const selectedGeneInfoTable = {
      tableName: "Ensembl API Gene Information",
      tableExplainer:
        "This table contains general information about the genes in the selected set. The information is retrieved from the Ensembl database. Each gene is identified with an Ensemble ID and a more human-readable gene name as commonly used in scientific publications. Thesecan be used to look up further information about the given gene. A short summary of the various functions of the gene is given under Description. The information provided in this table should give you a rough idea about the function of each gene in your analysis. Refer to the Ensembl API for more details. The biotype indicates the type of transcript that is generally derived from this gene. This is used as a filter for the tables in the next tab, where it's only possible to obtain detailed information about protein-coding genes. When looking at tissues coming from both GTEx and TCGA data, check the percentual difference in gene length difference between TCGA and GTEx datasets. It is not 0 when the gencode gene length is not equal between both versions used in each dataset. The percentage of length difference is always given with respect to the smallest available gene length. As such, this number maybe higher than 1 if the larger gene version is more than twice the length of the smallest gene version. The higher the percentual gene length difference, the more unreliable the TPM values are for this particular gene.",
      columnDataEntry: "columnsGeneInfoTile",
      arrayOfObjects: state.ensemblGeneInfo,
      maxNumberOfRows: 20,
    };

    return (
      <>
        <DownloadableTable
          columnData={columnData}
          tableName={selectedGeneInfoTable.tableName}
          tableExplainer={selectedGeneInfoTable.tableExplainer}
          columnDataEntry={selectedGeneInfoTable.columnDataEntry}
          tableData={selectedGeneInfoTable.arrayOfObjects}
          maxNumberOfRows={selectedGeneInfoTable.maxNumberOfRows}
        />
        <Accordion
          expanded={expanded === "panel1"}
          onChange={handleChange("panel1")}
          className={styles.root}
        >
          <AccordionSummaryWithStyles
            expandIcon={<MdExpandMore />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography className={styles.heading}>
              <b>What else can you do with this gene set?</b>
            </Typography>
          </AccordionSummaryWithStyles>
          <AccordionDetails>
            <Typography>
              With this gene set, you can do a number of things, for instance:
              <ul>
                <li>
                  you can conduct a{" "}
                  <a
                    href="https://en.wikipedia.org/wiki/Gene_set_enrichment_analysis"
                    target="blank"
                  >
                    gene set enrichment analysis
                  </a>
                  , for instance using{" "}
                  <a href="https://www.gsea-msigdb.org/" target="blank">
                    this tool
                  </a>
                  ;
                </li>
                <li>
                  you can also look at the various interactions between each
                  protein and their interaction partners using{" "}
                  <a href="https://string-db.org/" target="blank">
                    StringDB
                  </a>
                  .
                </li>
                <li>
                  You can also download the raw expression data associated to
                  these tissues and conduct further statistical analyses by
                  yourself.
                  <form
                    method="get"
                    action="https://polybox.ethz.ch/index.php/s/ISAUplTJkO9VGrs/download"
                  >
                    <Button
                      type={"submit"}
                      className={styles.downloadButton}
                      text={"Download Preprocessed Data (~12GB zip archive)"}
                      icon={<FontAwesomeIcon icon={faDownload} />}
                    />
                  </form>
                </li>
              </ul>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </>
    );
  }, [state.ensemblGeneInfo, expanded]);

  useEffect(() => {
    if (
      state.view === "genes-analysis" &&
      !isUndefined(state.selectedGenes) &&
      !isEmptyObject(state.selectedGenes) &&
      !ensemblUnreachable
    ) {
      setIsLoading(true);
      const genes2analyse = state.selectedGenes.map((gene) => {
        return removeGeneVersion(gene.name);
      });
      if (genes2analyse.length < ENSEMBL_POST_CAP) {
        const headers = new Headers({
          "Content-Type": "application/json",
          Accept: "application/json",
        });
        const body = JSON.stringify({ ids: genes2analyse });

        const requestOptions = {
          method: "POST",
          headers: headers,
          body: body,
          redirect: "follow",
        };

        const url = "https://rest.ensembl.org/lookup/id/";

        fetchExternalData(requestOptions, url)
          .then((ensemblGeneInfo) => {
            !isUndefined(ensemblGeneInfo)
              ? dispatch({
                  type: "SET_ENSEMBL_GENE_INFO",
                  payload: addLengthDiffInfo(
                    parseEnsemblAPIResponse(ensemblGeneInfo)
                  ),
                })
              : setEnsemblUnreachable(true);
            setIsLoading(false);
          })
          .catch();
      } else {
        dispatch({
          type: "SET_VIEW",
          payload: "too-many-selected-genes",
        });
        setIsLoading(false);
      }
    } else if (state.view === "genes-analysis") {
      alert(
        "API not reachable. This a due to an error between us and \
        rest.ensembl.org. Download your analysis settings and perform full \
        page refresh."
      );
      dispatch({
        type: "SET_VIEW",
        payload: "select-sets",
      });
    }
  }, [state.view]);

  return (
    <>
      {isLoading ? (
        <div>
          <Loader className="loaderRelative" />
        </div>
      ) : ensemblUnreachable ? (
        <div>API unreachable</div>
      ) : (
        generalGeneInfoTile
      )}
    </>
  );
};

export default EnsemblTile;
