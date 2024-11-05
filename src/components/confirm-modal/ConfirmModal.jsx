import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Flex, Modal, Text} from "@mantine/core";
import {Loader} from "@/components/Loader.jsx";

const ConfirmModal = observer(({
  message,
  title,
  ConfirmCallback,
  CloseCallback,
  show,
  loadingText,
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
        loading && loadingText ?
          <Text>{loadingText}</Text> : null
      }
      {
        !error ? null :
          <div className="modal__error">
            Error: { error }
          </div>
      }
      <Flex direction="row" align="center" className="modal__actions">
        <Button variant="outline" onClick={CloseCallback}>
          {cancelText}
        </Button>
        <Button
          disabled={loading}
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);
              await ConfirmCallback();
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(error);
              setError(error?.message || error.kind || error.toString());
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader loader="inline" className="modal__loader"/> : confirmText}
        </Button>
      </Flex>
    </Modal>
  );
});

export default ConfirmModal;
