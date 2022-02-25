import { useContext } from "react";
import { Context } from "../components/Store";

import caps from "../public/caps.json";

const ENSEMBL_POST_CAP = caps.ENSEMBL_POST_CAP;

import Button from "../components/Button";

import styles from "./TooManySelectedGenesView.module.scss";

const TooManySelectedGenesView = () => {
  const [_, dispatch] = useContext(Context);

  const onClick = () =>
    dispatch({
      type: "SET_VIEW",
      payload: "select-sets",
    });

  return (
    <>
      <h1 className={styles.pageTitle}>Too Many Selected Genes</h1>
      <p className={styles.pageText}>
        Maximum amount of {ENSEMBL_POST_CAP} selected genes surpassed.
      </p>
      <Button
        className={styles.goBackButton}
        onClick={onClick}
        text={"Go Back To Set Selector"}
      />
    </>
  );
};

export default TooManySelectedGenesView;
