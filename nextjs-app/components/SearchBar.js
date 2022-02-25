import { useContext, useEffect, useState, useRef } from "react";
import { Context } from "./Store";
import { isUndefined } from "../helpers/helpers";
import Select from "react-select";
import tissueOptions from "../public/data/reduced_tpm_data_index.json";
import { isEmptyObject } from "../helpers/helpers";

import styles from "./SearchBar.module.scss";

const SearchBar = () => {
  const [state, dispatch] = useContext(Context);

  const onChange = (selectedOptions, action) => {
    switch (action.action) {
      case "select-option":
        if (state.tissues.indexOf(action.option) === -1) {
          dispatch({ type: "ADD_TISSUE", payload: action.option });
        }
        break;

      default:
        break;
    }
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
    }),
    valueContainer: (provided, state) => {
      const height = "48px";

      return { ...provided, height };
    },
  };

  return (
    <Select
      isMulti
      name="tissues"
      instanceId="120932"
      placeholder={`Select tissues... (${
        !isUndefined(state.tissues) ? state.tissues.length : "0"
      } selected)`}
      options={state.allTissueOptions}
      value=""
      hideSelectedOptions={true}
      className={`basic-multi-select ` + styles.searchBar}
      classNamePrefix="select"
      onChange={onChange}
      styles={customStyles}
    />
  );
};

export default SearchBar;
