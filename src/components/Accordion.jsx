import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {PlusIcon} from "@/assets/icons";

const Accordion = ({
  id,
  orientation="vertical",
  disabled,
  children,
  title,
  value,
  ...rest
}) => {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible={true}
      orientation={orientation}
      disabled={disabled}
      value={value}
      {...rest}
    >
      <AccordionPrimitive.Item value={id} disabled={disabled} className="accordion__item">
        <AccordionPrimitive.Header className="accordion__header">
          <AccordionPrimitive.Trigger className="accordion__trigger">
            { title }
            <PlusIcon height={15} aria-hidden className="accordion__icon" color="var(--mantine-color-gray-7)" style={{opacity: disabled ? "30%" : "100%"}} />
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
