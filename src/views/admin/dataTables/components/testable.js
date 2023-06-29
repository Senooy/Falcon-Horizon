import React, { useState, useEffect, useContext } from "react";
import { Table, Input, Space, Modal, Button, Pagination } from "antd";
import { Link } from "react-router-dom";
import { AuthContext } from "contexts/AuthContext";
import axios from "axios";
import { MdBarChart, MdOutlineRotateLeft } from "react-icons/md";
import { FaAngleDown } from "react-icons/fa";
import './i18n.js'
import { useTranslation } from 'react-i18next';


const Tableau = () => {
  const [records, setRecords] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [sortDirection, setSortDirection] = useState("desc");
  const { user } = useContext(AuthContext);
  const sortRecords = (data) => {
    return data.sort((a, b) => new Date(b.CreatedDate) - new Date(a.CreatedDate));
  };
  

  const [currentPage, setCurrentPage] = useState(1);


  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleOpenModal = (record) => {
    setCurrentRecord(record);
    setIsOpen(true);
  };

  const handleCollapseToggle = (id) => {
    console.log("Collapse toggle for id:", id);
  };

  const getRowColor = (status) => {
    return status === "someStatus" ? "green" : "white";
  };

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const locale = "fr-FR";
    return new Date(date).toLocaleDateString(locale, options);
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };
  
  

  const { t, i18n } = useTranslation();


  useEffect(() => {
const fetchData = async () => {
  try {
    const { data } = await axios.get(
      `http://app.falconmarketing.fr:3001/api/salesforce_data?salesCode=${user.profileData.salesCode}`
    );
    const sortedRecords = sortRecords(data.records);
    setRecords(sortedRecords);
    console.log(sortedRecords);
  } catch (error) {
    console.log(error);
  }
};

      

    fetchData();
  }, []);

  const columns = [
    {
      title: "Détails",
      dataIndex: "TchPhone__c",
      render: (text, record) => (
        <div onClick={() => handleCollapseToggle(record.Id)} style={{ cursor: "pointer" }}>
          {text} <FaAngleDown />
        </div>
      ),
    },
    {
      title: "Date de la vente",
      dataIndex: "CreatedDate",
      sorter: (a, b) => a.CreatedDate - b.CreatedDate,
      sortDirections: [sortDirection],
      render: formatDate,
    },
    {
      title: "Nom",
      dataIndex: "TchProspectName__c",
    },
    {
      title: "Numéro de téléphone",
      dataIndex: "ProspectMobilePhone__c",
      render: (text) => (
        <a href={`tel:${text}`} style={{ color: "blue" }}>
          {text}
        </a>
      ),
    },
    {
      title: "Date de raccordement prévue",
      dataIndex: "ConnectingDatePlanned__c",
      sorter: (a, b) => a.ConnectingDatePlanned__c - b.ConnectingDatePlanned__c,
      sortDirections: [sortDirection],
      render: formatDate,
    },
    {
      title: "Statut",
      dataIndex: "Status__c",
      render: (text) => t(text),
    },
  ];

  return (
    <div style={{ marginTop: "20px", padding: "10px" }}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <Input
          placeholder="Recherche..."
          value={searchValue}
          onChange={handleSearchChange}
          style={{ marginBottom: "15px" }}
        />
        <Link to="/admin/statistiques">
          <Button
            icon={<MdBarChart />}
            colorScheme="brand"
            variant="solid"
            style={{ marginBottom: "15px" }}
          >
            Statistiques
          </Button>
        </Link>
        <Table
  rowKey="Id"
  columns={columns}
  dataSource={records.slice((currentPage - 1) * 100, currentPage * 100)}
  pagination={false}
  onRow={(record) => ({
    onClick: () => handleOpenModal(record),
    style: { cursor: "pointer", backgroundColor: getRowColor(record.Status__c) }
  })}
  defaultSortOrder={sortDirection}
/>



      </Space>
      <Pagination
  total={records.length} // Remplacez records.length par le nombre total de lignes
  onChange={handlePaginationChange}
  showSizeChanger={false} // Masquer l'option de modification de la taille de la page
/>
      <Modal title="Détails" visible={isOpen} onCancel={() => setIsOpen(false)}>
        {/* Your modal content with currentRecord data */}
      </Modal>
    </div>
  );
};

export default Tableau;
