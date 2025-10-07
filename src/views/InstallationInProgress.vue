<template>
    <div class="d-flex justify-content-center align-items-center vh-100" style="background-color: #212121;">
      <div class="position-relative">
        <!-- Cercle animé (rotation) -->
        <div class="circle-load"></div>
        <!-- Image centrée avec effet de pulsation -->
        <img
          src="/favicon.ico"
          alt="Loading"
          class="position-absolute top-50 start-50 translate-middle"
          style="width: 3em; height: 3em; animation: pulse 2s infinite;"
        />
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "InstallationInProgress",
  };
  </script>
  
  <style>
  /* Style du cercle animé */
  .circle-load {
    box-shadow: 0 0 20px 5px #3ab250;
    border: 8px solid #d1d5db;
    border-top-color: #3ab250;
    width: 112px;
    height: 112px;
    border-radius: 50%;
    animation: spin 2s linear infinite;
  }
  
  /* Animation de rotation */
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  /* Animation de pulsation pour l'image */
  @keyframes pulse {
    0% {
      transform: translate(50%, -50%) scale(1);
      opacity: 1;
    }
    75%, 100% {
      transform: translate(50%, -50%) scale(2);
      opacity: 0;
    }
  }
  </style>
  