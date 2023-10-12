import React, {useState} from "react";
import {Root, Overlay, Content, Title, Description, Close} from "@radix-ui/react-dialog";
import {Loader} from "Components/Loader";

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
  const [error, setError] = useState(undefined);

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
                  Error: { error }
                </div>
            }
            <div className="modal__actions">
              {
                !hideCancelButton &&
                <Close asChild>
                  <button type="button" className="button__secondary" onClick={CancelCallback}>
                    { cancelText }
                  </button>
                </Close>
              }
              <button
                type="button"
                disabled={loading}
                className="button__primary"
                onClick={async () => {
                  try {
                    setError(undefined);
                    setLoading(true);
                    await ConfirmCallback();
                    onOpenChange(false);
                  } catch(error) {
                    console.error(error);
                    setError(error?.message || error.kind || error.toString());
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                { loading ? <Loader loader="inline" className="modal__loader" /> : confirmText }
              </button>
            </div>
          </Content>
        </Overlay>
      </Root>
    </div>
  );
};

export default Modal;
