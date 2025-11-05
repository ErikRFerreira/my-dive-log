import { RouterProvider } from 'react-router';
import router from './routes/routes';
//import AddDiveButton from './components/dives/AddDiveButton';
//import DiveList from './features/dives/DiveList';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
