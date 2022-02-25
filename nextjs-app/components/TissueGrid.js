import { useContext, useMemo } from "react";
import { Context } from "./Store";
import { isUndefined, overlapGTExTCGA } from "../helpers/helpers";
import TissueTile from "./TissueTile";

import styles from "./TissueGrid.module.scss";

const TissueGrid = (height, width) => {
  const [state, _] = useContext(Context);

  const OverlapWarning = (
    <p className={styles.note}>
      <b>Warning:</b> you have selected GTEx and TCGA tissues which likely
      contain overlapping gene expression ranges (TPM). This may have
      undesirable effects on downstream analysis.
    </p>
  );

  const renderOverLapWarning = useMemo(() => {
    return overlapGTExTCGA(state.tissues) ? OverlapWarning : <div />;
  }, [JSON.stringify(state.tissues)]);

  const tissueTiles = useMemo(() => {
    return state.tissues.map((tissue, index) => {
      return <TissueTile tissue={tissue} key={tissue.label} />;
    });
  }, [state.tissues]);

  return (
    <>
      {renderOverLapWarning}
      <div className={styles.tissueGrid}>{tissueTiles}</div>
    </>
  );
};

export default TissueGrid;
