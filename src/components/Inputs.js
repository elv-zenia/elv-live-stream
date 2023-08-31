import React from "react";
import InfoIcon from "Assets/icons/circle-info";
import Tooltip from "Components/Tooltip";

export const Select = ({
  options,
  label,
  labelDescription,
  required,
  defaultOption={},
  formName,
  onChange,
  disabled,
  value,
  tooltip
}) => {
  return (
    <>
      <div className="form__input-label-container">
        <label className="form__input-label" htmlFor={formName}>
          <span>{ label }</span>
          {
            required &&
            <span className="form__input-label--required">*</span>
          }
          {
            tooltip ?
              <Tooltip
                className="form__input-label-tooltip"
                message={tooltip}
                icon={InfoIcon}
                side="bottom"
                sideOffset={0}
                alignOffest={-12}
                align="start"
                maxWidth={"500px"}
              /> : null
          }
        </label>
        {
          labelDescription &&
          <div className="form__input-description">{labelDescription}</div>
        }
      </div>
      <select
        required={required}
        name={formName}
        onChange={onChange}
        disabled={disabled}
        value={value}
      >
        {
          "label" in defaultOption && "value" in defaultOption ?
            <option value={defaultOption.value} title={defaultOption.title}>{defaultOption.label}</option> : null
        }
        {
          options.map(option => (
            <option
              value={option.value}
              key={option.value}
              disabled={option.disabled}
              title={option.title}
            >
              { option.label }
            </option>
          ))
        }
      </select>
    </>
  );
};

export const Input = ({
  label,
  labelDescription,
  required,
  value,
  formName,
  onChange,
  placeholder,
  type="text",
  disabled,
  hidden
}) => {
  return (
    <>
      <div className="form__input-label-container">
        <label className={`form__input-label${disabled ? " form__input-label--disabled" : ""}`} htmlFor={formName}>
          { label }
          <span className="form__input-label--required">{ required ? " *" : ""}</span>
        </label>
        {
          labelDescription &&
          <div className="form__input-description">{labelDescription}</div>
        }
      </div>
      <input
        type={type}
        name={formName}
        required={required}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        hidden={hidden}
      />
    </>
  );
};

export const Radio = ({label, formName, required, options=[]}) => {
  return (
    <div className="form__radio-container">
      <p className="form__input-label">
        { label }
        <span className="form__input-label--required">{ required ? " *" : ""}</span>
      </p>
      {
        options.map(({optionLabel, id, value, checked, onChange}) => (
          <div key={`radio-option-${id}`}>
            <input
              name={formName}
              id={id}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            <label htmlFor={id}>
              { optionLabel }
            </label>
          </div>
        ))
      }
    </div>
  );
};
