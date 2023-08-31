import React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import PlusIcon from "Assets/icons/plus.svg";
import ImageIcon from "Components/ImageIcon";

const Accordion = ({
  id,
  icon=PlusIcon,
  orientation="vertical",
  disabled,
  children,
  title,
  ...rest
}) => {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible={true}
      orientation={orientation}
      disabled={disabled}
      {...rest}
    >
      <AccordionPrimitive.Item value={id} disabled={disabled} className="accordion__item">
        <AccordionPrimitive.Header className="accordion__header">
          <AccordionPrimitive.Trigger className="accordion__trigger">
            { title }
            <ImageIcon className="accordion__icon" icon={icon} aria-hidden />
          </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
        <AccordionPrimitive.Content className="accordion__content">
          <div className="accordion__content-text">
            { children }
          </div>
        </AccordionPrimitive.Content>
      </AccordionPrimitive.Item>
    </AccordionPrimitive.Root>
  );
};

export default Accordion;
