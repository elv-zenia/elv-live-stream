import React from "react";

const Table = ({headers=[], rows=[]}) => {
  return (
    <table className="table">
      <thead className="table__header">
        <tr className="table__header-row">
          {
            headers.map(cell => (
              <th key={`table-header-cell-${cell.id || cell.label}`} className="table__cell">
                { cell.label }
              </th>
            ))
          }
        </tr>
      </thead>
      <tbody className="table__body">
        {
          rows.map(row => (
            <tr key={`table-row-${row.id || row.label}`} className="table__body-row">
              {
                row.cells.map(cell => (
                  <td key={`table-row-cell-${cell.id || cell.label}`} className="table__cell">
                    { cell.label }
                  </td>
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
};

export default Table;
