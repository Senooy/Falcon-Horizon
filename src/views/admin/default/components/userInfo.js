import React, { useContext, useEffect, useState } from "react";
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
  IconButton,
} from "@chakra-ui/react";
import { FaRedo } from 'react-icons/fa';
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import ReactPaginate from "react-paginate";
import "views/admin/dataTables/components/pagination.css";
import { FaAngleDown } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import { Link } from "react-router-dom";
import { Input } from "@chakra-ui/react";

const PER_PAGE = 10;

const AdminTableau = () => {
  const { user } = useContext(AuthContext);

  if (!user || !user.profileData || !user.profileData.admin) {
    return null;
  }

  return <Tableau />;
};

const Tableau = () => {
  const periods = ["Semaine", "Mois", "Année"];
  const { colorMode } = useColorMode();
  const { user } = React.useContext(AuthContext);
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

  const [searchValue, setSearchValue] = useState('');  // NEW STATE FOR SEARCH VALUE

const handleSearchChange = (e) => {
  setSearchValue(e.target.value);
};

const searchRecords = (records) => {
  return records.filter(record => {
    const { TchProspectName__c, ProspectMobilePhone__c, OrderNumber__c } = record;
    const searchLower = searchValue.toLowerCase();
    return (TchProspectName__c && TchProspectName__c.toLowerCase().includes(searchLower)) ||
           (ProspectMobilePhone__c && ProspectMobilePhone__c.toLowerCase().includes(searchLower)) ||
           (OrderNumber__c && OrderNumber__c.toLowerCase().includes(searchLower));
  });
};

useEffect(() => {
  const filtered = filterRecords(filter.period, filter.status);
  const searched = searchRecords(filtered);
  setFilteredRecords(searched);
}, [records, filter, searchValue]);

  const refreshJsonData = async () => {
    try {
      const response = await axios.post('/api/all_sales');
      if (response.status === 200) {
        fetchData(); // Réexécutez la fonction pour récupérer les données mises à jour
      } else {
        console.error('Erreur lors de la régénération du fichier all_sales.json');
      }
    } catch (error) {
      console.error('Erreur lors de la régénération du fichier all_sales.json:', error);
    }
  };

  const fetchData = async () => {
    try {
      const timestamp = Date.now(); // Génère un horodatage actuel
      const url = `http://app.falconmarketing.fr/all_sales.json?timestamp=${timestamp}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du fichier all_sales.json");
      }
      const data = await response.json();
      setRecords(data);
      setFilteredRecords(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du fichier all_sales.json:", error);
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

  const statuses = [
    "ToConfirm",
    "Validated",
    "Progress",
    "Error",
    "Payed",
    "EnCoursDeRattrapage", // Ajoutez le statut EnCoursDeRattrapage
  ];



  const filterRecords = (period, status) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
  
    const filteredByPeriod = records.filter((record) => {
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
  
    const filteredByStatus =
    status === "Tous"
      ? filteredByPeriod
      : filteredByPeriod.filter((record) => record.Status__c === status || record.ConnectionStatus__c === status); // Modifiez cette ligne pour inclure le statut EnCoursDeRattrapage

    return filteredByStatus;
  };


  const handleFilter = (period, status) => {
    const filtered = filterRecords(period, status);
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
  
  const sortedRecords = sortRecords(filteredRecords).map((record) => ({
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
  

  
  return (
    <Box
      bg={bgColor}
      borderRadius="5px"
      boxShadow="0 0 5px 1px rgba(0, 0, 0, 0.1)"
      p="10px"
      overflow="auto"
      maxH="600px"
      maxW="100%"
      minH="1000px"
      minW="300px"
    >
  

      <div style={{ marginTop: "60px" }}></div>
      <Flex direction={{ base: "column", md: "column" }} w="100%" alignItems={{ base: 'left', md: 'left' }}>
      <Input 
  placeholder="Recherche..."
  value={searchValue}
  onChange={handleSearchChange}
  mb={4}
/>
      <Link to="/admin/statistiques">
       <Button
        leftIcon={<MdBarChart />}
        colorScheme="brand"
        variant="solid"
        mb={4}
       >
      Statistiques
      
      </Button>
      

  </Link>
  
  <Box mb={4}>

  

    <ButtonGroup isAttached>
      <Button
        size="md"
        colorScheme={filter.period === "Tous" ? "brand" : "gray"}
        onClick={() => handleFilter("Tous", filter.status)}
        px={10}
      >
        Tous
      </Button>
      {periods.map((period) => (
        <Button
          key={period}
          size="md"
          colorScheme={filter.period === period ? "brand" : "gray"}
          onClick={() => handleFilter(period, filter.status)}
        >
          {period}
        </Button>
      ))}
    </ButtonGroup>
  </Box>

  <Box mb={4}>
      <ButtonGroup
        isAttached
        spacing={20}
        width={{ base: "100%", md: "auto" }}
        mb={4}
      >
        <Button
          size="md"
          colorScheme={filter.status === "Tous" ? "brand" : "gray"}
          onClick={() => handleFilter(filter.period, "Tous")}
          px={10}
        >
          Tous
        </Button>
        {statuses.map((status) => (
          <Button
            key={status}
            size="md"
            colorScheme={filter.status === status ? "blue" : "gray"}
            onClick={() => handleFilter(filter.period, status)}
            px={10}
          >
            {status}
          </Button>
        ))}
        <Button // Ajoutez un nouveau bouton pour le statut EnCoursDeRattrapage
          size="md"
          colorScheme={filter.status === "EnCoursDeRattrapage" ? "blue" : "gray"}
          onClick={() => handleFilter(filter.period, "EnCoursDeRattrapage")}
          px={10}
        >
          EnCoursDeRattrapage
        </Button>
      </ButtonGroup>
    </Box>

</Flex>

  
<Table variant="simple"
overflow={{ base: "auto", md: "auto" }}>
  <Thead>
    <Tr>
      <Th>Détails</Th>
      <Th
        onClick={() => toggleSortDirection("CreatedDate")}
        style={{ cursor: "pointer" }}
      >
        Date de la vente
      </Th>
      <Th>Vendeur</Th>
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
            <Td>{record.VendorName__c}</Td>
            <Td>{record.CreatedDate}</Td>
            <Td>{record.TchProspectName__c}</Td>
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
                    href="tel:{record.ProspectMobilePhone__c}"
                    style={{ color: "blue" }}
                  >
                    {record.ProspectMobilePhone__c}
                  </a>
                </Text>
                <Text>
                  <strong>Statut du raccordement :</strong>{record.ConnectionStatus__c}
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
<Box mt={6}>
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
</Box>
);
};

export default AdminTableau;
