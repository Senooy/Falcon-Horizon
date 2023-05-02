// components/UsersTable.js
import React, { useState, useEffect } from 'react';

const UsersTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Error fetching users', error);
      });
  }, []);

  return (
    <div>
      <h2>Liste des utilisateurs</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Code de vente</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.salesCode}</td>
              <td>{user.isAdmin ? 'Oui' : 'Non'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
