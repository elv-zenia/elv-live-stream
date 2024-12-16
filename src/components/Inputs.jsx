import {Flex, Text, Tooltip} from "@mantine/core";
import {CircleInfoIcon} from "@/assets/icons/index.js";

export const Select = ({
  options,
  label,
  labelDescription,
  helperText,
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
                label={tooltip}
                multiline
                side="bottom"
                sideOffset={0}
                alignOffest={-12}
                align="start"
                maxWidth={"500px"}
              >
                <Flex w={16}>
                  <CircleInfoIcon color="var(--mantine-color-elv-gray-8)" />
                </Flex>
              </Tooltip> : null
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
      {
        helperText ?
          <Text fz="xs" mt={6}>{ helperText }</Text> : null
      }
    </>
  );
};
