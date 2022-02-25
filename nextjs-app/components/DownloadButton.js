import { useState } from "react";
import Button from "./Button";
import { downloadJSON, isUndefined, json2csv } from "../helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

import styles from "./DownloadButton.module.scss";

const DownloadButton = ({ data, filename, text }) => {
  const csv = json2csv(data);
  const onClick = () => {
    downloadJSON(csv, filename);
  };

  return (
    <Button
      onClick={onClick}
      className={styles.downloadButton}
      icon={<FontAwesomeIcon icon={faDownload} />}
      text={!isUndefined(text) ? text : "Download Table As CSV"}
    />
  );
};

export default DownloadButton;
