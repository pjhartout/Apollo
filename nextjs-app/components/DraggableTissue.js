import styled from "styled-components";
import { Draggable } from "react-beautiful-dnd";

import styles from "./DraggableTissue.module.scss";

const Container = styled.div`
  border: 1px solid lightgrey;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  transition: background-color 0.2s ease;
  background-color: ${(props) => (props.isDragging ? "lightgreen" : "white")};
`;

const DraggableTissue = ({ tissue, index }) => {
  return (
    <Draggable draggableId={tissue.id} index={index}>
      {(provided, snapshot) => (
        <Container
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          isDragging={snapshot.isDragging}
        >
          {tissue.content}
        </Container>
      )}
    </Draggable>
  );
};

export default DraggableTissue;
