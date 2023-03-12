import React from 'react';
import { VictoryPie } from 'victory';
import { Box } from '@chakra-ui/react';

const data = [
  { x: 'Error', y: 3 },
  { x: 'ToConfirm', y: 2 },
  { x: 'Payed', y: 1 },
];

const Fromage = () => {
  return (
    <Box>
      <VictoryPie
        data={data}
        colorScale={['#319795', '#F59E0B', '#E53E3E']}
        innerRadius={70}
        labelRadius={100}
        style={{ labels: { fill: '#fff', fontSize: 16, fontWeight: 'bold' } }}
      />
    </Box>
  );
};

export default Fromage;
