import {Group, Text, UnstyledButton} from "@mantine/core";
import styles from "@/components/button/ElvButton.module.css";

// TODO: Replace with mantine button when app is re-styled
const ElvButton = ({
  variant,
  leftSection,
  children,
  ...rest
}) => {
  return (
    <UnstyledButton
      className={variant === "filled" ? styles.filled : styles.outline}
      leftSection={leftSection}
      {...rest}
    >
      <Group>
        {
          leftSection ? leftSection : null
        }
        <Text fz="sm">
          { children }
        </Text>
      </Group>
    </UnstyledButton>
  );
};

export default ElvButton;
