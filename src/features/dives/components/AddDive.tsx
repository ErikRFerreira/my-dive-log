import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import NewDiveForm from './NewDiveForm';
import { useState } from 'react';

function AddDive() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>+ Add Dive</Button>
      {isModalOpen && (
        <Modal closeModal={() => setIsModalOpen(false)}>
          <NewDiveForm />
        </Modal>
      )}
    </div>
  );
}

export default AddDive;
