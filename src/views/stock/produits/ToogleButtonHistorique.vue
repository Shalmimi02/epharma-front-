<template>
  <div class="toggle-container">
     <!-- Titre à gauche qui change selon le mode -->
     <div class="toggle-title">
      {{ currentMode === 'vente' ? 'HISTORIQUE DES VENTES' : 'HISTORIQUE DES ACHATS' }}
    </div>
    <div class="tabs">
      <!-- Input radio pour "Vente" -->
      <input type="radio" id="radio-vente" name="tabs" value="vente"  @click="changeMode('vente')" />
      <label class="tab" for="radio-vente">Vente</label>

      <!-- Input radio pour "Achat" -->
      <input type="radio" id="radio-achat" name="tabs" value="achat" @click="changeMode('achat')" />
      <label class="tab" for="radio-achat">Achat</label>

      <!-- Élément glider pour l'animation -->
      <span class="glider"></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToggleSalesPurchases',
  data() {
    return {
      currentMode: 'vente'  // Mode par défaut
    };
  },
  methods: {
    changeMode(newVal) {
      this.$emit('setMode', newVal);
      this.currentMode= newVal;
    }
  }
};
</script>

<style scoped>
/* Conteneur principal : le titre est à gauche et les onglets à droite */
.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
  /* Si vous souhaitez positionner ce toggle en bas à droite de son parent,
     vous pouvez ajouter dans le parent : position: relative; et ici :
     position: absolute; bottom: 0; right: 0; */
}
/* Titre à gauche */
.toggle-title {
  font-size: 1.2rem;
  font-weight: bold;
  color: #185ee0;
}
/* Zone de toggle (à droite) */
.tabs {
  display: flex;
  position: relative;
  background-color: #fff;
  box-shadow: 0 0 1px 0 rgba(24,94,224,0.15), 0 6px 12px 0 rgba(24,94,224,0.15);
  padding: 0.75rem;
  border-radius: 99px;
}

/* Masquer les inputs radio */
.tabs input[type="radio"] {
  display: none;
}

/* Style des labels qui servent d'onglets */
.tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  width: 100px; /* Ajustez la largeur selon vos besoins */
  font-size: 0.8rem;
  color: black;
  font-weight: 500;
  border-radius: 99px;
  cursor: pointer;
  transition: color 0.15s ease-in;
  z-index: 2;
}
label {
    margin-bottom: 0 !important;
}

/* Changement de couleur sur sélection */
.tabs input[type="radio"]:checked + .tab {
  color: #185ee0;
}

/* Élément glider qui se déplace en arrière-plan */
.glider {
  position: absolute;
  display: flex;
  height: 30px;
  width: 100px; /* Doit correspondre à la largeur des onglets */
  background-color: #e6eef9;
  z-index: 1;
  border-radius: 99px;
  transition: transform 0.25s ease-out;
}

/* Positionnement du glider pour "Vente" */
.tabs input[id="radio-vente"]:checked ~ .glider {
  transform: translateX(0);
}

/* Positionnement du glider pour "Achat" */
.tabs input[id="radio-achat"]:checked ~ .glider {
  transform: translateX(100%);
}

@media (max-width: 700px) {
  .tabs {
    transform: scale(0.6);
  }
}
</style>
