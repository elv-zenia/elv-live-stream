import {useState} from "react";
import {Root, Overlay, Content, Title, Description, Close} from "@radix-ui/react-dialog";
import {Loader} from "@/components/Loader.jsx";
import {Button, Text} from "@mantine/core";

const modalSizes = {
  "XS": "xs",
  "SM": "sm",
  "MD": "md",
  "LG": "lg"
};

const Modal = ({
  title,
  description,
  loadingText,
  ConfirmCallback,
  CancelCallback,
  confirmText="Confirm",
  cancelText="Cancel",
  hideCancelButton=false,
  open,
  onOpenChange,
  children,
  size="SM"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="modal">
      <Root open={open} onOpenChange={onOpenChange}>
        <Overlay className="modal__overlay">
          <Content className={`modal__content modal__content--${modalSizes[size]}`}>
            <Title className="modal__content__body__title">{ title }</Title>
            <div className="modal__content__body">
              {
                description &&
                <Description>{ description }</Description>
              }
              {
                loading &&
                loadingText ?
                  loadingText : null
              }
              { children }
            </div>
            {
              !error ? null :
                <div className="modal__error">
                  <Text size="xs">Error: { error?.message }</Text>
                  {
                    error?.cause &&
                    <Text size="xs">{ error?.cause }</Text>
                  }
                </div>
            }
            <div className="modal__actions">
              {
                !hideCancelButton &&
                <Close asChild>
                  <Button variant="outline" onClick={CancelCallback}>
                    { cancelText }
                  </Button>
                </Close>
              }
              <Button
                disabled={loading}
                onClick={async () => {
                  try {
                    setError(undefined);
                    setLoading(true);
                    await ConfirmCallback();
                    onOpenChange(false);
                  } catch(error) {
                    // eslint-disable-next-line no-console
                    console.error(error);

                    const ErrorCause = (error) => {
                      if(typeof error === "string") {
                        if(error.includes("EAV_OPEN_INPUT")) {
                          return "There is another probe running on that port.";
                        } else {
                          return "There was an unexpected error.";
                        }
                      } else if(!error.cause) {
                        return null;
                      }

                      return ErrorCause(error.cause);
                    };
                    const errorCause = ErrorCause(error);
                    const errorObj = {
                      message: error?.message || error.kind || error.toString(),
                      cause: errorCause
                    };

                    setError(errorObj);
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                { loading ? <Loader loader="inline" className="modal__loader" /> : confirmText }
              </Button>
            </div>
          </Content>
        </Overlay>
      </Root>
    </div>
  );
};

export default Modal;
