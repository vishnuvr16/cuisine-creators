import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  return (
    <>
      <Navbar />
      <main className='min-h-[calc(100vh-120px)]'>
        <Outlet />
      </main>
    </>
  );
}

export default App;
