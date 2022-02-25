import { useEffect, useState, useRef } from "react";

import { useOnClickOutside } from "../hooks";

import styles from "./DropDown.module.scss";

const Dropdown = ({ defaultShowMenu, headerObject, headerTitle, items }) => {
  const [showMenu, setShowMenu] = useState(defaultShowMenu);
  const dropDownRef = useRef();

  useOnClickOutside(dropDownRef, () => setShowMenu(defaultShowMenu));

  // TODO: investigate if required
  /*useEffect(() => {
    if (showMenu) {
      window.removeEventListener('click', hideDropdownMenu);
    } else {
      window.addEventListener('click', hideDropdownMenu);
    }

    return window.removeEventListener('click', hideDropdownMenu);
  });*/

  const hideDropdownMenu = () => {
    setShowMenu(false);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className={styles.ddWrapper} ref={dropDownRef}>
      <div className={styles.ddHeader} onClick={() => toggleMenu()}>
        {headerObject}
        {headerTitle}
      </div>
      {showMenu && (
        <ul
          className={styles.ddList}
          onClick={(e) => {
            hideDropdownMenu();
          }}
        >
          {items.map((item) => (
            <li className={styles.ddListItem} key={item.id + Math.random()}>
              {item.option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
