import {CheckIcon, Combobox, Group, Input, InputBase, Text, useCombobox} from "@mantine/core";

// More complex Select component
// Supports option description
const AdvancedSelect = ({label, data=[], placeholder, value, SetValue, rest}) => {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption
  });

  const selectedItem = value ? data.find(option => option.value === value) : null;

  return (
    <Combobox
      store={combobox}
      onOptionSubmit={value => {
        SetValue(value);
        combobox.closeDropdown();
      }}
      {...rest}
      mb={16}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          component="button"
          type="button"
          pointer
          rightSection={<Combobox.Chevron />}
          onClick={() => combobox.toggleDropdown()}
          rightSectionPointerEvents="none"
          {...rest}
        >
          {
            selectedItem?.label ||
            <Input.Placeholder>{ placeholder }</Input.Placeholder>
          }
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown onMouseLeave={() => combobox.resetSelectedOption()}>
        <Combobox.Options>
          {
            data.map(item => (
              <Combobox.Option
                value={item.value}
                key={item.value}
                disabled={item.disabled}
                active={item.value === value}
              >
                <Group>
                  {
                    item.value === value && <CheckIcon size={12} />
                  }
                  <Text fz="sm">{ item.label }</Text>
                </Group>
                <Text fz="xs" c="dimmed">{ item.description }</Text>
              </Combobox.Option>
            ))
          }
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export default AdvancedSelect;
