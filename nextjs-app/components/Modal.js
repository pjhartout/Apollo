import { useState } from "react";
import styles from "./Modal.module.scss";
import Button from "./Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ title, body, icon, buttonText = "", children }) => {
  const [show, setShow] = useState(false);

  const toggleModal = (e) => {
    if (!show) {
      const body = document.body;
      body.classList.add("modalOpen");
    }
    setShow(!show);
  };

  const renderModalClosed = () => {
    return (
      <div className={styles.modalWrapper}>
        <Button
          onClick={(e) => {
            toggleModal();
          }}
          text={buttonText}
          icon={icon}
        />
        {children}
      </div>
    );
  };

  const renderModalOpen = useMemo(() => {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <Button
            onClick={(e) => {
              toggleModal();
            }}
            text="Close"
          />
        </div>
        {body}
      </div>
    );
  });

  return !show ? renderModalClosed : renderModalOpen;
};

export default Modal;
