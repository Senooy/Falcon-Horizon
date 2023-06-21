import React, { useState, useEffect, useContext } from 'react';
import { Box, Spinner, Alert, AlertIcon, Stack, Flex, Heading, Text } from "@chakra-ui/react";
import { AuthContext } from "contexts/AuthContext";
import { useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';

const UserContrats = () => {
    const { user } = useContext(AuthContext);
  
    if (user && user.profileData && !user.profileData.admin) {
      return <ContratsValides />;
    }
  
    return null;
};

const ContratsValides = () => {
    
    const { user } = useContext(AuthContext);
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const bgColor = useColorModeValue("white", "gray.800");
    

    const fetchData = async () => {
        try {
            if (user && user.profileData) {
                const { data } = await axios.get(
                    "http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=" +
                    `${user.profileData.salesCode}`
                );
                setRecords(data.records);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setError(error.toString());
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Create dates for the start and end of the current month
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endOfMonth = new Date(currentYear, currentMonth, 0).getTime();

    const contratsValides = records.filter(record => {
        if (record.ConnectionStatus__c === 'RaccordOK' && record.ConnectionDate__c) {
            const recordDate = new Date(record.ConnectionDate__c).getTime();
            return recordDate >= startOfMonth && recordDate <= endOfMonth;
        }
        return false;
    }).length;

    const contratsEnCours = records.filter(record => {
        if (record.ConnectionStatus__c === 'EnCours' && record.CreationDate__c) {
            const recordDate = new Date(record.CreationDate__c).getTime();
            return recordDate >= startOfMonth && recordDate <= endOfMonth;
        }
        return false;
    }).length;

    const contratsDuMois = records.filter(record => {
        if (record.CreatedDate) {
            const recordDate = new Date(record.CreatedDate).getTime();
            return recordDate >= startOfMonth && recordDate <= endOfMonth;
        }
        return false;
    }).length;

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <Alert status="error">
                <AlertIcon />
                {`Une erreur est survenue : ${error}`}
            </Alert>
        );
    }

    return (
        <Stack spacing={4}>
            <Heading size="xl" textAlign="center">Votre mois de production</Heading>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" flexWrap="wrap">
                <Box 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    padding="5px"
                    backgroundColor={bgColor}
                    width={{ base: "100%", md: "20%" }}
                    height="75px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    marginBottom={{ base: "1rem", md: "0" }}
                >
                    <Heading size="md">Raccordés</Heading>
                    <Text fontSize="2xl">{contratsValides}</Text>
                </Box>
                <Box 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    padding="5px"
                    backgroundColor={bgColor}
                    width={{ base: "100%", md: "20%" }}
                    height="75px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    marginBottom={{ base: "1rem", md: "0" }}
                >
                    <Heading size="md">En cours</Heading>
                    <Text fontSize="2xl">{contratsEnCours}</Text>
                </Box>
                <Box 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    padding="5px"
                    backgroundColor={bgColor}
                    width={{ base: "100%", md: "20%" }}
                    height="75px"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Heading size="md">Contrats signés</Heading>
                    <Text fontSize="2xl">{contratsDuMois}</Text>
                </Box>
            </Flex>
        </Stack>
    );    
};

export default UserContrats;
