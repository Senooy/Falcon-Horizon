// react component importing a JSON file and using it to populate a table with data from the JSON file 

import React, { useState, useEffect } from 'react';
import data from './SFR63466.json';

function DataTable() {
    const [tableData, setTableData] = useState([]);
    
    useEffect(() => {
        setTableData(data);
    }, []);
    
    return (
        <table>
        <thead>
            <tr>
            <th>Name</th>
            <th>TchProspectName__c</th>
            <th>TchAddress__c</th>
            <th>CustomerCity__c</th>
            </tr>
        </thead>
        <tbody>
            {tableData.map((row) => (
            <tr key={row.Id}>
                <td>{row.Name}</td>
                <td>{row.TchProspectName__c}</td>
                <td>{row.TchAddress__c}</td>
                <td>{row.CustomerCity__c}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
    }
