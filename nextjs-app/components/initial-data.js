const initialData = {
  tissues: {
    "tissue-1": { id: "tissue-1", content: "Glioma" },
    "tissue-2": { id: "tissue-2", content: "Cortex" },
    "tissue-3": { id: "tissue-3", content: "Heart" },
    "tissue-4": { id: "tissue-4", content: "Liver" },
  },
  metaGroups: {
    "metaGroup-1": {
      id: "metaGroup-1",
      title: "TCGA",
      tissueIds: ["tissue-1", "tissue-2", "tissue-3", "tissue-4"],
    },
    "metaGroup-2": {
      id: "metaGroup-2",
      title: "GTEx",
      tissueIds: [],
    },
    "metaGroup-3": {
      id: "metaGroup-3",
      title: "Custom Group",
      tissueIds: [],
    },
  },
  // Facilitate reordering of the metaGroups
  metaGroupOrder: ["metaGroup-1", "metaGroup-2", "metaGroup-3"],
};

export default initialData;
