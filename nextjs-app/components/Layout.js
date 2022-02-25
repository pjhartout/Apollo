import styles from "./Layout.module.scss";

const Layout = ({ children }) => (
  <div className={styles.container}>{children}</div>
);

export default Layout;
