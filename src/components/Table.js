import React from "react";

const Table = ({headers=[], rows=[]}) => {
  return (
    <table className="table">
      <thead className="table__header">
        <tr>
          {
            headers.map(cell => (
              <th key={`table-header-cell-${cell.id || cell.label}`} className="table__header-cell">{ cell.label }</th>
            ))
          }
        </tr>
      </thead>
      <tbody>
        {
          rows.map(row => (
            <tr key={`table-row-${row.id || row.label}`}>
              {
                row.cells.map(cell => (
                  <td key={`table-row-cell-${cell.id || cell.label}`}>{ cell.label }</td>
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
