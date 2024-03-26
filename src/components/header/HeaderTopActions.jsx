import {Flex} from "@mantine/core";
import React from "react";

// TODO: Update all buttons to Mantine button
const HeaderTopActions = ({actions=[]}) => {
  return (
    <Flex direction="row" gap="sm">
      {
        actions.map(({label, variant = "filled", onClick}) => (
          <button
            type="button"
            className={variant === "filled" ? "button__primary" : "button__secondary"}
            onClick={onClick}
            key={`top-action-${label}`}
          >
            {label}
          </button>
          // <Button
          //   variant={variant}
          //   key={`top-action-${label}`}
          //   onClick={onClick}
          // >
          //   <Text tt={uppercase ? "uppercase" : "unset"} size="xs" fw="600">{label}</Text>
          // </Button>
        ))
      }
    </Flex>
  );
};

export default HeaderTopActions;
