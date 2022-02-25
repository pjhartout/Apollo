import { useContext, useEffect, useState } from "react";
import { BsIntersect, BsUnion } from "react-icons/bs";
import Button from "./Button";
import { Context } from "./Store";

import styles from "./TissueGroupSetOperations.module.scss";

const TissueGroupSetOperations = (tissueGroup) => {
  const [state, dispatch] = useContext(Context);
  const [isIntersection, setIsIntersection] = useState(
    !state.tissueGroups.groups[tissueGroup.group.id].isIntersection
  );

  useEffect(() => {
    setIsIntersection(!isIntersection);
  }, [state.tissueGroups.groups[tissueGroup.group.id].isIntersection]);

  const dispatchOperation = (operation) => {
    dispatch({
      type: "SET_TISSUE_GROUP_SET_OPERATION",
      payload: {
        index: tissueGroup.group.id,
        operation: operation,
      },
    });
  };

  const setButtonOnClick = () => {
    dispatchOperation(!isIntersection);
  };

  return (
    <p className={styles.setOperation}>
      Takes
      <Button
        id={"setButton"}
        onClick={setButtonOnClick}
        icon={isIntersection ? <BsIntersect /> : <BsUnion />}
      />
      of tissues
    </p>
  );
};

export default TissueGroupSetOperations;
