import { Fragment, useState, useContext, useEffect, useCallback } from "react";

import { Context } from "./Store";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import Button from "./Button";
import TissueInfo from "./TissueInfo";
import { isEmptyObject } from "../helpers/helpers";
import styles from "./TissueTile.module.scss";

const sampleStrategies = ["min", "max", "avg", "median"];

const getGeneList = (geneExpression, sampleStrategy, tpmBounds) => {
  const bounds = { lower: 0, upper: 1 };

  return Object.keys(geneExpression).filter((gene) => {
    const geneExpressionValue = geneExpression[gene][sampleStrategy];
    if (
      geneExpressionValue >= tpmBounds[bounds["lower"]] &&
      geneExpressionValue <= tpmBounds[bounds["upper"]]
    ) {
      return gene;
    }
  });
};

const TissueTile = ({ tissue }) => {
  const [_, dispatch] = useContext(Context);
  const [sampleStrategy, setSampleStrategy] = useState("avg");
  const [generatedHistogram, setGeneratedHistogram] = useState("");
  const [expressionData, setExpressionData] = useState({});
  const [hasPlotlyLoaded, setHasPlotlyLoaded] = useState(false);

  const onChange = (e) => {
    setSampleStrategy(e.target.value);
    setHasPlotlyLoaded(!hasPlotlyLoaded);
  };

  const onClick = () => {
    dispatch({
      type: "REMOVE_TISSUE",
      payload: {
        label: tissue.label,
        value: tissue.value,
        index: tissue.index,
      },
    });
    dispatch({ type: "UNSET_SELECTED_GENES" });
  };

  const dispatchSelectionInfo = useCallback(
    (tpmBounds, label, value, sampleStrategy) => {
      if (!isEmptyObject(expressionData)) {
        const geneList = getGeneList(
          expressionData.gene_expression,
          sampleStrategy,
          tpmBounds
        );

        return dispatch({
          type: "UPDATE_TISSUE_SELECTION_DATA",
          payload: {
            label: tissue.label,
            tpmBounds: tpmBounds,
            sampleStrategy: sampleStrategy,
            geneList: geneList,
          },
        });
      }
      return [];
    },
    [hasPlotlyLoaded, expressionData]
  );

  useEffect(() => {
    const fetchExpressionData = async () => {
      try {
        const response = await fetch(tissue.value);
        const json = await response.json();
        setExpressionData(json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchExpressionData();
  }, []);

  useEffect(() => {
    dispatch({
      type: "ADD_TISSUE_GENE_EXPRESSION_DATA",
      payload: {
        label: tissue.label,
        expressionData: expressionData,
      },
    });
  }, [expressionData]);

  useEffect(() => {
    setGeneratedHistogram(
      tissue.value
        .split(".")
        .slice(0, -1)
        .join(".")
        .replace("reduced", "")
        .replace("data/", "histograms")
        .replace("//", "/") +
        "." +
        sampleStrategy +
        ".html"
    );
  }, [sampleStrategy]);

  useEffect(() => {
    if (generatedHistogram !== "") {
      const plotlyIframe = document.getElementById(generatedHistogram);
      plotlyIframe.addEventListener("load", () => {
        setHasPlotlyLoaded(true);
      });
    }
  }, [generatedHistogram]);

  useEffect(() => {
    if (hasPlotlyLoaded && !isEmptyObject(expressionData)) {
      const plotlyIframe = document.getElementById(generatedHistogram);

      const plotlyGraphDiv =
        plotlyIframe.contentDocument.getElementsByClassName(
          "plotly-graph-div"
        )[0];

      const plotlyLayout = plotlyGraphDiv.layout;
      let xAxisRange = plotlyLayout.xaxis.range;

      dispatchSelectionInfo(
        xAxisRange,
        tissue.label,
        tissue.value,
        sampleStrategy
      );

      plotlyGraphDiv.on("plotly_relayout", () => {
        xAxisRange = plotlyLayout.xaxis.range;
        dispatchSelectionInfo(
          xAxisRange,
          tissue.label,
          tissue.value,
          sampleStrategy
        );
      });
    }
  }, [expressionData, hasPlotlyLoaded]);

  return (
    <div className={styles.tissueTile}>
      <div className={styles.header}>
        <h2>{tissue.label}</h2>
        <Button
          id={tissue.label}
          onClick={onClick}
          icon={<FontAwesomeIcon icon={faTimes} />}
        />
      </div>

      <div onChange={onChange}>
        <span>Sample strategy:</span>
        {sampleStrategies.map((x) => (
          <Fragment key={x}>
            <input
              type="radio"
              value={x}
              name={tissue.label}
              defaultChecked={sampleStrategy === x}
            />
            {x}
          </Fragment>
        ))}
      </div>

      <iframe
        id={generatedHistogram}
        src={generatedHistogram}
        width={630}
        height={430}
      />

      <TissueInfo tissue={tissue.label} />
    </div>
  );
};

export default TissueTile;
