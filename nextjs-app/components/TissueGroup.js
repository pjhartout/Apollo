import { useContext } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import Button from "./Button";
import { Context } from "./Store";

import styled from "styled-components";
import DraggableTissue from "./DraggableTissue";
import TissueGroupSetOperations from "./TissueGroupSetOperations";
import { Droppable } from "react-beautiful-dnd";

import { countInArray, getTissueGroupNames } from "../helpers/helpers";

import styles from "./TissueGroup.module.scss";

const TissueList = styled.div`
  padding: 8px;
  transition: background-color 0.2s ease;
  background-color: ${(props) => (props.isDraggingOver ? "skyblue" : "white")}
  flex-grow: 1;
  min-height: 100px;
  flex: 1 1 100%;
`;

const TissueGroup = ({ tissues, group }) => {
  const [state, dispatch] = useContext(Context);

  const onBlur = (e) => {
    // Make sure that group names are unique
    const tissueGroupNames = getTissueGroupNames(state.tissueGroups);
    if (countInArray(tissueGroupNames, e.target.value) == 2) {
      alert("Every group name needs to be unique.");
      onChange("deleteOneElement");
    }
  };

  const onChange = (e) => {
    if (e === "deleteOneElement") {
      dispatch({
        type: "UPDATE_TISSUE_GROUP_TITLE",
        payload: {
          groupIndex: group.id,
          newTitle: state.tissueGroups.groups[group.id].title.slice(0, -1),
        },
      });
    } else {
      dispatch({
        type: "UPDATE_TISSUE_GROUP_TITLE",
        payload: {
          groupIndex: group.id,
          newTitle: e.target.value,
        },
      });
    }
  };

  const onClick = () => {
    dispatch({
      type: "REMOVE_TISSUE_GROUP",
      payload: group.id,
    });
  };

  return (
    <div className={styles.groupContainer}>
      <div className={styles.groupHeader}>
        <input
          onChange={onChange}
          onBlur={onBlur}
          type="text"
          placeholder={group.title}
          className={styles.groupTitle}
          value={state.tissueGroups.groups[group.id].title}
        />
        <Button
          id={"test"}
          onClick={onClick}
          icon={<FontAwesomeIcon icon={faTimes} />}
          disabled={tissues.length != 0}
        />
      </div>
      <Droppable droppableId={group.id} type="TASK">
        {(provided, snapshot) => (
          <TissueList
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {tissues.map((tissue, index) => (
              <DraggableTissue key={tissue.id} tissue={tissue} index={index} />
            ))}
            {provided.placeholder}
          </TissueList>
        )}
      </Droppable>
      <TissueGroupSetOperations group={group} />
    </div>
  );
};

export default TissueGroup;
