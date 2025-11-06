import { createPortal } from 'react-dom';

type ModalProps = {
  children: React.ReactNode;
  closeModal: () => void;
};

function Modal({ children, closeModal }: ModalProps) {
  const overlayStyles = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyles = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    minWidth: '300px',
    maxWidth: '600px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'relative' as const,
  };

  const clodeModalStyles = {
    position: 'absolute' as const,
    top: '10px',
    right: '10px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  };

  return createPortal(
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <button style={clodeModalStyles} onClick={closeModal}>
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;
