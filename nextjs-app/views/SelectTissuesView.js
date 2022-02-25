import SearchBar from "../components/SearchBar";
import TissueGrid from "../components/TissueGrid";

import styles from "./SelectTissuesView.module.scss";

const SelectTissuesView = (
  <>
    <h1 className={styles.pageTitle}>Select Tissues</h1>
    <p className={styles.selectTissuesExplainer}>
      Select a tissue and its range using the range slider underneath the
      expression plot.
    </p>
    <SearchBar />
    <TissueGrid height="350" width="1200" />
  </>
);

export default SelectTissuesView;
