<template>
  <div class="excel-to-json">
    <h1>Excel to JSON Converter</h1>
    <div class="container">
      <!-- Side Menu -->
      <div class="side-menu">
        <label class="file-upload">
          Choose file
          <input type="file" @change="handleFileUpload" />
        </label>
        <button @click="viewData" :disabled="!jsonData.length">View</button>
        <button @click="toggleEdit" :disabled="!jsonData.length || isEditing">Edit</button>
        <button @click="currentView = 'add'; isEditing = false" :disabled="!jsonData.length || isEditing">Add Row</button>
        <button @click="exportToExcel" :disabled="!jsonData.length">Export to Excel</button>
        <button @click="exportToPDF" :disabled="!jsonData.length">Export to PDF</button>
      </div>

      <div class="main-content">
        <!-- Display JSON Data -->
        <div v-if="jsonData.length">
          <input type="text" v-model="searchQuery" placeholder="Search..." />
          <div v-if="filteredData && filteredData.length">
            <div v-for="(row, rowIndex) in filteredData.slice(1)" :key="rowIndex" class="accordion-item">
              <div class="accordion-header" @click="toggleAccordion(rowIndex)">
                Row {{ rowIndex + 1 }}
                <button class="accordion-toggle">
                  {{ expandedIndex === rowIndex ? '-' : '+' }}
                </button>
              </div>
              <transition name="accordion">
                <div v-if="expandedIndex === rowIndex" class="accordion-content">
                  <table>
                    <tr v-for="(cell, cellIndex) in row" :key="cellIndex">
                      <th>{{ filteredData[0][cellIndex] }}</th>
                      <td>
                        <!-- Editable input -->
                        <input v-model="row[cellIndex]" :readonly="!isEditing" @input="updateCell(rowIndex, cellIndex)" />
                      </td>
                    </tr>
                  </table>
                </div>
              </transition>
            </div>
          </div>
        </div>

        <!-- Add Row -->
        <div v-if="currentView === 'add' && jsonData.length">
          <h2>Add New Row</h2>
          <div v-for="(cell, cellIndex) in filteredData[0]" :key="cellIndex">
            <input v-model="newRow[cellIndex]" placeholder="Enter value" />
          </div>
          <button @click="addNewRow">Add Row</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
  data() {
    return {
      jsonData: [], 
      expandedIndex: null,
      searchQuery: '',
      newRow: [], 
      currentView: 'view', 
      isEditing: false, 
    };
  },
  computed: {
    filteredData() {
      if (!this.searchQuery) return this.jsonData;
      const lowerCaseQuery = this.searchQuery.toLowerCase();
      return this.jsonData.filter(row =>
        row.some(cell =>
          cell.toString().toLowerCase().split(' ').some(word => word.includes(lowerCaseQuery))
        )
      );
    },
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          this.jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          this.newRow = Array(this.jsonData[0].length).fill(''); 
        };
        reader.readAsArrayBuffer(file);
      }
    },
    toggleAccordion(index) {
      this.expandedIndex = this.expandedIndex === index ? null : index;
    },
    viewData() {
      this.isEditing = false;
      this.currentView = 'view';
    },
    toggleEdit() {
      this.isEditing = !this.isEditing;
      this.currentView = 'view';
    },
    updateCell(rowIndex, cellIndex) {
      
    },
    addNewRow() {
      
      if (this.newRow.length === this.filteredData[0].length) {
        this.jsonData.push([...this.newRow]); 
        this.newRow = Array(this.jsonData[0].length).fill(''); 
      } else {
        
      }
    },
    exportToExcel() {
      const ws = XLSX.utils.aoa_to_sheet(this.jsonData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      XLSX.writeFile(wb, 'exported_data.xlsx');
    },
    exportToPDF() {
      const doc = new jsPDF();
      doc.autoTable({
        head: [this.jsonData[0]],
        body: this.jsonData.slice(1),
      });
      doc.save('exported_data.pdf');
    },
  },
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f7f9fc;
  color: #333;
}

h1 {
  text-align: center;
  margin-top: 20px;
  color: #2c3e50;
  font-size: 2em;
}

.container {
  display: flex;
  margin-top: 20px;
  padding: 20px;
}

.side-menu {
  width: 200px;
  background-color: #3498db;
  padding: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-right: 20px;
}

.side-menu button,
.side-menu input[type="file"] {
  display: block;
  width: 90%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #2980b9;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.file-upload {
  display: block;
  width: 90%;
  padding: 10px;
  margin-bottom: 10px;
  background-color: #2980b9;
  color: #fff;
  border: none;
  border-radius: 5px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
}

.file-upload input[type="file"] {
  opacity: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.side-menu button:disabled,
.side-menu input[type="file"]:disabled {
  background-color: #95a5a6;
}

.side-menu button:hover:not(:disabled),
.side-menu input[type="file"]:hover:not(:disabled) {
  background-color: #1abc9c;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #ecf0f1;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

input[type="text"] {
  display: block;
  margin: 20px 0;
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.accordion-item {
  border: 1px solid #ddd;
  margin: 10px 0;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  background-color: #fff;
  transition: background-color 0.3s ease;
}

.accordion-item:hover {
  background-color: #f1f1f1; /* Change to desired hover color */
}

.accordion-header {
  background-color: #2980b9;
  color: #fff;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.accordion-toggle {
  background: none;
  border: none;
  font-size: 18px;
  color: white;
  transition: transform 0.3s ease;
}

.accordion-toggle:focus {
  outline: none;
}

.accordion-content {
  padding: 15px;
  background-color: #f1f1f1;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

.accordion-item table tr:hover {
  background-color: #f1f1f1; /* Change to desired hover color */
}

button {
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

button:disabled {
  background-color: #95a5a6;
}

button:hover:not(:disabled) {
  background-color: #1abc9c;
}
</style>

