import { useState, useContext, useEffect, useMemo } from "react";
import { isUndefined } from "../helpers/helpers";

import Button from "./Button";
import { Context } from "./Store";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import "@atlaskit/css-reset";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "styled-components";

import TissueGroup from "./TissueGroup";

import styles from "./DragDrop.module.scss";

const DragDrop = () => {
  const [state, dispatch] = useContext(Context);

  const populateDndData = useEffect(() => {
    const newGroups = { ...state.tissueGroups.groups };

    for (const tissue of state.tissues) {
      let tissueInGroup = false;
      Object.entries(newGroups).map((group) => {
        if (group[1].tissueIds.includes(tissue.index)) {
          tissueInGroup = true;
        }
      });

      if (!tissueInGroup) {
        const groupTCGA = newGroups["group-0"];
        const groupGTEx = newGroups["group-1"];
        if (
          !isUndefined(groupTCGA) &&
          tissue.label.includes("TCGA") &&
          !groupTCGA.tissueIds.includes(tissue.index)
        ) {
          groupTCGA.tissueIds.push(tissue.index);
        } else if (
          !isUndefined(groupGTEx) &&
          tissue.label.includes("GTEx") &&
          !groupGTEx.tissueIds.includes(tissue.index)
        ) {
          groupGTEx.tissueIds.push(tissue.index);
        } else {
          newGroups[Object.keys(newGroups)[0]].tissueIds.push(tissue.index);
        }
      }
    }

    dispatch({
      type: "UPDATE_TISSUE_GROUPS",
      payload: {
        groups: { ...newGroups },
      },
    });
  }, [state.tissues]);

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = state.tissueGroups.groups[source.droppableId];
    const finish = state.tissueGroups.groups[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start.tissueIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newGroup = {
        ...start,
        tissueIds: newTaskIds,
      };

      dispatch({
        type: "UPDATE_TISSUE_GROUPS",
        payload: {
          groups: {
            ...state.tissueGroups.groups,
            [newGroup.id]: newGroup,
          },
        },
      });

      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start.tissueIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      tissueIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.tissueIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      tissueIds: finishTaskIds,
    };

    dispatch({
      type: "UPDATE_TISSUE_GROUPS",
      payload: {
        groups: {
          ...state.tissueGroups.groups,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      },
    });
  };

  const addGroup = () => {
    const groupKeys = Object.keys(state.tissueGroups.groups);
    const groupIndices = groupKeys.map((key) => key[key.length - 1]);
    const maxIndex = Math.max.apply(Math, groupIndices);
    const newGroupId = "group-" + (maxIndex + 1);

    dispatch({
      type: "UPDATE_TISSUE_GROUPS",
      payload: {
        groups: {
          ...state.tissueGroups.groups,
          [newGroupId]: {
            id: newGroupId,
            title: "New group" + maxIndex,
            tissueIds: [],
            isIntersection: true,
          },
        },
        groupOrder: [...state.tissueGroups.groupOrder, newGroupId],
      },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {!isUndefined(state.tissueGroups) ? (
        <>
          <Button
            key={0}
            disabled={false}
            onClick={() => addGroup()}
            className={styles.addGroupButton}
            icon={<FontAwesomeIcon icon={faPlus} />}
            text={"Add Group"}
          />
          <div className={styles.dragDropContainer}>
            {state.tissueGroups.groupOrder.map((groupId) => {
              const group = state.tissueGroups.groups[groupId];

              const tissues = group.tissueIds.map((tissueId) => {
                const tissue = state.tissues.filter((tissue) => {
                  return tissue.index == tissueId;
                })[0];

                const reducedTissue = {
                  id: tissue.index,
                  content: tissue.label,
                };

                return reducedTissue;
              });

              return (
                <TissueGroup key={group.id} group={group} tissues={tissues} />
              );
            })}
          </div>
        </>
      ) : null}
    </DragDropContext>
  );
};

export default DragDrop;
