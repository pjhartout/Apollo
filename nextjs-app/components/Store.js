import { createContext, useReducer } from "react";
import Reducer from "./Reducer";
import { sortArrayOfObjectsByProperty } from "../helpers/helpers";
import tissueOptions from "../public/data/reduced_tpm_data_index.json";

const allTissueOptions = tissueOptions[0].options.concat(
  tissueOptions[1].options
);

const allTissueOptionsSorted = allTissueOptions.sort(
  sortArrayOfObjectsByProperty("label")
);

const IX_TCGA_PRIMARY_GLIOMA = 143;
const IX_GTEX_BRAIN_CORTEX = 14;

const DEFAULT_TCGA_TISSUE = allTissueOptionsSorted[IX_TCGA_PRIMARY_GLIOMA];
const DEFAULT_GTEX_TISSUE = allTissueOptionsSorted[IX_GTEX_BRAIN_CORTEX];

// Remove default tissues from array
allTissueOptionsSorted.splice(IX_TCGA_PRIMARY_GLIOMA, 1);
allTissueOptionsSorted.splice(IX_GTEX_BRAIN_CORTEX, 1);

const initialState = {
  view: "app-information",
  tissues: [DEFAULT_TCGA_TISSUE, DEFAULT_GTEX_TISSUE],
  selectedGenes: [],
  selection: [],
  sets: [],
  combinations: [],
  error: null,
  wasStateDownloaded: false,
  allTissueOptions: allTissueOptionsSorted,
  ensemblGeneInfo: [],
  tissueGroups: {
    groups: {
      "group-0": {
        id: "group-0",
        title: "TCGA",
        tissueIds: [],
        isIntersection: true,
      },
      "group-1": {
        id: "group-1",
        title: "GTEx",
        tissueIds: [],
        isIntersection: true,
      },
    },
    groupOrder: ["group-0", "group-1"],
    toggleGroupChange: false,
  },
};

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);

  return (
    <Context.Provider value={[state, dispatch]}>{children}</Context.Provider>
  );
};

export const Context = createContext(initialState);
export default Store;
