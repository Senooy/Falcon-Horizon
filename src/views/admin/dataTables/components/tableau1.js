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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import ReactPaginate from "react-paginate";
import "./pagination.css";
import { FaAngleDown } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import { MdOutlineRotateLeft } from "react-icons/md"
import { Link } from "react-router-dom";
import { Input } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './i18n.js'
import { useTranslation } from 'react-i18next';

const PER_PAGE = 100;

const Tableau = () => {
  const { colorMode } = useColorMode();
  const { user } = React.useContext(AuthContext);
  const shouldHideTable = user && user.profileData && user.profileData.admin;
  const [jsonData, setJsonData] = useState(null);
  const periods = ["Semaine", "Mois", "Année"];
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  // State variable to handle modal open/close state
  const [isOpen, setIsOpen] = useState(false);
  // State variable to handle details of the currently selected record
  const [currentRecord, setCurrentRecord] = useState(null);
  const { t } = useTranslation(); // Utilisation de la fonction t() pour traduire les termes
  const handleOpenModal = (record) => {
    setCurrentRecord(record);
    setIsOpen(true);
  }
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

  const [selectedMonth, setSelectedMonth] = useState("");

  const [selectedDate, setSelectedDate] = useState(null);

  const openModal = (record) => {
    setCurrentRecord(record);
    setIsOpen(true);
  }

  const resetDatePicker = () => {
    setSelectedDate(null); // Clear the selected date
  };



  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    const filtered = filterRecords(filter.period, filter.status, filter.hasConnectingDate);
    setFilteredRecords(filtered);
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date);  // Définir la date sélectionnée
    const filtered = filterRecords(filter.period, filter.status, filter.hasConnectingDate);
    setFilteredRecords(filtered);
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
  }, [records, filter, searchValue, selectedMonth, selectedDate]);

  
  const now = new Date();

  const oneDay = 24 * 60 * 60 * 1000;

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        "http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=" +
          `${user.profileData.salesCode}`
      );
      setRecords(data.records);
      const filtered = filterRecords(filter.period, filter.status, filter.hasConnectingDate);
      setFilteredRecords(filtered);
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (date, isPaymentDate = false) => {
    if (!date) {
      return "";
    }
    const d = new Date(date);
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
  
    if (isPaymentDate) {
      month += 1;
      if (month > 12) {
        month = 1; // reset to January
        year++; // increment year
      }
    }
  
    return isNaN(d.getTime())
      ? ""
      : `${d.getDate().toString().padStart(2, "0")}/${month
          .toString()
          .padStart(2, "0")}/${year}`;
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
    "Tous",
    "EnCoursDeRattrapage",
    "Error",
    "Validated",
    "Payed",
  ];
  

  const filterRecords = (period, status, hasConnectingDate) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
  
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
          return diffDaysConnecting >= -1 && diffDaysConnecting <= 1;
        }
        return false;
      });
    }
  
    if (selectedMonth) {
      filteredByStatus = filteredByStatus.filter((record) => {
        if (record.DateOfPayment__c) {
          const paymentMonth = new Date(record.DateOfPayment__c).getMonth() + 1;
          return parseInt(selectedMonth) === paymentMonth;
        }
        return false;
      });
    }

    if (selectedDate) {
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      
      filteredByStatus = filteredByStatus.filter((record) => {
        if (record.DateOfPayment__c) {
          const paymentDate = new Date(record.DateOfPayment__c);
          const paymentMonth = paymentDate.getMonth();
          const paymentYear = paymentDate.getFullYear();
      
          // Check if payment year and month matches the selected year and month - 1
          const isSameYear = selectedYear === paymentYear;
          const isPreviousMonth = (selectedMonth === 0 && paymentMonth === 11 && !isSameYear) 
                                || (selectedMonth === paymentMonth + 1 && isSameYear);
    
          return isPreviousMonth;
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
  
// ...
const sortedRecords = sortRecords(filteredRecords).map((record) => ({
  ...record,
  CreatedDate: formatDate(record.CreatedDate),
  ConnectingDatePlanned__c: formatDate(record.ConnectingDatePlanned__c),
  DateOfPayment__c: formatDate(record.DateOfPayment__c, true), // ici on passe true pour ajouter un mois
}));
// ...


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

    shouldHideTable ? null : 
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
  

      <div style={{ marginTop: "20px" }}></div>
      <Flex direction={{ base: "column", md: "column" }} w="100%" alignItems={{ base: 'left', md: 'left' }}>
  <Input 
    placeholder="Recherche..."
    value={searchValue}
    onChange={handleSearchChange}
    mb={4}
    bg={colorMode === "dark" ? "gray.800" : "gray.100"} // Champs sombres en mode sombre
    color={colorMode === "dark" ? "white" : "black"} // Texte blanc en mode sombre
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
    <Text fontWeight="bold" mb={2}>Période :</Text>
    <RadioGroup 
      onChange={(value) => handleFilter(value, filter.status)} 
      value={filter.period}
    >
      <Radio value="Tous" mr={2}>Tous</Radio>
      {periods.map((period) => (
        <Radio key={period} value={period} mr={2}>{period}</Radio>
      ))}
    </RadioGroup>
  </Box>

  <Box mb={4}>
    <Text fontWeight="bold" mb={2}>Statut :</Text>
    <RadioGroup 
      onChange={(value) => handleFilter(filter.period, value)} 
      value={filter.status}
    >
      {statuses.map((status) => (
        <Radio key={status} value={status} mr={2}>{t(status)}</Radio>
      ))}
    </RadioGroup>
  </Box>

  <Box mb={4} spacing={20}>
    <Text fontWeight="bold">Facturation :</Text>
    <Flex direction="row" alignItems="center">
      <DatePicker
        selected={selectedDate}
        onChange={handleDateChange}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        placeholderText="Choisir une date"
      />
      <Button onClick={resetDatePicker} variant="outline" marginLeft={2}>
        <MdOutlineRotateLeft />
      </Button>
    </Flex>
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
      <Th>Nom</Th>
      <Th>Numéro de téléphone</Th>
      <Th
  onClick={() => toggleSortDirection("ConnectingDatePlanned__c")}
  style={{ cursor: "pointer" }}
>
  Date de raccordement prévue
</Th>
      <Th>Statut</Th>
    </Tr>
  </Thead>

  <Tbody>
    {sortedRecords
      .slice(offset, offset + PER_PAGE)        .map((record, index) => (
        <React.Fragment key={record.Id}>
            <Tr 
    bg={getRowColor(record.Status__c)}
    onClick={() => handleOpenModal(record)}
    style={{ cursor: "pointer" }}
  >

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
                href={`tel:${record.ProspectMobilePhone__c}`}
                style={{ color: "blue" }}>
                   {record.ProspectMobilePhone__c}
                </a>
                </Td>
            <Td>{record.ConnectingDatePlanned__c}</Td>
            <Td>{t(record.Status__c)}</Td>

          </Tr>
          
        </React.Fragment>
      ))}
  </Tbody>
</Table>
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Détails de la vente</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {currentRecord && (
        <VStack align="start" mt={2} mb={2}>
          <Text>
            <strong>Client :</strong> {currentRecord.TchProspectName__c} 
            </Text>
            <Text>
            <strong>Numéro :</strong> <a
                href={`tel:${currentRecord.ProspectMobilePhone__c}`}
                style={{ color: "blue" }}>
                   {currentRecord.ProspectMobilePhone__c}
                </a>
            </Text>
          <Text>
            <strong>Adresse :</strong> {currentRecord.TchAddress__c}
          </Text>
          <Text>
            <strong>Statut du raccordement :</strong> {currentRecord.ConnectionStatus__c}
          </Text>
          <Text>
            <strong>Offre :</strong> {currentRecord.OfferName__c}
          </Text>
          <Text>
            <strong>Famille de l'offre :</strong> {currentRecord.FamilyOffer__c}
          </Text>
          <Text>
            <strong>Date de signature :</strong> {formatDate(currentRecord.SignatureDate__c)}
          </Text>
          <Text>
            <strong>Date de validation :</strong> {formatDate(currentRecord.ValidationDate__c)}
          </Text>
          <Text>
            <strong>Type de vente :</strong> {currentRecord.CustomerType__c}
          </Text>
          <Text>
            <strong>Numéro de commande :</strong> {currentRecord.OrderNumber__c}
          </Text>
          <Text>
            <strong>Numéro de panier :</strong> {currentRecord.BasketNumber__c}
          </Text>
          <Text>
            <strong>Commentaire du technicien :</strong> {currentRecord.Comment__c}
          </Text>
        </VStack>
      )}
    </ModalBody>
    <ModalFooter>
      <Button colorScheme="blue" mr={3} onClick={() => setIsOpen(false)}>
        Fermer
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

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
export default Tableau;
