import { useState, useEffect, useMemo } from "react";

import { isUndefined } from "../helpers/helpers";
import styles from "./TissueInfoText.module.scss";

const TissueInfoText = ({ tissueData, numberOfSamples }) => {
  const lowerTpmBound = useMemo(() => {
    return tissueData.tpmBounds[0].toPrecision(3);
  }, [tissueData.tpmBounds[0]]);
  const upperTpmBound = useMemo(() => {
    return tissueData.tpmBounds[1].toPrecision(3);
  }, [tissueData.tpmBounds[1]]);
  const numOfGenes = useMemo(() => {
    return tissueData.geneList.length;
  }, [tissueData.geneList]);

  const [proportionGenes, setProportionOfGenes] = useState(100);

  useEffect(() => {
    if (
      !isUndefined(tissueData.tpmBounds) &&
      !isUndefined(tissueData.expressionData)
    ) {
      const totalNumberOfGenes = Object.keys(
        tissueData.expressionData.gene_expression
      ).length;

      setProportionOfGenes(
        (tissueData.geneList.length / totalNumberOfGenes) * 100
      );
    }
  }, [tissueData.tpmBounds]);

  return (
    <div className={styles.tissueInfoText}>
      <ul>
        <li>
          <span>
            Selected tissues between {lowerTpmBound} and {upperTpmBound} log
            <sub>2</sub>(TPM)
          </span>
        </li>
        <li>
          <span>
            The tissue expression profile is deduced from {numberOfSamples}{" "}
            samples
          </span>
        </li>
        <li>
          <span>Selected {numOfGenes} genes</span>
        </li>
      </ul>
    </div>
  );
};

export default TissueInfoText;
