<template>
    <v-app-bar color="primary" dark>
        <v-container class="d-flex justify-space-between align-center">
            <v-toolbar-title>PostgreSQL Procedures Tool</v-toolbar-title>
            <div class="d-flex align-center">
            <v-btn class="bg-error" variant="tonal">Logout</v-btn>
            </div>
        </v-container>
    </v-app-bar>
    <v-main>
        <v-container>
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <span>Database Tables</span>
                </v-card-title>
                <v-table>
                    <thead>
                        <tr>
                            <th>Table</th>
                            <th>Obtener</th>
                            <th>Obtener por ID</th>
                            <th>Insertar</th>
                            <th>Actualizar</th>
                            <th>Eliminar</th>
                            <th>Generar Todos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item,index) in data" :key="index">
                            <td>{{ item.tableName }}</td>
                        </tr>
                    </tbody>
                </v-table>
            </v-card>
        </v-container>
    </v-main>
</template>
<script setup>
import { ref, onMounted } from 'vue';
//const loading = ref(true);
//const fetchTables = async () => {}
//const logout = async () => {}
const data = ref([])

onMounted(async() => {
    const token = localStorage.getItem("token")
    const response = await fetch("http://localhost:3000/api/v1/pgServer/loadInfoTables", {
      method: "GET",
      headers: { "Content-Type": "application/json",
                "Authorization" : `Bearer ${token}`}
    })
    data.value = response.json()
})
</script>
