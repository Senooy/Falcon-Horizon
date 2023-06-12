import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdAssignment,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Racco from 'views/admin/dataTables/components/racco'
import Statistiques from 'views/admin/statistiques';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';

const routes = [
  {
    name: 'Accueil',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
  },
  {
    name: 'Statistiques',
    layout: '/admin',
    path: '/statistiques',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: Statistiques,
  },
  {
    name: 'Mes raccordements',
    layout: '/admin',
    path: '/racco',
    icon: <Icon as={MdAssignment} width="20px" height="20px" color="inherit" />,
    component: Racco,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: SignUpCentered,
  },

];

export default routes;
