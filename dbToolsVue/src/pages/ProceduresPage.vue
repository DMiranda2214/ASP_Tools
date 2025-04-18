<template>
  <v-container fluid class="app-container">
    <!-- Navbar -->
    <v-app-bar color="primary" density="compact">
      <v-toolbar-title class="text-h6 font-weight-bold">ASP Tools</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="logout" color="white" variant="text">Cerrar Sesión</v-btn>
    </v-app-bar>

    <!-- Espaciado después del Navbar -->
    <v-container class="spacer"></v-container>

    <!-- Contenido Principal -->
    <v-container class="content-container">
      <!-- Descripción -->
      <v-card class="info-card" elevation="2">
        <v-card-title class="text-h5">Generador de Procedimientos Almacenados</v-card-title>
        <v-spacer></v-spacer>
        <v-card-text class="text-body-1">
          Este módulo permite generar automáticamente los procedimientos almacenados para manipular datos en tu base de datos PostgreSQL.
          Selecciona la tabla y el tipo de procedimiento que deseas generar.
        </v-card-text>
      </v-card>

      <!-- Tabla -->
      <v-table class="mt-6">
        <thead>
          <tr>
            <th class="text-left"><strong>Nombre</strong></th>
            <th class="text-center" colspan="5"><strong>Procedimientos Almacenados</strong></th>
            <th class="text-center"><strong>Generar Todos</strong></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="procedure in procedures" :key="procedure.tableName">
            <td>{{ procedure.tableName }}</td>
            <td class="text-center">
              <v-btn 
                color="blue" 
                variant="tonal" 
                :disabled="getProcedureState(procedure, 'obtenertodos')"
                @click="generateProcedure(procedure.tableName, 'obtenertodos')"
              >
                GET
              </v-btn>
            </td>
            <td class="text-center">
              <v-btn 
                color="blue-darken-2" 
                variant="tonal" 
                :disabled="getProcedureState(procedure, 'obtenerid')"
                @click="generateProcedure(procedure.tableName, 'obtenerid')"
              >
                GET BY ID
              </v-btn>
            </td>
            <td class="text-center">
              <v-btn 
                color="green" 
                variant="tonal" 
                :disabled="getProcedureState(procedure, 'crear')"
                @click="generateProcedure(procedure.tableName, 'crear')"
              >
                CREATE
              </v-btn>
            </td>
            <td class="text-center">
              <v-btn 
                color="orange" 
                variant="tonal" 
                :disabled="getProcedureState(procedure, 'actualizar')"
                @click="generateProcedure(procedure.tableName, 'actualizar')"
              >
                UPDATE
              </v-btn>
            </td>
            <td class="text-center">
              <v-btn 
                color="red" 
                variant="tonal" 
                :disabled="getProcedureState(procedure, 'eliminar')"
                @click="generateProcedure(procedure.tableName, 'eliminar')"
              >
                DELETE
              </v-btn>
            </td>
            <td class="text-center">
              <v-btn 
                color="purple" 
                variant="tonal" 
                :disabled="allProceduresState(procedure)"
                @click="generateAllProcedures(procedure.tableName)"
              >
                GENERATE ALL
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-container>
  </v-container>
</template>
<script setup>
  import { ref, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import Swal from 'sweetalert2'
  const router = useRouter();

  const procedures = ref([]);

  const getProcedureState = (procedure, type) => {
    const proc = procedure.procedureStatus.find(p => p.name === type);
    return proc ? proc.state : false;
  }

  const allProceduresState = (procedure) => {
    return !procedure.procedureStatus.every(proc => proc.state == false);
  }

  const stateProcedure = async () => {
    const token = sessionStorage.getItem('sessionToken')?.replace(/"/g, '')
    const response = await fetch(
      "http://localhost:3080/api/v1/pgServer/loadInfoTables",
      { 
        method: "GET",
        headers: { 
        "Authorization": `Bearer ${token}`}
      }
    );
    procedures.value = await response.json();
    procedures.value = procedures.value.map(procedure => ({
      tableName: procedure.tableName,
      procedureStatus: procedure.procedureStatus.map(proc => ({
        name: proc.name,
        state: proc.state
      }))
    }))       
  }

  const generateProcedure = async (tableName, type) => {
    try {
      const token = sessionStorage.getItem('sessionToken')?.replace(/"/g, '');
      let response = null;
      let data = {
              method: "POST",
              body: JSON.stringify({tableName}),
              headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }};
      switch (type){
        case 'obtenertodos':
          response = await fetch(
            `http://localhost:3080/api/v1/pgServer/createProcedureGetAll`,{
              method: "POST",
              body: JSON.stringify({tableName}),
              headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }}
          );
          if (!response.ok) {
            throw new Error("Error generando el procedimiento");
          }
          await successAlert();
        break;
        case 'obtenerid':
          response = await fetch(
            `http://localhost:3080/api/v1/pgServer/createProcedureGetXId`,
            data
          );
          if (!response.ok) {
            throw new Error("Error generando el procedimiento");
          }
          await successAlert();
        break;
        case 'crear':
          response = await fetch(
            `http://localhost:3080/api/v1/pgServer/createProcedureInsert`,
            data
          );
          if (!response.ok) {
            throw new Error("Error generando el procedimiento");
          }
          await successAlert();
        break;
        case 'actualizar':
          response = await fetch(
            `http://localhost:3080/api/v1/pgServer/createProcedureUpdate`,
            data
          );
          if (!response.ok) {
            throw new Error("Error generando el procedimiento");
          }
          await successAlert();
        break;
        case 'eliminar':
          response = await fetch(
            `http://localhost:3080/api/v1/pgServer/createProcedureDelete`,
            data
          );
          if (!response.ok) {
            throw new Error("Error generando el procedimiento");
          }
          await successAlert();
        break;
      }
    } catch (error) {
      errorAlert(error)
    }
  };


  const generateAllProcedures = async (tableName) => {
    try {
      const token = sessionStorage.getItem('sessionToken')?.replace(/"/g, '');
      const response = await fetch(
        `http://localhost:3080/api/v1/pgServer/createAllProcedures`,{
          method: "POST",
          body: JSON.stringify({tableName}),
          headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }}
      );
      if (!response.ok) {
        throw new Error("Error generando procedimientos");
      }
      await successAlert();
    } catch (error) {
      errorAlert(error)
    }
  };

  const logout = () => {
    sessionStorage.clear()
    Swal.fire({
        icon: 'success',
        text: 'Conexion finalizada',
        timer: 1500,
        showConfirmButton: false
    }).then(() => {
        router.push('/')
    })
  }

  const successAlert = async () => {
      Swal.fire({
          icon: 'success',
          text: 'Procedimiento generado exitosamente',
          timer: 1500,
          showConfirmButton: false
      })
      await stateProcedure();
  }

  const errorAlert = (error) => {
      Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error
      })
  }

  onMounted(async() => {   
    try {
        await stateProcedure();
    } catch (error) {
      router.push("/");
      console.error("Error obteniendo procedimientos:", error);
    }
  });
</script>
<style scoped>
  .app-container {
    background: #f4f7fc;
    min-height: 100vh;
  }

  .spacer {
    height: 20px; /* Espaciado entre el Navbar y el contenido */
  }

  .content-container {
    width: 80%;
    max-width: 1400px;
    margin: auto;
    padding: 20px;
  }

  .info-card {
    background: white;
    padding: 20px;
    border-radius: 10px;
  }
</style>
