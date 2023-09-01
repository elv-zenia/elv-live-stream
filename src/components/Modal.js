import React from "react";
import {Root, Trigger, Overlay, Content, Title, Description, Close} from "@radix-ui/react-dialog";

const modalSizes = {
  "XS": "xs",
  "SM": "sm",
  "MD": "md",
  "LG": "lg"
};

const Modal = ({
  trigger,
  title,
  description,
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
  return (
    <div className="modal">
      <Root open={open} onOpenChange={onOpenChange}>
        <Trigger asChild>{ trigger }</Trigger>
        <Overlay className="modal__overlay">
          <Content className={`modal__content modal__content--${modalSizes[size]}`}>
            <Title className="modal__content__body__title">{ title }</Title>
            <div className="modal__content__body">
              {
                description &&
                <Description>{ description }</Description>
              }
              { children }
            </div>
            <div className="modal__actions">
              {
                !hideCancelButton &&
                <Close asChild>
                  <button type="button" className="button__secondary" onClick={CancelCallback}>
                    { cancelText }
                  </button>
                </Close>
              }
              <Close asChild>
                <button type="button" className="button__primary" onClick={ConfirmCallback}>
                  { confirmText }
                </button>
              </Close>
            </div>
          </Content>
        </Overlay>
      </Root>
    </div>
  );
};

export default Modal;
