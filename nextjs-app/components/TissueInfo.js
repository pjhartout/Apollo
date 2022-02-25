import { useState, useContext, useEffect, useMemo } from "react";
import { Context } from "./Store";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

import Button from "./Button";
import TissueInfoText from "./TissueInfoText";
import GenePercentileData from "./GenePercentileData";

import { isEmptyObject, isNull, isUndefined } from "../helpers/helpers";
import styles from "./TissueInfo.module.scss";

const MIN_SAMPLE_FOR_SKEW_STD_INFO = 20;

const TissueInfo = ({ tissue }) => {
  const [state, _] = useContext(Context);
  const [numberOfSamples, setNumberOfSamples] = useState(1);
  const [showResults, setShowResults] = useState(false);

  const onClick = () => setShowResults(!showResults);

  const tissueData = useMemo(() => {
    return state.tissues.find((t) => t.label === tissue);
  }, [state.tissues]);

  useEffect(() => {
    if (
      !isUndefined(tissueData.tpmBounds) &&
      !isUndefined(tissueData.expressionData)
    ) {
      setNumberOfSamples(tissueData.expressionData.number_of_samples);
    }
  }, [tissueData.expressionData, tissueData.tpmBounds]);

  return (
    <div>
      {!isUndefined(tissueData.tpmBounds) &&
      !isNull(tissueData.tpmBounds[0]) ? (
        <TissueInfoText
          tissueData={tissueData}
          numberOfSamples={numberOfSamples}
        />
      ) : (
        "Loading..."
      )}
      <div>
        <Button
          className={styles.advancedOptionsButton}
          onClick={onClick}
          icon={
            <FontAwesomeIcon icon={showResults ? faChevronUp : faChevronDown} />
          }
          text={"Advanced Options"}
        />
        {showResults ? (
          <GenePercentileData
            tissueData={tissueData}
            numberOfSamples={numberOfSamples}
          />
        ) : null}
      </div>
    </div>
  );
};

export default TissueInfo;
