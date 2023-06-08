import React, { useMemo } from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import Chart from "react-apexcharts";
import { calculateMonthlyData } from "./utils.js";

const RaccordementTable = ({ data }) => {
  const raccordOK = data.filter((record) => record.ConnectionStatus__c === "RaccordOK").length;
  const payedValidatedProgress = data.filter(
    (record) =>
      (record.Status__c === "Validated" ||
        record.Status__c === "Payed" ||
        record.Status__c === "Progress") ||
        record.ConnectionStatus__c == "EnCours" &&
      !record.OfferName__c.includes("Mobile")
  ).length;
  const tauxRaccordement = (raccordOK / payedValidatedProgress) * 100;

  const monthlyData = useMemo(() => calculateMonthlyData(data), [data]);

  const chartOptions = {
    chart: {
      id: "bar",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: monthlyData.map((item) => item.month),
    },
    plotOptions: {
      bar: {
        columnWidth: "50%",
      },
    },
  };

  const chartSeries = [
    {
      name: "RaccordOK",
      data: monthlyData.map((item) => item.count),
    },
  ];

  return (
    <Box width="100%" mt={4}>
      <Box width="100%" overflowX="auto">
        <Table variant="simple" minWidth="500px">
          <Thead>
            <Tr>
              <Th>RaccordOK</Th>
              <Th>Contrats validés</Th>
              <Th>Taux de raccordement</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{raccordOK}</Td>
              <Td>{payedValidatedProgress}</Td>
              <Td>{tauxRaccordement.toFixed(2)}%</Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
      <Box mt={8}>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </Box>
    </Box>
  );
};

export default RaccordementTable;
