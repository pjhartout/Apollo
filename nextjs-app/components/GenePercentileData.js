import { useState, useEffect, useCallback, useMemo } from "react";

import { isUndefined, getTissuePercentile } from "../helpers/helpers";
import { useDebouncedEffect } from "../hooks";

import Loader from "./Loader";

import styles from "./GenePercentileData.module.scss";
import caps from "../public/caps.json";

const GenePercentileData = ({ tissueData, numberOfSamples }) => {
  const [percentile, setPercentile] = useState(99);
  const [highSkewGenes, setHighSkewGenes] = useState(-1);
  const [highStdGenes, setHighStdGenes] = useState(-1);

  const onChange = (e) => {
    setPercentile(e.target.value);
  };

  const getGenesAbovePercentile = useCallback(
    (statistic, geneExpression, geneList) => {
      const genesExpressionStatistic = Object.keys(geneExpression).map(
        (gene) => {
          return geneExpression[gene][statistic];
        }
      );

      const percentileValue = getTissuePercentile(
        percentile,
        genesExpressionStatistic.sort()
      );

      let genesWithHighStatistic = 0;
      const filtered = geneList.filter((gene) => {
        const geneValue = geneExpression[gene][statistic];
        if (geneValue >= percentileValue) {
          genesWithHighStatistic++;
        }
      });

      return genesWithHighStatistic;
    },
    [percentile]
  );

  useDebouncedEffect(
    () => {
      if (
        !isUndefined(tissueData.tpmBounds) &&
        !isUndefined(tissueData.expressionData) &&
        !isUndefined(tissueData.expressionData.gene_expression) &&
        numberOfSamples > caps.MIN_SAMPLE_FOR_SKEW_STD_INFO
      ) {
        const geneExpression = tissueData.expressionData.gene_expression;

        setHighSkewGenes(
          getGenesAbovePercentile("skew", geneExpression, tissueData.geneList)
        );
        setHighStdGenes(
          getGenesAbovePercentile("std", geneExpression, tissueData.geneList)
        );
      }
    },
    800,
    [percentile, tissueData.tpmBounds, numberOfSamples]
  );

  const noPercentileData = useMemo(() => {
    return (
      <div>Not enough tissues sampled to determine skew and std properties</div>
    );
  }, []);

  const percentileData = useMemo(() => {
    if (!(highSkewGenes === -1 && highStdGenes === -1)) {
      return (
        <>
          <div className={styles.percentileThreshold}>
            <span>
              Percentile threshold to determine genes with a high skew/variance:
            </span>
            <input
              type="number"
              name="percentile"
              value={percentile}
              onChange={onChange}
              min={0}
              max={100}
            />
          </div>
          <ul className={styles.skewStdDev}>
            <li>
              <span>{highSkewGenes} genes with high skew selected</span>
            </li>
            <li>
              <span>
                {highStdGenes} genes with high standard deviation selected
              </span>
            </li>
          </ul>
        </>
      );
    } else {
      return <Loader className="loaderRelative" />;
    }
  }, [highSkewGenes, highStdGenes]);

  return (
    <>
      {numberOfSamples > caps.MIN_SAMPLE_FOR_SKEW_STD_INFO
        ? percentileData
        : noPercentileData}
    </>
  );
};

export default GenePercentileData;
