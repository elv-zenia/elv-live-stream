import {useState} from "react";
import {observer} from "mobx-react-lite";
import {Button, Flex, Modal, Text, Loader} from "@mantine/core";

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
          <Text c="elv-red.4" fz="12px" mt="20px">
            Error: { error }
          </Text>
      }
      <Flex direction="row" align="center" mt="1.5rem" justify="flex-end">
        <Button variant="outline" onClick={CloseCallback} mr="0.5rem">
          {cancelText}
        </Button>
        <Button
          disabled={loading}
          onClick={async () => {
            try {
              setError(undefined);
              setLoading(true);
              await ConfirmCallback();
              CloseCallback();
            } catch(error) {
              // eslint-disable-next-line no-console
              console.error(error);
              setError(error?.message || error.kind || error.toString());
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? <Loader type="dots" size="xs" /> : confirmText}
        </Button>
      </Flex>
    </Modal>
  );
});

export default ConfirmModal;
