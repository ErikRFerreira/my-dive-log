import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';

import NewDiveForm from './NewDiveForm';

function AddDive() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setIsModalOpen(true)}>+ Add Dive</Button>
      {isModalOpen && (
        <Modal closeModal={() => setIsModalOpen(false)}>
          <NewDiveForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default AddDive;
