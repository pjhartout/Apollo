import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchExternalData } from "../helpers/apiHelpers";
import { isUndefined, isNull } from "../helpers/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCogs, faTimes, faCheck } from "@fortawesome/free-solid-svg-icons";

import Button from "./Button";

import styles from "./StatusBar.module.scss";

const StatusBar = () => {
  const [ensemblAPIUnreachable, setEnsemblAPIUnreachable] = useState(null);
  const [stringDBAPIUnreachable, setStringDBAPIUnreachable] = useState(null);
  const [myGeneInfoAPIUnreachable, setMyGeneInfoAPIUnreachable] =
    useState(null);
  const [counter, setCounter] = useState(5);

  const onClick = () => {
    testAPIStatus();
  };

  const testAPIStatus = () => {
    const headers = new Headers({ "Content-Type": "application/json" });
    const requestOptions = {
      method: "GET",
      headers: headers,
      redirect: "follow",
    };
    const ensemblAPIUrl =
      "https://rest.ensembl.org/lookup/id/ENSG00000157764?content-type=application/json";
    fetchExternalData(requestOptions, ensemblAPIUrl).then((data) => {
      isUndefined(data)
        ? setEnsemblAPIUnreachable(true)
        : setEnsemblAPIUnreachable(false);
    });

    const stringDBUrl =
      "https://string-db.org/api/json/resolve?identifier=ADD&species=9606";
    fetchExternalData(requestOptions, ensemblAPIUrl).then((data) => {
      isUndefined(data)
        ? setStringDBAPIUnreachable(true)
        : setStringDBAPIUnreachable(false);
    });

    const myGeneInfoAPIUrl = "http://mygene.info/v3/query";
    const myGeneInfoAPIRequestOptions = {
      method: "GET",
      headers: new Headers({}),
      redirect: "follow",
    };

    fetchExternalData(myGeneInfoAPIRequestOptions, myGeneInfoAPIUrl).then(
      (data) => {
        isUndefined(data)
          ? setMyGeneInfoAPIUnreachable(true)
          : setMyGeneInfoAPIUnreachable(false);
      }
    );
  };

  const renderEnsemblAPIStatus = () => {
    return (
      <div className={styles.statusbar}>
        {isNull(ensemblAPIUnreachable) ? (
          <div>API status</div>
        ) : ensemblAPIUnreachable ? (
          <span>
            Ensembl API does not work <FontAwesomeIcon icon={faTimes} />
          </span>
        ) : (
          <span>
            Ensembl API works <FontAwesomeIcon icon={faCheck} />
          </span>
        )}
      </div>
    );
  };

  const renderStringDBAPIStatus = () => {
    return (
      <div className={styles.statusbar}>
        {isNull(stringDBAPIUnreachable) ? (
          <div>API status</div>
        ) : stringDBAPIUnreachable ? (
          <span>
            StringDB API does not work <FontAwesomeIcon icon={faTimes} />
          </span>
        ) : (
          <span>
            StringDB API works <FontAwesomeIcon icon={faCheck} />
          </span>
        )}
      </div>
    );
  };

  const renderMyGeneInfoAPIStatus = () => {
    return (
      <div className={styles.statusbar}>
        {isNull(myGeneInfoAPIUnreachable) ? (
          <div>API status</div>
        ) : myGeneInfoAPIUnreachable ? (
          <span>
            mygene.info API does not work <FontAwesomeIcon icon={faTimes} />
          </span>
        ) : (
          <span>
            mygene.info API works <FontAwesomeIcon icon={faCheck} />
          </span>
        )}
      </div>
    );
  };

  return (
    <div>
      <span>Test if the APIs work</span>{" "}
      <Button
        id="recomputeSetPlot"
        onClick={onClick}
        icon={<FontAwesomeIcon icon={faCogs} />}
      />
      {renderEnsemblAPIStatus}
      {renderStringDBAPIStatus}
      {renderMyGeneInfoAPIStatus}
    </div>
  );
};

export default StatusBar;
