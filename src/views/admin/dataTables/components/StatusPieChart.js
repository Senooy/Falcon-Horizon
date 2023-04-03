import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box } from '@chakra-ui/react';

const StatusPieChart = ({ data }) => {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B0000'];

  const chartData = data.reduce((acc, record) => {
    const statusIndex = acc.findIndex((item) => item.name === record.Status__c);
    if (statusIndex !== -1) {
      acc[statusIndex].value += 1;
    } else {
      acc.push({ name: record.Status__c, value: 1 });
    }
    return acc;
  }, []);

  return (
    <Box width="100%" height="300px">
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
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
);
};

export default StatusPieChart;

    