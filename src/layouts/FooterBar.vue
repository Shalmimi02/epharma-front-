<!-- FooterBar.vue -->
<template>
    <footer class="bg-dark text-white fixed-bottom">
      <div class="container-fluid d-flex justify-content-between align-items-center py-2">
        <span>&copy; {{ new Date().getFullYear() }} {{ appName }}</span>
        <span>Version {{ appVersion }}</span>
      </div>
    </footer>
  </template>
  
  <script>
  export default {
    name: 'FooterBar',
    data() {
      return {
        appName: '',   // Nom de l'application
        appVersion: '' // Version de l'application
      };
    },
    created() {
      // Charger les données depuis package.json
      const packageJson = require('../../package.json');
      this.appName = packageJson.name;
      this.appVersion = packageJson.version;
    }
  };
  </script>
  
  <style scoped>
  footer {
    border-top: 1px solid #e7e7e7;
  }
  </style>
  