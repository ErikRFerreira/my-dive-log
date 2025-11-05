import AddDiveButton from '../components/dives/AddDiveButton';
import DiveList from '../features/dives/DiveList';

function Dashboard() {
  return (
    <div>
      <AddDiveButton onClick={() => alert('Add dive (wire up in Week 7)')} />
      <DiveList />
    </div>
  );
}

export default Dashboard;
