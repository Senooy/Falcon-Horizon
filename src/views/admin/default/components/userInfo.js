import React, { useContext } from "react";
import { AuthContext } from "contexts/AuthContext";

const AdminStatus = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.profileData) {
    return null;
  }

  const isAdmin = user.profileData.admin;

  return <div>{isAdmin ? "Oui" : "Non"}</div>;
};

export default AdminStatus;
