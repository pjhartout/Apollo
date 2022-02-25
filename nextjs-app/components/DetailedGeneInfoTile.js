import { useState, useEffect, useMemo, useContext } from "react";
import styles from "./DetailedGeneInfoTile.module.scss";
import {
  getProteinCodingGeneProperty,
  getProteinCodingGeneProperties,
  isEmptyObject,
  isNull,
  isUndefined,
} from "../helpers/helpers";
import { Context } from "./Store";
import { fetchExternalData } from "../helpers/apiHelpers";
import Select from "react-select";
import DetailedGeneInfoTable from "./DetailedGeneInfoTable";

const DetailedGeneInfoTile = () => {
  /*
    Here we compute the gene ontology terms associated to each gene.
    It's a two-step process: first, we get the _ids from mygene.info and then
    we use these ids to fetch go term information
  */
  const [state, _] = useContext(Context);
  const [isLoading, setIsLoading] = useState(false);
  const [genesToExplore, setGenesToExplore] = useState({});
  const [entrezGeneIDs, setEntrezGeneIDs] = useState({});
  const [myGeneInfoData, setMyGeneInfoData] = useState({});
  const [detailedGeneInfoTables, setDetailedGeneInfoTables] = useState([]);
  const [notFound, setNotFound] = useState([]);

  const ensembleGeneIDs = useMemo(() => {
    return [getProteinCodingGeneProperty(state.ensemblGeneInfo, "id")][0];
  }, [state.ensemblGeneInfo]);

  const geneOptions = useMemo(() => {
    return getProteinCodingGeneProperties(state.ensemblGeneInfo, [
      "id",
      "display_name",
    ]).map((elem) => {
      return { value: elem[0], label: elem[1] };
    });
  }, [state.ensemblGeneInfo]);

  const onChange = (selectedOptions, _) => {
    if (!isUndefined(selectedOptions.value)) {
      setIsLoading(true);
      setGenesToExplore([selectedOptions.value]);
    } else {
      alert("Undefined: selectedOptions.value");
    }
  };

  useEffect(() => {
    if (!isUndefined(genesToExplore) && genesToExplore.length > 0) {
      const headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });

      const requestOptions = {
        method: "POST",
        headers: headers,
        redirect: "follow",
      };

      const url = "https://mygene.info/v3/query?q=".concat(
        genesToExplore.join(","),
        "&fields=_id"
      );

      fetchExternalData(requestOptions, url).then((data) => {
        data[0].notfound == true ? setNotFound(true) : setNotFound(false);
        setEntrezGeneIDs(
          Object.values(data).map((gene) => {
            return gene["_id"];
          })
        );
      });
    }
  }, [genesToExplore]);

  useEffect(() => {
    if (entrezGeneIDs.length > 0) {
      const headers = new Headers({
        "Content-Type": "application/x-www-form-urlencoded",
      });

      const requestOptions = {
        method: "POST",
        headers: headers,
        redirect: "follow",
      };

      const url = "https://mygene.info/v3/gene?ids=".concat(
        entrezGeneIDs.join(",")
      );
      fetchExternalData(requestOptions, url).then((data) => {
        setIsLoading(false);
        setMyGeneInfoData(data);
      });
    }
  }, [entrezGeneIDs]);

  return isEmptyObject(geneOptions) ? (
    <div>No proteins are included in the selection</div>
  ) : (
    <>
      <h2 className={styles.tableName}>Detailed Gene Information</h2>
      <p className={styles.tableExplainer}>
        This series of tables compiles detailed available information for each
        of the protein coding genes selected in the set intersection. When
        available, a relevant wikipedia link will appear. There are also tables
        that include information coming from pathway data (KEGG, reactome
        pathways, wiki pathways) which compile evidence from peer-reviewed
        articles. Gene Ontology information is also displayed. For convenience,
        the evidence codes for each gene is abbreviated, but a full list of
        abbreviations can be found above the tables.
      </p>
      <Select
        isLoading={isLoading}
        instanceId="125896"
        className={"basic-single " + styles.select}
        classNamePrefix="select"
        placeholder={`Select gene...`}
        options={geneOptions}
        onChange={onChange}
      />
      {!isUndefined(myGeneInfoData) &&
      !isNull(myGeneInfoData) &&
      !isEmptyObject(myGeneInfoData) ? (
        <>
          <div>
            Please refer to the{" "}
            <a
              href="https://docs.mygene.info/en/latest/index.html"
              target="_blank"
            >
              mygene.info documentation
            </a>{" "}
            for more details on the results below.
          </div>
          <DetailedGeneInfoTable gene={myGeneInfoData} />
        </>
      ) : notFound ? (
        <div>No information found for this gene.</div>
      ) : (
        <div>No gene selected yet.</div>
      )}
    </>
  );
};

export default DetailedGeneInfoTile;
