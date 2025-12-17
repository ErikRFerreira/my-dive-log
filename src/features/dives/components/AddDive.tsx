import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { useState } from 'react';

import NewDiveForm from './NewDiveForm';

function AddDive() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
      >
        <Plus className="w-5 h-5" />
        Add Dive
      </Button>
      {isModalOpen && (
        <Modal title="Log New Dive" closeModal={() => setIsModalOpen(false)}>
          <NewDiveForm onCancel={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default AddDive;
