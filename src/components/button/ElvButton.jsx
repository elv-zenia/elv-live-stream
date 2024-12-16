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
      className={variant === "outline" ? styles.outline : styles.filled}
      leftSection={leftSection}
      {...rest}
    >
      <Group justify="center">
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
