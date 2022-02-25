import styles from "./Loader.module.scss";

const Loader = ({ className }) => {
  return <div className={styles[className]} />;
};

export default Loader;
