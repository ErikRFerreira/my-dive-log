import { NavLink } from 'react-router';

function MainNav() {
  const styles = {
    padding: '1rem',
    borderBottom: '1px solid #ccc',
  };

  return (
    <nav style={styles} aria-label="Main navigation">
      <ul>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/dives">Dives</NavLink>
        </li>
        <li>
          <NavLink to="/account">Account</NavLink>
        </li>
        <li>
          <NavLink to="/settings">Settings</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default MainNav;
