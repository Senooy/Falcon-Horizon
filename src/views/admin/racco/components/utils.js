export const calculateMonthlyData = (data) => {
    const monthlyData = data.reduce((acc, record) => {
      if (record.ConnectionStatus__c === "RaccordOK") {
        const date = new Date(record.CreatedDate);
        const month = date.toLocaleString("default", { month: "short", year: "numeric" });
  
        if (acc.hasOwnProperty(month)) {
          acc[month]++;
        } else {
          acc[month] = 1;
        }
      }
      return acc;
    }, {});
  
    return Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }));
  };
  