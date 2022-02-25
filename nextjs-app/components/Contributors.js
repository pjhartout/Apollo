import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { FaGithub } from "react-icons/fa";
import contributors from "../public/contributors.json";

import styles from "./Contributors.module.scss";

const Contributors = () => {
  return (
    <div className={styles.contributors}>
      <h2>Contributors:</h2>
      <ul>
        {Object.keys(contributors).map((contributor, ix) => {
          return (
            <li key={ix}>
              <a
                href={
                  `https://www.github.com/` +
                  contributors[contributor]["GitHub"]
                }
                target="_blank"
                styles={styles.a}
              >
                <FaGithub />
                {contributor}
              </a>{" "}
            </li>
          );
        })}
      </ul>
      <h2>Contact us:</h2>
      <a href="mailto:philip.hartout@protonmail.com" className={styles.mail}>
        <FontAwesomeIcon icon={faEnvelope} /> philip.hartout@protonmail.com
      </a>
    </div>
  );
};

export default Contributors;
