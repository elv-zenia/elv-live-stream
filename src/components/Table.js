import React from "react";
import {NavLink} from "react-router-dom";
import ImageIcon from "Components/ImageIcon";

const TableCell = ({
  label,
  type,
  items=[]
}) => {
  let contents;
  items = items.filter(item => !item.hidden);

  if(type === "buttonGroup") {
    contents = (
      <div className="table__button-group">
        {
          items.map((item) => {
            if(item.onClick) {
              return (
                <button
                  key={item.id}
                  className="button__secondary"
                  onClick={item.onClick}
                  title={item.label}
                >
                  { item.label }
                </button>
              );
            } else if(item.to) {
              return (
                <NavLink
                  className="nav-button-link"
                  key={item.id}
                  to={item.to}
                  title={item.label}
                >
                  <span>
                    { item.label }
                  </span>
                </NavLink>
              );
            }
          })
        }
      </div>
    );
  } else if(type === "iconButtonGroup") {
    contents = (
      <div className="table__icon-button-group">
        {
          items.map((item) => (
            <button
              key={item.id}
              className="button__icon"
              onClick={item.onClick}
              title={item.label}
            >
              <ImageIcon icon={item.icon} label={item.label} />
            </button>
          ))
        }
      </div>
    );
  } else {
    contents = label;
  }

  return (
    <td className="table__cell">
      { contents }
    </td>
  );
};

const Table = (({headers=[], rows=[]}) => {
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
                  <TableCell
                    key={`table-row-cell-${cell.id || cell.label}`}
                    label={cell.label}
                    onClick={cell.onClick}
                    type={cell.type}
                    icon={cell.icon}
                    items={cell.items}
                  />
                ))
              }
            </tr>
          ))
        }
      </tbody>
    </table>
  );
});

export default Table;
