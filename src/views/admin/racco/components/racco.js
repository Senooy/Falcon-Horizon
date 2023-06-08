import React, { useEffect, useState } from "react";
import {
  Box,
  useColorMode,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  VStack,
  Text,
  ButtonGroup,
  Button,
  Flex,
} from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import "./pagination.css";
import { FaAngleDown } from "react-icons/fa";
import { Heading } from "@chakra-ui/react";

const PER_PAGE = 100;

const Tableau = () => {
  const { colorMode } = useColorMode();
  const { user } = React.useContext(AuthContext);
  const shouldHideTable = user && user.profileData && user.profileData.admin;

  const periods = ["Semaine", "Mois", "Année"];
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "CreatedDate",
    ascending: false,
  });
  const [collapsedRowId, setCollapsedRowId] = useState(null);
  const [filter, setFilter] = useState({ period: "Tous", status: "Tous" });

  const getRowColor = (status) => {
    const colors = getRowColors(status);
    return colorMode === "light" ? colors.light : colors.dark;
  };

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;


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

  const formatDate = (date) => {
    if (!date) {
      return "";
    }
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ""
      : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const sortRecords = (records) => {
    return records.sort((a, b) => {
      const dateA = new Date(a[sortConfig.key]);
      const dateB = new Date(b[sortConfig.key]);
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
        return 0;
      }
      if (isNaN(dateA.getTime())) {
        return sortConfig.ascending ? -1 : 1;
      }
      if (isNaN(dateB.getTime())) {
        return sortConfig.ascending ? 1 : -1;
      }
      if (sortConfig.key === 'ConnectingDatePlanned__c') {
        // Inverse the direction for 'ConnectingDatePlanned__c'
        return sortConfig.ascending ? dateB - dateA : dateA - dateB;
      } else {
        return sortConfig.ascending ? dateA - dateB : dateB - dateA;
      }
    });
  };

  const toggleSortDirection = (key) => {
    setSortConfig((prevConfig) => {
      return {
        key: key,
        ascending: prevConfig.key === key ? !prevConfig.ascending : true,
      };
    });
  };

  const handleCollapseToggle = (rowId) => {
    if (collapsedRowId === rowId) {
      setCollapsedRowId(null);
    } else {
      setCollapsedRowId(rowId);
    }
  };

  const statuses = ["EnCoursDeRattrapage", "Error", "Validated", "Payed"];

  const filterRecords = (period, status, hasConnectingDate) => {
    let filteredByPeriod = records.filter((record) => {
      const recordDate = new Date(record.CreatedDate);
      const diffDays = Math.round(Math.abs((now - recordDate) / oneDay));

      switch (period) {
        case "Semaine":
          return diffDays <= 7;
        case "Mois":
          return diffDays <= 30;
        case "Année":
          return diffDays <= 365;
        default:
          return true;
      }
    });

    let filteredByStatus =
      status === "Tous"
        ? filteredByPeriod
        : filteredByPeriod.filter(
            (record) =>
              record.Status__c === status || record.ConnectionStatus__c === status
          );

    if (hasConnectingDate) {
      filteredByStatus = filteredByStatus.filter((record) => {
        if (
          record.ConnectingDatePlanned__c &&
          record.ConnectingDatePlanned__c.length > 0
        ) {
          const connectingDate = new Date(record.ConnectingDatePlanned__c);
          const diffDaysConnecting = Math.round(
            Math.abs((now - connectingDate) / oneDay)
          );
          return (
            diffDaysConnecting >= -1 && diffDaysConnecting <= 1
          );
        }
        return false;
      });
    }

    return filteredByStatus;
  };

  const handleFilter = (period, status, hasConnectingDate) => {
    const filtered = filterRecords(period, status, hasConnectingDate);
    setFilteredRecords(filtered);
    setFilter({ period, status });
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  function handlePageClick({ selected: selectedPage }) {
    setCurrentPage(selectedPage);
  }

  const offset = currentPage * PER_PAGE;

  const pageCount = Math.ceil(filteredRecords.length / PER_PAGE);

  const sortedRecords = sortRecords(filteredRecords)
    .filter((record) => {
      const connectingDate = new Date(record.ConnectingDatePlanned__c);
      const diffDaysConnecting = Math.round(
        Math.abs((now - connectingDate) / oneDay)
      );
      return (
        diffDaysConnecting >= -1 && diffDaysConnecting <= 1
      );
    })
    .map((record) => ({
      ...record,
      CreatedDate: formatDate(record.CreatedDate),
      ConnectingDatePlanned__c: formatDate(record.ConnectingDatePlanned__c),
    }));

  const bgColor = useColorModeValue("white", "gray.700");

  const getRowColors = (status) => {
    const lightColors = {
      ToConfirm: "rgba(0, 108, 254, 0.03)",
      Validated: "rgba(3, 255, 0, 0.3)",
      Progress: "rgba(3, 255, 0, 0.1)",
      Error: "rgba(255, 0, 0, 0.3)",
      Payed: "rgba(8, 254, 0, 0.91)",
    };

    const darkColors = {
      ToConfirm: "rgba(0, 108, 254, 0.1)",
      Validated: "rgba(3, 255, 0, 0.4)",
      Progress: "rgba(3, 255, 0, 0.2)",
      Error: "rgba(255, 0, 0, 0.4)",
      Payed: "rgba(8, 254, 0, 0.91)",
    };

    return {
      light: lightColors[status] || "",
      dark: darkColors[status] || "",
    };
  };

  return shouldHideTable ? null : (
    <Box
      bg={bgColor}
      borderRadius="5px"
      boxShadow="0 0 5px 1px rgba(0, 0, 0, 0.1)"
      p="10px"
      overflow="auto"
      maxH="600px"
      maxW="100%"
      minH="400px"
      minW="300px"
    >
      <div style={{ marginTop: "20px" }}></div>
      <Heading as="h2" size="lg" mb={5}>Vos raccordements à venir</Heading>
      <Flex direction={{ base: "column", md: "column" }} w="100%" alignItems={{ base: 'left', md: 'left' }}>
      </Flex>
      <Table variant="simple" overflow={{ base: "auto", md: "auto" }}>
      <Thead>
    <Tr>
      <Th>Détails</Th>
      <Th
        onClick={() => toggleSortDirection("CreatedDate")}
        style={{ cursor: "pointer" }}
      >
        Date de la vente
      </Th>
      <Th>Nom</Th>
      <Th>Numéro de téléphone</Th>
      <Th
        onClick={() => toggleSortDirection("ConnectingDatePlanned__c")}
        style={{ cursor: "pointer" }}
       >
          Date de raccordement
      </Th>

            <Th>Statut</Th>
          </Tr>
        </Thead>
        <Tbody>
          {sortedRecords
            .slice(offset, offset + PER_PAGE)
            .map((record, index) => (
              <React.Fragment key={record.Id}>
                <Tr bg={getRowColor(record.Status__c)}>
                  <Td
              onClick={() => handleCollapseToggle(record.Id)}
              style={{ cursor: "pointer" }}
            >
              {record.TchPhone__c} <FaAngleDown />
                 </Td>
                  <Td>{record.CreatedDate}</Td>
                  <Td>{record.TchProspectName__c}</Td>
                  <Td>
                  <a
                    href="tel:{record.ProspectMobilePhone__c}"
                    style={{ color: "blue" }}
                  >
                    {record.ProspectMobilePhone__c}
                  </a>
                </Td>
            <Td>{record.ConnectingDatePlanned__c}</Td>
            <Td>{record.Status__c}</Td>
                </Tr>
                <Collapse in={collapsedRowId === record.Id}>
                  <Box>
                    <VStack align="start" mt={2} mb={2}>
                      <Text>
                        <strong>Adresse :</strong> {record.TchAddress__c}
                      </Text>
                      <Text>
                        <strong>Mobile :</strong>{" "}
                        <a
                          href={`tel:${record.ProspectMobilePhone__c}`}
                          style={{ color: "blue" }}
                        >
                          {record.ProspectMobilePhone__c}
                        </a>
                      </Text>
                      <Text>
                        <strong>Statut du raccordement :</strong>
                        {record.ConnectionStatus__c}
                      </Text>
                      <Text>
                        <strong>Offre :</strong> {record.OfferName__c}
                      </Text>
                      <Text>
                        <strong>Famille de l'offre :</strong>{" "}
                        {record.FamilyOffer__c}
                      </Text>
                      <Text>
                        <strong>Date de signature :</strong>{" "}
                        {formatDate(record.SignatureDate__c)}
                      </Text>
                      <Text>
                        <strong>Date de validation :</strong>{" "}
                        {formatDate(record.ValidationDate__c)}
                      </Text>
                      <Text>
                        <strong>Type de vente :</strong>{" "}
                        {record.CustomerType__c}
                      </Text>
                      <Text>
                        <strong>Numéro de commande :</strong>{" "}
                        {record.OrderNumber__c}
                      </Text>
                      <Text>
                        <strong>Numéro de panier :</strong>{" "}
                        {record.BasketNumber__c}
                      </Text>
                      <Text>
                        <strong>Commentaire du call :</strong>{" "}
                        {record.Comment__c}
                      </Text>
                    </VStack>
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Tableau;