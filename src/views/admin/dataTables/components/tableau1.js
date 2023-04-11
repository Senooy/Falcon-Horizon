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
} from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import ReactPaginate from "react-paginate";
import "./pagination.css";
import StatusPieChart from "./StatusPieChart";
import { FaAngleDown } from "react-icons/fa";

const PER_PAGE = 10;

const Tableau = () => {
  const { colorMode } = useColorMode();
  const { user } = React.useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "CreatedDate",
    ascending: false,
  });
  const [collapsedRowId, setCollapsedRowId] = useState(null);
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
        return sortConfig.ascending ? 1 : -1;
      }
      if (isNaN(dateB.getTime())) {
        return sortConfig.ascending ? -1 : 1;
      }
      return sortConfig.ascending ? dateA - dateB : dateB - dateA;
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

  const handleFilter = (filter) => {
    const now = new Date();
    let filtered = [];

    if (filter === "Tous") {
      filtered = records;
    } else {
      const oneDay = 24 * 60 * 60 * 1000;

      switch (filter) {
        case "Semaine":
          filtered = records.filter((record) => {
            const recordDate = new Date(record.CreatedDate);
            const diffDays = Math.round(Math.abs((now - recordDate) / oneDay));
            return diffDays <= 7;
          });
          break;
    
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
  
  function handlePageClick({ selected: selectedPage }) {
  setCurrentPage(selectedPage);
  }
  
  const offset = currentPage * PER_PAGE;
  
  const pageCount = Math.ceil(filteredRecords.length / PER_PAGE);
  
  const sortedRecords = sortRecords(filteredRecords).map((record) => ({
  ...record,
  CreatedDate: formatDate(record.CreatedDate),
  ConnectingDatePlanned__c: formatDate(record.ConnectingDatePlanned__c),
  }));

  const getRowColor = (status) => {
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

    const colors = colorMode === "light" ? lightColors : darkColors;
  return colors[status] || "";
};

  
  return (
  <Box
  w={{ base: "100%", md: "100%" }}
  mx="auto"
  className="table-container"
  style={{
  backgroundColor: colorMode === "light" ? "white" : "gray.700",
  borderRadius: "5px",
  boxShadow: "0 0 5px 1px rgba(0, 0, 0, 0.1)",
  padding: "10px",
  overflow: "auto",
  maxHeight: "600px",
  maxWidth: "100%",
  minHeight: "1000px",
  minWidth: "300px",
  }}
  >
  <StatusPieChart data={filteredRecords} />

  <div style={{ marginTop: "60px" }}></div>

<ButtonGroup isAttached mt={4} mb={4}>
  <Button
    colorScheme={filter === "Tous" ? "blue" : "gray"}
    onClick={() => handleFilter("Tous")}
  >
    Tous
  </Button>
  <Button
    colorScheme={filter === "Semaine" ? "blue" : "gray"}
    onClick={() => handleFilter("Semaine")}
  >
    Semaine
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

<Table variant="simple">
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
      <Th>Date de raccordement</Th>
      <Th>Statut</Th>
    </Tr>
  </Thead>

  <Tbody>
    {sortedRecords
      .slice(offset, offset + PER_PAGE)        .map((record, index) => (
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
            <Td>{record.ConnectingDatePlanned__c}</Td>
            <Td>{record.Status__c}</Td>

          </Tr>
          <Collapse in={collapsedRowId === record.Id}>
            <Box>
              <VStack align="start" mt={2} mb={2}>
                <Text>
                  <strong>Mobile :</strong>{" "}
                  <a
                    href="tel:{record.ProspectMobilePhone__c}"
                    style={{ color: "blue" }}
                  >
                    {record.ProspectMobilePhone__c}
                  </a>
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
<ReactPaginate
  previousLabel={"←"}
  nextLabel={"→"}
  pageCount={pageCount}
  onPageChange={handlePageClick}
  containerClassName={"pagination"}
  previousLinkClassName={"pagination__link"}
  nextLinkClassName={"pagination__link"}
  disabledClassName={"pagination__link--disabled"}
  activeClassName={"pagination__link--active"}
/>
</Box>
);
};
export default Tableau;
