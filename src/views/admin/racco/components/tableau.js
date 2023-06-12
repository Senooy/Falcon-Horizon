import React, { Component } from 'react';

class Tableau extends Component {
constructor(props) {
super(props);
this.state = {
records: []
};
}

componentDidMount() {
fetch('SFR63466.json')
.then(response => response.json())
.then(data => this.setState({ records: data.records }));
}

render() {
const { records } = this.state;
return (
<table>
<thead>
<tr>
<th>Id</th>
<th>Nom</th>
<th>Date de création</th>
<th>Status</th>
</tr>
</thead>
<tbody>
{records.map(record => (
<tr key={record.Id}>
<td>{record.Id}</td>
<td>{record.Name}</td>
<td>{record.CreatedDate}</td>
<td>{record.Status__c}</td>
</tr>
))}
</tbody>
</table>
);
}
}

export default Tableau;