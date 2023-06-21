import React, { useEffect, useState } from "react";
import { Box, Button, ButtonGroup, Text, useColorMode, Heading } from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ContratsJournaliers = () => {
  const { user } = React.useContext(AuthContext);
  const { colorMode } = useColorMode();
  const [records, setRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState("Tous");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        "http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=" +
          `${user.profileData.salesCode}`
      );
      setRecords(data.records);
      prepareChartData(data.records, period);
    } catch (error) {
      console.log(error);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={2} borderWidth={1} borderRadius="md">
          <Text color="black" fontWeight="bold">{`Date : ${label}`}</Text>
          <Text color="black">{`Contrats : ${payload[0].value}`}</Text>
        </Box>
      );
    }
    return null;
  };

  const prepareChartData = (records, period) => {
    let filteredRecords = [...records];


    if (period !== "Tous") {
      const now = new Date();
      let periodStart = new Date();
      switch (period) {
        case "Semaine":
          periodStart.setDate(now.getDate() - 7);
          break;
        case "Mois":
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case "Année":
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      filteredRecords = records.filter((record) => new Date(record.CreatedDate) >= periodStart);
    }


    let obj = {};
    filteredRecords.forEach((record) => {
      const date = new Date(record.CreatedDate);
      const dateString = date.toLocaleDateString('fr-FR');  // updated here

      if (obj[dateString]) {
        obj[dateString]++;
      } else {
        obj[dateString] = 1;
      }
    });

    const arr = Object.keys(obj).map((key) => ({
      date: key,
      count: obj[key],
    }));

    setChartData(arr);
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  return (
    <Box p={5} boxShadow="xl" bg="white" borderRadius="md">
      <Heading size="lg" mb={5}>Vos ventes journalières</Heading>
      <ResponsiveContainer width="100%" height={500}>
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="count" stroke="#1D3E5E" strokeWidth={3} dot={{ r: 5 }} />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" strokeOpacity={0.5} />
          <XAxis dataKey="date" tick={{ fontSize: 16, fontWeight: 'bold' }} />
          <YAxis tick={{ fontSize: 16, fontWeight: 'bold' }} />
          <Tooltip 
            contentStyle={{ fontSize: '16px', fontWeight: 'bold' }}
            itemStyle={{ color: '#1D3E5E' }} 
          />
        </LineChart>
      </ResponsiveContainer>
      <ButtonGroup mt={5}>
        {["Tous", "Semaine", "Mois", "Année"].map((p) => (
          <Button
            key={p}
            colorScheme={period === p ? "blue" : "gray"}
            onClick={() => handlePeriodChange(p)}
          >
            {p}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};

export default ContratsJournaliers;
