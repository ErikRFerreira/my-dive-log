import AddDiveButton from './components/AddDiveButton';
import DiveList from './features/dives/DiveList';

function App() {
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Dive Log</h1>
        <AddDiveButton onClick={() => alert('Add dive (wire up in Week 7)')} />
      </header>
      <div style={{ height: 16 }} />
      <DiveList />
    </main>
  );
}

export default App;
