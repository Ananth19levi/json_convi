import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')


//import { createApp } from 'vue';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

import JsonExcel from "vue-json-excel3";

const app = createApp({});
app.component("downloadExcel", JsonExcel);
