// RaccordementPieChart.js
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Box, Flex, Text } from "@chakra-ui/react";
import StatusPieChart from "views/admin/dataTables/components/StatusPieChart";

const RaccordementPieChart = ({ data }) => {
  const raccordementColors = {
    Raccordé: "#43fe36",
    "Non raccordé": "#fe1900",
  };

  const chartData = [
    {
      name: "Raccordé",
      value: data.filter(
        (record) =>
          record.ConnectionStatus__c === "RaccordOK" &&
          (record.Status__c === "Payed" || record.Status__c === "Validated")
      ).length,
    },
    {
      name: "Non raccordé",
      value: data.filter(
        (record) =>
          record.ConnectionStatus__c !== "RaccordOK" &&
          (record.Status__c === "Payed" || record.Status__c === "Validated")
      ).length,
    },
  ];

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  const tooltipFormatter = (value, name, props) => {
    const pourcentage = ((props.payload.value / total) * 100).toFixed(2);
    return `${pourcentage}%`;
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
              <Cell key={`cell-${index}`} fill={raccordementColors[entry.name]} />
            ))}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="1.5rem"
              fontWeight="bold"
            >
              {((chartData[0].value / total) * 100).toFixed(2)}%
            </text>
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

export default RaccordementPieChart;
