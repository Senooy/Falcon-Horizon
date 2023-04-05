import React, { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box, Flex } from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import ReactPaginate from "react-paginate";
import "./pagination.css";
import Loader from "components/loader";
import StatusPieChart from './StatusPieChart';
import { FaAngleDown } from "react-icons/fa";

const PER_PAGE = 10;

const Tableau = () => {
  const { user } = React.useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "CreatedDate",
    ascending: false,
  });
  const [collapsedRowId, setCollapsedRowId] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(
        "http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=" +
          `${user.profileData.salesCode}`
      );
      setIsLoading(false);
      setRecords(data.records);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }
    const d = new Date(date);
    return isNaN(d.getTime())
      ? ""
      : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
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
  


  useEffect(() => {
  fetchData();
  }, [user]);
  
  function handlePageClick({ selected: selectedPage }) {
  setCurrentPage(selectedPage);
  }
  
  const offset = currentPage * PER_PAGE;
  
  const pageCount = Math.ceil(records.length / PER_PAGE);
  
  const sortedRecords = sortRecords(records).map((record) => ({
  ...record,
  CreatedDate: formatDate(record.CreatedDate),
  ConnectingDatePlanned__c: formatDate(record.ConnectingDatePlanned__c),
  }));
  
  return (
      <Box
        w={{ base: "100%", md: "100%" }}
        mx="auto"
        className="table-container"
        style={{
          backgroundColor: "white",
          borderRadius: "5px",
          boxShadow: "0 0 5px 1px rgba(0, 0, 0, 0.1)",
          padding: "10px",
          overflow: "auto",
          maxHeight: "600px", // Ajoutez la hauteur maximale souhaitée ici
          maxWidth: "100%", // Ajoutez la largeur maximale souhaitée ici
          minHeight: "300px", // Ajoutez la hauteur minimale souhaitée ici
          minWidth: "300px", // Ajoutez la largeur minimale souhaitée ici
        }}
      >
  <StatusPieChart data={records} />

  <div style={{ marginTop: '60px' }}></div>
    <Table variant="striped">
    <Thead>
  <Tr>
    <Th>Détails</Th>
    <Th onClick={() => toggleSortDirection("CreatedDate")} style={{ cursor: "pointer" }}>
      Date de la vente
    </Th>
    <Th>Nom</Th>
    <Th>Adresse</Th>
  </Tr>
</Thead>

<Tbody>
  {sortedRecords.slice(offset, offset + PER_PAGE).map((record, index) => (
    <React.Fragment key={record.Id}>
      <Tr>
        <Td onClick={() => handleCollapseToggle(record.Id)} style={{ cursor: "pointer" }}>
          {record.TchPhone__c} <FaAngleDown />
        </Td>
        <Td>{record.CreatedDate}</Td>
        <Td>{record.TchProspectName__c}</Td>
        <Td>{record.TchAddress__c}</Td>
      </Tr>

      {collapsedRowId === record.Id && (
  <Box display={collapsedRowId === record.Id ? "table-row-group" : "none"}>
    <Tr>
      <Td colSpan="4">
        <Flex direction="column" mt={2} mb={2}>
          <Box>
            <strong>Mobile :</strong> <a href="tel:{record.ProspectMobilePhone__c}" style={{ color: "blue" }}>{record.ProspectMobilePhone__c}</a>
          </Box>
          <Box>
            <strong>Offre :</strong> {record.OfferName__c}
          </Box>
          <Box>
            <strong>Famille de l'offre :</strong> {record.FamilyOffer__c}
          </Box>
          <Box>
            <strong>Date de signature :</strong> {formatDate(record.SignatureDate__c)}
          </Box>
          <Box>
            <strong>Date de validation :</strong> {formatDate(record.ValidationDate__c)}
          </Box>
          <Box>
            <strong>Type de vente :</strong> {record.CustomerType__c}
          </Box>
          <Box>
            <strong>Numéro de commande :</strong> {record.OrderNumber__c}
          </Box>
          <Box>
            <strong>Numéro de panier :</strong> {record.BasketNumber__c}
          </Box>
          <Box>
            <strong>Commentaire du call :</strong> {record.Comment__c}
          </Box>
        </Flex>
      </Td>
    </Tr>
  </Box>
)}



    </React.Fragment>
  ))}
</Tbody>

    </Table>
  
    <Box>
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
    {isLoading && <Loader />}
  </Box>
);
};

export default Tableau;

