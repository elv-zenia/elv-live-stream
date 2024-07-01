import React, {useState} from "react";
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
  tooltip,
  ...rest
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
        {...rest}
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

export const TextInput = ({
  label,
  labelDescription,
  required,
  value,
  formName,
  onChange,
  placeholder,
  disabled,
  ...rest
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
        type="text"
        name={formName}
        required={required}
        defaultValue=""
        value={value ? value : ""}
        onChange={onChange ? onChange : undefined}
        placeholder={placeholder}
        disabled={disabled}
        width="100%"
        {...rest}
      />
    </>
  );
};

export const NumberInput = ({
  label,
  labelDescription,
  required,
  value,
  formName,
  onChange,
  placeholder,
  disabled,
  min=0,
  max,
  pattern="[0-9]*",
  ...rest
}) => {
  const [errorMessage, setErrorMessage] = useState("");
  const ValidInput = (event) => {
    let valid = true;

    if(event.key && !/^(ArrowDown|ArrowUp|\d)$/.test(event.key)) {
      valid = false;
    }

    if(event.target?.value === "") {
      valid = false;
    }

    if(event.target?.value > max || event.target?.value < min) {
      valid = false;
    }

    if(valid) {
      setErrorMessage("");
    } else {
      setErrorMessage("Please enter a valid number.");
    }
  };

  return (
    <div className="form__field-wrapper">
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
        type="number"
        name={formName}
        required={required}
        value={value || ""}
        onKeyUp={(event) => {
          ValidInput(event);
        }}
        onChange={(event) => {
          onChange(event);
          ValidInput(event);
        }}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        pattern={pattern}
        data-invalid={errorMessage ? true : undefined}
        aria-invalid={!!errorMessage}
        {...rest}
      />
      {
        errorMessage &&
        <div className="form__input-error-text">
          { errorMessage }
        </div>
      }
    </div>
  );
};

export const Radio = ({label, formName, required, options=[]}) => {
  return (
    <div className="form__radio-container">
      <div className="form__input-label-container">
        <p className="form__input-label">
          { label }
          <span className="form__input-label--required">{ required ? " *" : ""}</span>
        </p>
      </div>
      {
        options.map(({optionLabel, id, value, checked, onChange}) => (
          <div key={`radio-option-${id}`} style={{width: "max-content", cursor: "pointer"}}>
            <input
              name={formName}
              id={id}
              type="radio"
              value={value}
              checked={checked}
              onChange={onChange}
            />
            <label htmlFor={id} style={{marginLeft: "10px"}}>
              { optionLabel }
            </label>
          </div>
        ))
      }
    </div>
  );
};
