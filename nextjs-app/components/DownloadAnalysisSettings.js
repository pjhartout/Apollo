import { useContext } from "react";
import { Context } from "./Store";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import { state2json } from "../helpers/helpers";

import styles from "./DownloadAnalysisSettings.module.scss";

const DownloadAnalysisSettings = ({ disabled }) => {
  const [state, _] = useContext(Context);

  const onClick = () => {
    state2json(state);
  };

  return (
    <Button
      onClick={onClick}
      text={"Download Configuration"}
      icon={<FontAwesomeIcon icon={faDownload} />}
      disabled={disabled}
      className={styles.downloadButton}
    />
  );
};

export default DownloadAnalysisSettings;
