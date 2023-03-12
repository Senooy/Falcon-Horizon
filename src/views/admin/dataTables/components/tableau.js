import React, { Component } from 'react';
import data from './SFR00000.json';
import { Table, Thead, Tbody, Tr, Th, Td, Button, Box, FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText, Input } from "@chakra-ui/react"

class Tableau extends Component {
constructor(props) {
super(props);
this.state = {
records: data.records,
currentPage: 1,
recordsPerPage: 10
};
this.handleClick = this.handleClick.bind(this);
}

handleClick(event) {
this.setState({
currentPage: Number(event.target.id)
});
}

handleInputChange = (event) => {
    this.setState({
      fileName: event.target.value
    });
  }

  handleLoadClick = () => {
    const fileName = this.state.fileName;
    try {
      const newData = require(`./${fileName}.json`);
      this.setState({
        records: newData.records
      });
    } catch (error) {
      console.log(error);
    }
  }

render() {
const { records, currentPage, recordsPerPage } = this.state;

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

<div style={{ paddingTop:'10px',  display: 'flex', alignItems: 'flex-end', marginLeft:'20px'}}>
  <FormControl id="fileName" isRequired style={{ width: '20%' }}>
    <FormLabel>Code vendeur</FormLabel>
    <Input type="text" placeholder="Votre code vendeur" onChange={this.handleInputChange} />
  </FormControl>
  <Button variant="brand" onClick={this.handleLoadClick}  size="sm" style={{ marginLeft: '10px', marginBottom:'5px', height: '30px' }}>Charger</Button>
</div>



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
        {currentRecords.map(record => (
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
      {pageNumbers.map(number => (
        <Button
          key={number}
          id={number}
          onClick={this.handleClick}
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

}
}

export default Tableau;