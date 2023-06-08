import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdPower,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import Statistiques from 'views/admin/statistiques';
import Tableau from './views/admin/dataTables/components/racco';

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
    icon: <Icon as={MdPower} width="20px" height="20px" color="inherit" />,
    component: Tableau,
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
