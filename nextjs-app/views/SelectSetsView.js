import DragDrop from "../components/DragDrop";
import SetTile from "../components/SetTile";

import styles from "./SelectSetsView.module.scss";

const SelectSetsView = (
  <>
    <h1 className={styles.pageTitle}>Select Gene Sets</h1>
    <h2 className={styles.subTitle}>Group Tissues</h2>
    <p className={styles.paragraph}>
      You can group the selected tissues by dragging and dropping them in the
      cards below. By default, GTEx and TCGA tissues are put in separate groups.
      You can choose to either take the intersection or the union of the
      selected genes of the tissues in a group.
    </p>
    <DragDrop />
    <h2 className={styles.subTitle}>Euler Diagram</h2>
    <p className={styles.paragraph}>
      The Euler diagram below provides an intuitive visualization of the size
      and intersection of the selected gene sets. Select a specific region of
      the diagram to select a gene set for further analysis.
    </p>
    <SetTile />
  </>
);

export default SelectSetsView;
