import { useState } from "react";
import styles from "./Button.module.scss";

const isRegularType = (type) => ["reset", "submit", "button"].includes(type);

const Button = ({
  id,
  onClick,
  text = "",
  type = "button",
  className = "",
  disabled = "false",
  icon = null,
  title = "",
}) => {
  const getClassNames = () => {
    return styles[className] ? styles[className] : className;
  };

  return (
    <button
      className={getClassNames()}
      disabled={disabled}
      id={id}
      title={title}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
      type={isRegularType(type) ? type : "button"}
    >
      {icon}
      {text}
    </button>
  );
};

Button.defaultProps = {
  className: "btn",
  disabled: false,
  text: "",
  type: "button",
};

export default Button;
