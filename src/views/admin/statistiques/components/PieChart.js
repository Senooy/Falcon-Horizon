import React, { useEffect, useState } from "react";
import {
  Box,
  ButtonGroup,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import RaccordementTable from './StatusPieChart';
import { PieChart } from "recharts";

const Tableau = () => {
  const { user } = React.useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filter, setFilter] = useState("Tous");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        "http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=" +
          `${user.profileData.salesCode}`
      );
      setRecords(data.records);
      setFilteredRecords(data.records);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFilter = (filter) => {
    const now = new Date();
    let filtered = [];

    if (filter === "Tous") {
      filtered = records;
    } else {
      const oneDay = 24 * 60 * 60 * 1000;

      switch (filter) {
        
    
        case "Mois":
          filtered = records.filter((record) => {
            const recordDate = new Date(record.CreatedDate);
            const diffDays = Math.round(Math.abs((now - recordDate) / oneDay));
            return diffDays <= 30;
          });
          break;
    
        case "Année":
          filtered = records.filter((record) => {
            const recordDate = new Date(record.CreatedDate);
            const diffDays = Math.round(Math.abs((now - recordDate) / oneDay));
            return diffDays <= 365;
          });
          break;
    
        default:
          break;
      }
    }
    
    setFilteredRecords(filtered);
    setFilter(filter);

  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const calculateTauxRaccordement = (records) => {
    const raccordOK = records.filter(record => record.ConnectionStatus__c === "RaccordOK").length;
    const payedValidated = records.filter(record => ["Payed", "Validated"].includes(record.Status__c)).length;

    if (payedValidated === 0) {
      return 0;
    }
    return (raccordOK / payedValidated) * 100;
  };

  const tauxRaccordement = calculateTauxRaccordement(filteredRecords);

  return (
    <Flex direction="column" alignItems="center"
    bgColor="white"
    borderRadius="20px"
    
    >
      <Text fontSize="2xl" fontWeight="bold" mb={4} mt={10}> Taux de raccordement </Text>

      <RaccordementTable data={filteredRecords} tauxRaccordement={tauxRaccordement} /> {/* Passer le taux de raccordement en prop */}
      <ButtonGroup isAttached mt={10} mb={4}>
        <Button
          colorScheme={filter === "Tous" ? "blue" : "gray"}
          onClick={() => handleFilter("Tous")}
        >
          Tous
        </Button>
       
        <Button
          colorScheme={filter === "Mois" ? "blue" : "gray"}
          onClick={() => handleFilter("Mois")}
        >
          Mois
        </Button>
        <Button
          colorScheme={filter === "Année" ? "blue" : "gray"}
          onClick={() => handleFilter("Année")}
        >
          Année
        </Button>
      </ButtonGroup>
    </Flex>
  );
};

export default Tableau;