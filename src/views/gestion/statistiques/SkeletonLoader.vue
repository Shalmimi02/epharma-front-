<template>
  <div class="skeleton-table">
    <!-- En-tête du tableau -->
    <div class="skeleton-header-row">
      <div class="skeleton-header-cell"></div>
      <div class="skeleton-header-cell"></div>
    </div>

    <!-- Lignes du tableau -->
    <div class="skeleton-row" v-for="n in 10" :key="n">
      <div class="skeleton-cell"></div>
      <div class="skeleton-cell"></div>
    </div>
  </div>
</template>

<style scoped>
/* Structure générale du skeleton loader */
.skeleton-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  width: 100%;
}

/* En-tête du skeleton (simulant les colonnes) */
.skeleton-header-row {
  display: flex;
  background-color: #e0e0e0;
  padding: 12px;
  font-weight: bold;
}

/* Cellules de l'en-tête */
.skeleton-header-cell {
  height: 20px;
  width: 50%;
  background-color: #d6d6d6;
  border-radius: 4px;
  margin-right: 12px;
}

/* Lignes du skeleton */
.skeleton-row {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

/* Cellules des lignes du skeleton */
.skeleton-cell {
  height: 18px;
  width: 50%;
  background-color: #e0e0e0;
  border-radius: 4px;
  margin-right: 12px;
}
</style>
