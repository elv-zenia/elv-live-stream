import React, {useState} from "react";
import {observer} from "mobx-react";
import {Flex, Modal, Text} from "@mantine/core";
import {Loader} from "Components/Loader";

const ConfirmModal = observer(({
  message,
  title,
  ConfirmCallback,
  CloseCallback,
  show,
  cancelText="Cancel",
  confirmText="Confirm"
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  return (
    <Modal
      opened={show}
      onClose={CloseCallback}
      title={title}
      padding="32px"
      radius="6px"
      size="lg"
      centered
    >
      <Text>{message}</Text>
      {
        !error ? null :
          <div className="modal__error">
            Error: { error }
          </div>
      }
      <Flex direction="row" align="center" className="modal__actions">
        <button type="button" className="button__secondary" onClick={CloseCallback}>
          {cancelText}
        </button>
        <button
          type="button"
          disabled={loading}
          className="button__primary"
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);
              await ConfirmCallback();
            } catch(error) {
              console.error(error);
              setError(error?.message || error.kind || error.toString());
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader loader="inline" className="modal__loader"/> : confirmText}
        </button>
      </Flex>
    </Modal>
  );
});

export default ConfirmModal;
