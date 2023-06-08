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
import Tableau from './views/admin/racco/components/racco';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';

const routes = [
  {
    name: 'Mes ventes',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: MainDashboard,
  },
  {
    name: 'Mes raccordements',
    layout: '/admin',
    path: '/racco',
    icon: <Icon as={MdPower} width="20px" height="20px" color="inherit" />,
    component: Tableau,
  },
  {
    name: 'Statistiques',
    layout: '/admin',
    path: '/statistiques',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    component: Statistiques,
  },
];

export default routes;
