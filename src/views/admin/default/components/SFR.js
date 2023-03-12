import React from "react";

const TableComponent = ({ data }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Prospect</th>
          <th>City</th>
          <th>Creation Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item) => (
          <tr key={item.Name}>
            <td>{item.Name}</td>
            <td>{item.Prospect__c}</td>
            <td>{item.CustomerCity__c}</td>
            <td>{item.CreationDate__c}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableComponent;
