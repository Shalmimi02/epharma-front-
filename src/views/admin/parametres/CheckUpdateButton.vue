<template>
    <div class="d-flex">
      <button 
        class="bg-bleu2 text-white border border-bleu2"
        @click="handleUpdateCheck"
      >
        Vérifier la dernière mise à jour
      </button>
    </div>
    </template>
    
    <script>
    import { emitter  } from  '@/event-bus.js'
    export default {
      methods: {
        handleUpdateCheck() {
          // Émet un événement pour déclencher la vérification
          emitter.emit('check-maj-update'); // Émission via le bus d'événements
        }
      }
    }
    </script>

    <style scoped>
    .bg-bleu2 {
        background-color: #2a3963 !important;
        &:hover {
            background-color: #1e2a4d !important;
        }
    }
</style>