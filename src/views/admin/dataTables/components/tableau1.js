import React, { useEffect, useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td, Button, Box } from "@chakra-ui/react";
import axios from "axios";
import { AuthContext } from "contexts/AuthContext";

const Tableau = () => {
  const { user } = React.useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const token_url = "https://login.salesforce.com/services/oauth2/token";

  const token_payload = {
    grant_type: "password",
    client_id:
      "3MVG9I5UQ_0k_hTlxl9SwXkHaaX5kX0qAYQOq8c.PkG5DFWIFEwsrzI496JZ.GmBIIHFqnwDc75JvefLHSe.7",
    client_secret:
      "352231377BC938C6935CBC9E243BF1180120947E65594D9EC35A6F230E3DFAA4",
    username: "falcon@api.circet",
    password: "Younes59200-9jWI0f3cPXYm2OJr94rZMu1Z",
  };

  const fetchData = async () => {
    try {
      const { data } = await axios.post(token_url, token_payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (data) {
        const { data: salesData } = await axios.get(
          `https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/${user.profileData.salesCode}/Sales__r`,
          {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          }
        );

        setRecords(salesData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  function handleClick(event) {
    setCurrentPage(Number(event.target.id));
  }

  // Index de début et de fin de la section d'enregistrements à afficher
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);

  // Affichage des numéros de page
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(records.length / recordsPerPage); i++) {
    pageNumbers.push(i);
  }

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

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nom</Th>
            <Th>Adresse</Th>
            <Th>Numéro de téléphone</Th>
            <Th>Raccordement</Th>
            <Th>Date de raccordement</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {currentRecords.map((record) => (
            <Tr key={record.Id}>
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
      <div>
        {pageNumbers.map((number) => (
          <Button
            key={number}
            id={number}
            onClick={handleClick}
            size="sm"
            colorScheme={currentPage === number ? "blue" : "gray"}
            ml={2}
          >
            {number}
          </Button>
        ))}
      </div>
    </Box>
  );
};

export default Tableau;