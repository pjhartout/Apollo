import { useMemo } from "react";

import { useTable, useSortBy, useFilters, usePagination } from "react-table";
import styles from "./Table.module.scss";

import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import DownloadButton from "./DownloadButton";

// Define a default UI for filtering
function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  const count = preFilteredRows.length;

  return (
    <input
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
      placeholder={`Search ${count} records...`}
    />
  );
}

const Table = ({
  columns,
  data,
  maxNumberOfRows,
  name = "default_table",
  defaultIdSort = "id",
  downloadable = "false",
}) => {
  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    prepareRow,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      defaultColumn,
      data,
      initialState: {
        pageIndex: 0,
        sortBy: [
          {
            id: defaultIdSort,
            desc: false,
          },
        ],
      },
    },
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <>
      <div className={styles.table}>
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <>
                    <th
                      className={styles.th}
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      {column.render("Header")}
                      {/* Add a sort direction indicator */}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <AiOutlineArrowDown />
                          ) : (
                            <AiOutlineArrowUp />
                          )
                        ) : (
                          "  "
                        )}
                      </span>
                      <div>
                        {column.canFilter ? column.render("Filter") : null}
                      </div>
                    </th>
                  </>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <br />
      <div className={styles.pagination}>
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {"<<"}
        </button>{" "}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {"<"}
        </button>{" "}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {">"}
        </button>{" "}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {">>"}
        </button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        {/*<span>
            | Go to page:{" "}
            <input
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              style={{ width: "100px" }}
            />
          </span>{" "}*/}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        {downloadable ? (
          <DownloadButton
            data={data}
            filename={name.concat(".csv").replace(/\s+/g, "-").toLowerCase()}
          />
        ) : null}
      </div>
    </>
  );
};

export default Table;
