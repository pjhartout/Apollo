import { useContext, useMemo, useCallback } from "react";
import { Context } from "./Store";

import memoize from "fast-memoize";

import Button from "./Button";
import Contributors from "./Contributors";
import DownloadAnalysisSettings from "./DownloadAnalysisSettings";
import UploadAnalysisSettings from "./UploadAnalysisSettings";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BsIntersect, BsSearch } from "react-icons/bs";
import { AiOutlineBarChart } from "react-icons/ai";
import { FaQuestion } from "react-icons/fa";
import { GiBowman } from "react-icons/gi";

import { isEmptyObject, isUndefined } from "../helpers/helpers";

import styles from "./NavBar.module.scss";

const stepViews = {
  "select-tissues": 1,
  "select-sets": 2,
  "genes-analysis": 3,
};

const viewIx = {
  "app-information": 0,
  "select-tissues": 1,
  "select-sets": 2,
  "genes-analysis": 3,
  "too-many-selected-genes": 4,
};

const navBarBtnInfo = {
  "select-tissues": {
    text: "1. Select Tissues",
    title: "Go to the tissue selector.",
    icon: <BsSearch />,
  },
  "select-sets": {
    text: "2. Select Gene Sets",
    title: "Go to the gene set selector.",
    icon: <BsIntersect />,
  },
  "genes-analysis": {
    text: "3. Gene Analysis",
    title: "Go to the gene analysis.",
    icon: <AiOutlineBarChart />,
  },
};

const NavBar = () => {
  const [state, dispatch] = useContext(Context);
  const shouldBedisabled = useCallback(
    memoize((ix) => {
      if (
        ix === viewIx["select-sets"] &&
        (isUndefined(state.selectedGenes) || isEmptyObject(state.selectedGenes))
      ) {
        return true;
      }

      return ix > viewIx[state.view] + 1 ? true : false;
    }),
    [state.view, state.selectedGenes]
  );

  const pageViewButtons = useMemo(() => {
    return Object.keys(stepViews).map((view, ix) => {
      const buttonIsActive = ix < viewIx[state.view];

      return (
        <div className={styles.pageViewButtonWrapper} key={ix}>
          {navBarBtnInfo[view]["icon"]}
          <Button
            key={ix}
            disabled={shouldBedisabled(ix)}
            onClick={() =>
              dispatch({
                type: "SET_VIEW",
                payload: view,
              })
            }
            text={navBarBtnInfo[view] && navBarBtnInfo[view]["text"]}
            title={navBarBtnInfo[view] && navBarBtnInfo[view]["title"]}
            className={
              buttonIsActive
                ? styles.active + " " + styles.pageViewButton
                : styles.pageViewButton
            }
          />
        </div>
      );
    });
  });

  const downloadStateButton = () => {
    const disabled = state.view != "genes-analysis";
    return <DownloadAnalysisSettings disabled={disabled} />;
  };

  const onClickTitle = () => {
    dispatch({
      type: "SET_VIEW",
      payload: "app-information",
    });
  };

  return (
    <nav className={styles.navBar}>
      <a href="#" onClick={onClickTitle} className={styles.logo}>
        <GiBowman />
        <h1>Apollo</h1>
      </a>

      <div className={styles.pageViewButtons}>{pageViewButtons}</div>

      <UploadAnalysisSettings />
      {downloadStateButton()}

      <Contributors />
    </nav>
  );
};

export default NavBar;
