import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

const AspectRatio = ({ratio=16/9, children}) => {
  return (
    <AspectRatioPrimitive.Root ratio={ratio}>
      {children}
    </AspectRatioPrimitive.Root>
  );
};

export default AspectRatio;
