import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Flex, Text, Select } from '@chakra-ui/react';

const StatusPieChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B0000'];

  const [periode, setPeriode] = useState('jour');

  const chartData = data.reduce((acc, record) => {
    const statusIndex = acc.findIndex((item) => item.name === record.Status__c);
    if (statusIndex !== -1) {
      acc[statusIndex].value += 1;
    } else {
      acc.push({ name: record.Status__c, value: 1 });
    }
    return acc;
  }, []);

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  const tooltipFormatter = (value, name, props) => {
    const pourcentage = ((props.payload.value / total) * 100).toFixed(2);
    return `${pourcentage}%`;
  };

  const handlePeriodeChange = (event) => {
    setPeriode(event.target.value);
  };

  return (
    <Box width="100%" height="400px">
      <ResponsiveContainer>
        
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={tooltipFormatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <Flex justifyContent="center" mt={2}>
        {chartData.map((item, index) => (
          <Text key={index} fontSize="sm" mx={2}>
            {`${item.name}: ${(item.value / total * 100).toFixed(2)}%`}
          </Text>
        ))}
      </Flex>
    </Box>
  );
};

export default StatusPieChart;
