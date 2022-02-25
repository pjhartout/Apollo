import Table from "./Table";
import { isUndefined, isEmptyObject } from "../helpers/helpers";

import styles from "./DownloadableTable.module.scss";

const DownloadableTable = ({
  columnData,
  columnDataEntry,
  tableData,
  tableName = "",
  tableExplainer = "",
  maxNumberOfRows = 20,
}) => {
  return !isUndefined(tableData) && !isEmptyObject(tableData) ? (
    <>
      <h2 className={styles.tableName}>{tableName}</h2>
      <p className={styles.tableExplainer}>{tableExplainer}</p>
      <Table
        columns={columnData[columnDataEntry]}
        data={tableData}
        maxNumberOfRows={maxNumberOfRows}
        name={tableName}
        downloadable={true}
      />
    </>
  ) : (
    <div>Data for {tableName} not existent </div>
  );
};

export default DownloadableTable;
