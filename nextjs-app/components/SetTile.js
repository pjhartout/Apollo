import {
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Context } from "./Store";
import Button from "./Button";
import Loader from "./Loader";
import { UncontrolledReactSVGPanZoom } from "react-svg-pan-zoom";

import UpSetJS, {
  VennDiagram,
  extractCombinations,
  createVennJSAdapter,
} from "@upsetjs/react";
import { layout } from "@upsetjs/venn.js";
import Switch from "@material-ui/core/Switch";
import { BsArrowRepeat } from "react-icons/bs";
import {
  allTissuesHaveGeneLists,
  createGene2Sets,
  getTissueGroupGeneList,
  getTissueGroupNames,
  hasExpressionData,
  isEmptyObject,
  isUndefined,
  isNull,
} from "../helpers/helpers";

import { useWindowSize } from "../hooks/index.js";

import styles from "./SetTile.module.scss";

import caps from "../public/caps.json";

const MAX_NUM_TISSUES_FOR_VENN = caps.MAX_NUM_TISSUES_FOR_VENN;
const ENSEMBL_POST_CAP = caps.ENSEMBL_POST_CAP;

const SetTile = () => {
  const [state, dispatch] = useContext(Context);
  const [selection, setSelection] = useState([]);
  const [sets, setSets] = useState();
  const [combinations, setCombinations] = useState();
  const [gene2Set, setGene2Set] = useState([]);

  const [canRefreshSetPlot, setCanRefreshSetPlot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const Viewer = useRef(null);
  const updateNumber = useRef(0);
  const windowSize = useWindowSize();

  useEffect(() => {
    if (!isNull(Viewer.current)) {
      Viewer.current.fitToViewer();
    }
  }, []);

  useEffect(() => {
    if (
      !isUndefined(selection) &&
      !isNull(selection) &&
      !isEmptyObject(selection)
    ) {
      const selectedGenesIndexEulerPlotObject = 1;
      dispatch({
        type: "SET_SELECTED_GENES",
        payload: Object.values(selection)[selectedGenesIndexEulerPlotObject],
      });
    }
  }, [selection]);

  useEffect(() => {
    computeSetOps();

    dispatch({
      type: "UNSET_DOWNLOADED",
    });
  }, [state.wasStateDownloaded]);

  useEffect(() => {
    const { sets, combinations } = extractCombinations(gene2Set, {
      combinationOrder: ["cardinality:asc", "name"],
    });
    setSets(sets);
    setCombinations(combinations);
  }, [gene2Set]);

  const eulerDiagram = useMemo(() => {
    return (
      <>
        <UncontrolledReactSVGPanZoom
          ref={Viewer}
          width={windowSize.width - 400}
          height={500}
          background="white"
          customToolbar="none"
          miniatureProps={{ position: "none" }}
          detectAutoPan={false}
        >
          <svg>
            <VennDiagram
              layout={createVennJSAdapter(layout)}
              sets={sets}
              selection={selection}
              onClick={setSelection}
              width={windowSize.width - 600}
              height={500}
              padding={30}
              selectionColor={"#9eb9f3"}
              exportButtons={false}
            />
          </svg>
        </UncontrolledReactSVGPanZoom>
      </>
    );
  }, [selection, sets, windowSize.width]);

  const computeSetOps = () => {
    setIsLoading(true);
    const expressionData = state.tissues.map((tissue) => {
      return tissue.expressionData;
    });

    if (state.wasStateDownloaded || hasExpressionData(expressionData)) {
      const tissueGroupGeneLists = getTissueGroupGeneList(
        state.tissueGroups,
        state.tissues
      );

      const tissueGroupNames = getTissueGroupNames(state.tissueGroups);
      setGene2Set(createGene2Sets(tissueGroupGeneLists, tissueGroupNames));
    }
  };

  useEffect(() => {
    setIsLoading(false);
  }, [gene2Set]);

  const renderSetPlot = useCallback(() => {
    return (
      <>
        {isLoading ? (
          <div>
            <Loader className="loaderRelative" />
          </div>
        ) : (
          <>
            (scroll to zoom)
            {eulerDiagram}
          </>
        )}
      </>
    );
  }, [gene2Set, () => {}]);

  const numSelectedGenes = useMemo(() => {
    return !isUndefined(state.selectedGenes)
      ? state.selectedGenes.length
      : null;
  }, [state.selectedGenes]);

  const readyForAnalysis = () => {
    let res;
    if (numSelectedGenes > ENSEMBL_POST_CAP) {
      res = (
        <p className={styles.note}>
          <b>Warning:</b> a maximum of {ENSEMBL_POST_CAP} selected genes can be
          processed in the downstream analysis.
        </p>
      );
    } else if (numSelectedGenes != 0) {
      res = <p className={styles.note}>Ready for gene analysis 👍</p>;
    }
    return res;
  };

  useEffect(() => {
    if (updateNumber.current < 2) {
      if (
        updateNumber.current > 0 &&
        isEmptyObject(gene2Set) &&
        isEmptyObject(sets)
      ) {
        setCanRefreshSetPlot(true);
      }

      updateNumber.current += 1;
      return;
    }

    setCanRefreshSetPlot(true);
  }, [
    state.tissues,
    ...state.tissues.map((tissue) => tissue.tpmBounds),
    state.tissueGroups.groups,
    ...Object.keys(state.tissueGroups.groups).map((group) => {
      return state.tissueGroups.groups[group].isIntersection;
    }),
    ...Object.keys(state.tissueGroups.groups).map((group) => {
      return state.tissueGroups.groups[group].title;
    }),
    state.tissueGroups.toggleSetOps,
  ]);

  const onClickRecomputeSetPlot = () => {
    if (allTissuesHaveGeneLists(state.tissues)) {
      computeSetOps();
      setCanRefreshSetPlot(false);
    }
  };

  return (
    <div className={styles.setTile}>
      <p>
        <Button
          id={"reComputeSets"}
          onClick={onClickRecomputeSetPlot}
          disabled={!canRefreshSetPlot}
          icon={<BsArrowRepeat />}
          text={"Recompute Set Plot"}
          className={styles.recomputeSetPlotButton}
        />
      </p>
      {!isEmptyObject(gene2Set) && !isEmptyObject(sets)
        ? renderSetPlot()
        : null}
      <p className={styles.downstreamInfo}>
        There are currently <b>{numSelectedGenes} genes</b> selected for the
        downstream analysis.
        {readyForAnalysis()}
      </p>
    </div>
  );
};

export default SetTile;
