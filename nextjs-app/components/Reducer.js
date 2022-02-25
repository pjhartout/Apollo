import { isUndefined, sortArrayOfObjectsByProperty } from "../helpers/helpers";

const findTissue = (tissues, label) => {
  return tissues.find((tissue) => tissue.label == label);
};

const Reducer = (state, action) => {
  switch (action.type) {
    case "SET_TISSUES":
      return {
        ...state,
        tissues: action.payload,
      };

    case "UNSET_TISSUES":
      return {
        ...state,
        tissues: [],
      };

    case "ADD_TISSUE":
      return {
        ...state,
        tissues: state.tissues.concat(action.payload),
        allTissueOptions: state.allTissueOptions.filter((option) => {
          return option != action.payload;
        }),
      };

    case "REMOVE_TISSUE":
      const filteredTissues = state.tissues.filter(
        (tissue) => tissue.index !== action.payload.index
      );

      // Update group tissueIds
      let newMetaGroups = { ...state.tissueGroups.groups };
      for (let group in state.tissueGroups.groups) {
        newMetaGroups[group].tissueIds = state.tissueGroups.groups[
          group
        ].tissueIds.filter((id) => id !== String(action.payload.index));
      }
      state.tissueGroups.groups = newMetaGroups;

      return {
        ...state,
        tissues: filteredTissues,
        allTissueOptions: state.allTissueOptions
          .concat({
            label: action.payload.label,
            value: action.payload.value,
            index: action.payload.index,
          })
          .sort(sortArrayOfObjectsByProperty("label")),
      };

    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };

    case "ADD_TISSUE_GENE_EXPRESSION_DATA":
      const tissueToPopulate = findTissue(state.tissues, action.payload.label);

      if (tissueToPopulate) {
        tissueToPopulate["expressionData"] = action.payload.expressionData;
      }

      return {
        ...state,
      };

    case "UPDATE_TISSUE_SELECTION_DATA":
      const tissueToUpdate = findTissue(state.tissues, action.payload.label);

      if (tissueToUpdate) {
        tissueToUpdate["tpmBounds"] = action.payload.tpmBounds;
        tissueToUpdate["sampleStrategy"] = action.payload.sampleStrategy;
        tissueToUpdate["geneList"] = action.payload.geneList;
      }

      return {
        ...state,
      };

    case "SET_SELECTED_GENES":
      return {
        ...state,
        selectedGenes: action.payload,
      };

    case "UNSET_SELECTED_GENES":
      return {
        ...state,
        selectedGenes: [],
      };

    case "SET_VIEW":
      return {
        ...state,
        view: action.payload,
      };

    case "SET_ENSEMBL_GENE_INFO":
      return {
        ...state,
        ensemblGeneInfo: action.payload,
      };

    case "UNSET_DOWNLOADED":
      return {
        ...state,
        wasStateDownloaded: false,
      };

    case "RESTORE_STATE":
      state = action.payload;
      return {
        ...state,
      };

    case "UPDATE_TISSUE_GROUPS":
      for (let p in action.payload) {
        if (!isUndefined(p)) {
          state.tissueGroups[p] = action.payload[p];
        }
      }

      return {
        ...state,
      };

    case "UPDATE_TISSUE_GROUP_TITLE":
      state.tissueGroups.groups[action.payload.groupIndex].title =
        action.payload.newTitle;
      state.tissueGroups.toggleGroupChange =
        !state.tissueGroups.toggleGroupChange;
      return {
        ...state,
      };

    case "REMOVE_TISSUE_GROUP":
      const groupsAsArray = Object.entries(state.tissueGroups.groups);
      const filteredMetaGroups = Object.fromEntries(
        groupsAsArray.filter((group) => {
          return group[0] !== action.payload;
        })
      );

      const filteredMetaGroupOrder = state.tissueGroups.groupOrder.filter(
        (order) => order !== action.payload
      );

      state.tissueGroups.groups = filteredMetaGroups;
      state.tissueGroups.groupOrder = filteredMetaGroupOrder;

      return {
        ...state,
      };

    case "SET_TISSUE_GROUP_SET_OPERATION":
      state.tissueGroups.groups[action.payload.index].isIntersection =
        action.payload.operation;
      state.tissueGroups.toggleGroupChange =
        !state.tissueGroups.toggleGroupChange;
      return {
        ...state,
      };

    default:
      return state;
  }
};

export default Reducer;
