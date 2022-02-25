import { useState, useContext, useEffect, useMemo } from "react";
import { Context } from "./Store";

import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import TabPanel from "./TabPanel";

import EnsemblTile from "./EnsemblTile";
import DetailedGeneInfoTile from "./DetailedGeneInfoTile";
import GSEATile from "./GSEATile";

import { isEmptyObject, isUndefined } from "../helpers/helpers";

import styles from "./GeneAnalysisTabs.module.scss";

const a11yProps = (index) => {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
};

const GeneAnalysisTabs = () => {
  const [value, setValue] = useState(0);
  const [state, _] = useContext(Context);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const disabled = useMemo(() => {
    return isUndefined(state.ensemblGeneInfo)
      ? false
      : isEmptyObject(state.ensemblGeneInfo)
      ? true
      : false;
  }, [state.ensemblGeneInfo]);

  return (
    <div className={styles.geneAnalysisTabs}>
      <Tabs
        value={value}
        TabIndicatorProps={{ style: { background: "white", height: 0 } }}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        <Tab
          classes={{
            root: styles.muiTabRoot,
            wrapper: styles.muiTabWrapper,
          }}
          label="Selected Genes Info"
          {...a11yProps(0)}
        />
        <Tab
          classes={{
            root: styles.muiTabRoot,
            wrapper: styles.muiTabWrapper,
          }}
          label="Protein-Specific Info"
          disabled={disabled}
          {...a11yProps(1)}
        />
        <Tab
          classes={{
            root: styles.muiTabRoot,
            wrapper: styles.muiTabWrapper,
          }}
          label="Gene Set Enrichment Analysis"
          disabled={disabled}
          {...a11yProps(2)}
        />
      </Tabs>
      <TabPanel className={styles.muiTabPanelRoot} value={value} index={0}>
        <EnsemblTile />
      </TabPanel>
      <TabPanel className={styles.muiTabPanelRoot} value={value} index={1}>
        <DetailedGeneInfoTile />
      </TabPanel>
      <TabPanel className={styles.muiTabPanelRoot} value={value} index={2}>
        <GSEATile />
      </TabPanel>
    </div>
  );
};

export default GeneAnalysisTabs;
