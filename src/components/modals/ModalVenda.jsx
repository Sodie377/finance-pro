import React from 'react';
import Modal from '../Modal'; // Sobe um nível para achar a moldura
import NovaVenda from '../NovaVenda'; // Sobe um nível para achar o formulário

const ModalVenda = ({ isOpen, onClose, onSalvar }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="💰 Registrar Venda">
      <NovaVenda onSalvar={onSalvar} />
    </Modal>
  );
};

export default ModalVenda;