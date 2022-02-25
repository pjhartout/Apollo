import { useContext, useState } from "react";
import { Context } from "./Store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

import styles from "./UploadAnalysisSettings.module.scss";

const UploadAnalysisSettings = () => {
  const [fileContents, setFileContents] = useState({});
  const [_, dispatch] = useContext(Context);

  let fileReader;
  const handleFileRead = (e) => {
    const content = JSON.parse(fileReader.result);
    dispatch({
      type: "RESTORE_STATE",
      payload: content,
    });
  };

  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
    event.preventDefault();
  };

  return (
    <div className={styles.uploadAnalysisSettings}>
      <label for="settings" className={styles.customFileUpload}>
        <FontAwesomeIcon icon={faUpload} />
        <span>Upload Configuration</span>
      </label>
      <input
        type="file"
        id="settings"
        accept=".json"
        onChange={(e) => handleFileChosen(e.target.files[0])}
      />
    </div>
  );
};

export default UploadAnalysisSettings;
