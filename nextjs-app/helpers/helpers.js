export const isUndefined = (variable) => {
  return typeof variable === "undefined";
};

export const isNull = (obj) => {
  return obj === null;
};

export const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

export const countInArray = (array, e) => {
  return array.filter((i) => i === e).length;
};

export const json2csv = (jsonData) => {
  const replacer = (key, value) => (value === null ? "" : value);

  const header = Object.keys(jsonData[0]);

  const csv = [
    header.join(","),
    ...jsonData.map((row) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(",")
    ),
  ].join("\r\n");

  return csv;
};

export const downloadJSON = (csv, filename) => {
  const element = document.createElement("a");
  const file = new Blob([csv], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
};

export const unionOfSets = (...iterables) => {
  const set = new Set();

  for (const iterable of iterables) {
    for (const item of iterable) {
      set.add(item);
    }
  }

  return set;
};

export const removeGeneVersion = (gene) => {
  return gene.split(".")[0];
};

export const getProteinCodingGeneProperty = (geneList, property) => {
  return geneList
    .map((gene) => {
      if (gene.biotype == "protein_coding") {
        return gene[property];
      }
    })
    .filter(Boolean);
};

export const getProteinCodingGeneProperties = (geneList, properties) => {
  return geneList
    .map((gene) => {
      if (gene.biotype == "protein_coding") {
        return properties.map((property) => {
          return gene[property];
        });
      }
    })
    .filter(Boolean);
};

export const sortArrayOfObjectsByProperty = (property) => {
  return (a, b) => a[property].localeCompare(b[property]);
};

export const getTissuePercentile = (p, list) => {
  if (p <= 0) {
    return Math.min.apply(null, list);
  }

  if (p >= 100) {
    return Math.max.apply(null, list);
  }

  list = list.slice().sort((a, b) => {
    a = Number.isNaN(a) ? Number.NEGATIVE_INFINITY : a;
    b = Number.isNaN(b) ? Number.NEGATIVE_INFINITY : b;

    if (a > b) return 1;
    if (a < b) return -1;

    return 0;
  });

  if (p === 0) return list[0];

  const kIndex = Math.ceil(list.length * (p / 100)) - 1;

  return list[kIndex];
};

export const createGene2Sets = (geneLists, tissueNames) => {
  /* given two equally-sized arrays, this function returns an array of the
  following format
     const elems = [
     { name: "A", sets: ["S1", "S2"] },
     { name: "B", sets: ["S1"] },
     { name: "C", sets: ["S2"] },
     { name: "D", sets: ["S1", "S3"] },
     ];
  */
  const geneListSets = geneLists.map((geneList) => {
    return new Set(geneList);
  });
  const uniqueGenes = new Set(unionOfSets(...geneListSets));

  const gene2Set = [];
  uniqueGenes.forEach((gene, _, __) => {
    const tissuesHavingGene = geneListSets
      .map((geneListSet, tissueIndex) => {
        if (geneListSet.has(gene)) {
          return tissueNames[tissueIndex];
        }
      })
      .filter(Boolean);

    gene2Set.push({
      name: gene,
      sets: tissuesHavingGene,
    });
  });
  return gene2Set;
};

export const intersectionOfArrays = (arrays) => {
  if (!isUndefined(...arrays)) {
    let intersection = new Set(arrays[0]);
    for (let i = 0; i < arrays.length; i++) {
      if (i > 0) {
        let set = new Set(arrays[i]);
        intersection = new Set([...set].filter((x) => intersection.has(x)));
      }
    }

    return intersection;
  } else {
    return [];
  }
};

export const getTissueGroupGeneList = (tissueGroups, tissues) => {
  const groupIds = Object.keys(tissueGroups.groups);

  const arrayOfArrayOfTissueIds = groupIds.map((group) => {
    return tissueGroups.groups[group].tissueIds;
  });

  const geneListsInGroups = arrayOfArrayOfTissueIds.map((tissueIds) => {
    const tissuesInGroup = tissues.filter((tissue) => {
      return tissueIds.includes(tissue.index);
    });
    const geneListsInGroup = tissuesInGroup.map((tissue) => {
      return tissue.geneList;
    });
    return geneListsInGroup;
  });

  const filteredGeneListsInGroups = geneListsInGroups.map(
    (tissueGroupGenes, index) => {
      const keys = Object.keys(tissueGroups.groups);
      if (tissueGroups.groups[keys[index]].isIntersection == true) {
        return intersectionOfArrays(tissueGroupGenes);
      } else {
        return unionOfSets(...tissueGroupGenes);
      }
    }
  );
  return filteredGeneListsInGroups;
};

export const getTissueGroupNames = (tissueGroups) => {
  return Object.values(tissueGroups.groups).map((tissueGroup) => {
    return tissueGroup.title;
  });
};

export const hasExpressionData = (expressionData) => {
  return !expressionData.some(
    (item) => isUndefined(item) || isUndefined(item.gene_expression)
  );
};

export const allTissuesHaveGeneLists = (tissues) => {
  for (const tissue of tissues) {
    if (isUndefined(tissue.geneList)) return false;
  }
  return true;
};

export const state2json = (state) => {
  let settings = {};

  settings["_comment"] =
    "This file contains information intended for use by the Apollo web application, as such the information presented here is not meant for scientific analysis. You can download specific parts of your analysis in the dedicated tables' Download table as CSV button.";

  settings["tissues"] = state.tissues.map((tissue) => {
    return {
      index: tissue.index,
      label: tissue.label,
      value: tissue.value,
      tpmBounds: tissue.tpmBounds,
      sampleStrategy: tissue.sampleStrategy,
      geneList: tissue.geneList,
    };
  });

  settings["selectedGenes"] = state.selectedGenes;
  settings["view"] = state.view;
  settings["set_combinations"] = state.set_combinations;
  settings["wasStateDownloaded"] = true;
  settings["allTissueOptions"] = state.allTissueOptions;
  settings["tissueGroups"] = state.tissueGroups;

  const element = document.createElement("a");
  const file = new Blob([JSON.stringify(settings)], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = "analysis-settings.json";
  document.body.appendChild(element);
  element.click();
};

export const overlapGTExTCGA = (tissues) => {
  let res = false;

  const MARGIN = 2;

  let min_tcga = 1000;
  let max_tcga = -1000;
  let min_gtex = 1000;
  let max_gtex = -1000;

  const bounds = { lower: 0, upper: 1 };

  tissues.map((tissue) => {
    if (!isUndefined(tissue.tpmBounds)) {
      if (tissue.label.includes("TCGA")) {
        tissue.tpmBounds[bounds["lower"]] < min_tcga
          ? (min_tcga = tissue.tpmBounds[bounds["lower"]])
          : null;

        tissue.tpmBounds[bounds["upper"]] > max_tcga
          ? (max_tcga = tissue.tpmBounds[bounds["upper"]])
          : null;
      }
      if (tissue.label.includes("GTEx")) {
        tissue.tpmBounds[bounds["lower"]] < min_gtex
          ? (min_gtex = tissue.tpmBounds[bounds["lower"]])
          : null;
        tissue.tpmBounds[bounds["upper"]] > max_gtex
          ? (max_gtex = tissue.tpmBounds[bounds["upper"]])
          : null;
      }
    }
  });

  if (min_tcga <= max_gtex - MARGIN && min_gtex <= max_tcga - MARGIN) {
    res = true;
  }
  return res;
};
