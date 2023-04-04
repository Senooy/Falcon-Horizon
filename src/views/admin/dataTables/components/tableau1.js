import React, { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Box } from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";
import ReactPaginate from "react-paginate";
import "./pagination.css";
import Loader from "components/loader";
import StatusPieChart from './StatusPieChart';
import PieCard from "views/admin/default/components/PieCard";

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
    <Box w={{ base: "100%", md: "100%" }} mx="auto" className="table-container">
      <style jsx>{`
        .table-container {
          background-color: white;
          border-radius: 5px;
          box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.1);
          padding: 10px;
          overflow: auto;
        }
        `}</style>
        <StatusPieChart data={records} />

        <div style={{ marginTop: '60px' }}></div>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th onClick={() => toggleSortDirection("CreatedDate")} style={{ cursor: "pointer" }}>
                Date de la vente
              </Th>
              <Th>Nom</Th>
              <Th>Adresse</Th>
              <Th>Numéro de téléphone</Th>
              <Th>Raccordement</Th>
              <Th onClick={() => toggleSortDirection("ConnectingDatePlanned__c")} style={{ cursor: "pointer" }}>
                Date de raccordement
              </Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
      
          <Tbody>
            {sortedRecords.slice(offset, offset + PER_PAGE).map((record) => (
              <Tr key={record.Id}>
                <Td>{record.CreatedDate}</Td>
                <Td>{record.TchProspectName__c}</Td>
                <Td>{record.TchAddress__c}</Td>
                <Td>{record.ProspectMobilePhone__c}</Td>
                <Td>{record.ConnectionStatus__c}</Td>
                <Td>{record.ConnectingDatePlanned__c}</Td>
                <Td>{record.Status__c}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      
        <Box>
          <ReactPaginate
            previousLabel={"← Précédent"}
            nextLabel={"Suivant →"}
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