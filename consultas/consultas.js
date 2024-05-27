const pool = require("../config/db_config.js");
const manejoErrores = require('../errores/manejoErrores');

// Función para obtener todos los skaters
const getSkaters = async () => {
    const consulta = {
        text: "SELECT * FROM skaters",
        values: []
    }
    try {
        const result = await pool.query(consulta);
        return result.rows;
    } catch (error) {
        console.log("Error en consultas getSkaters: " + error);
    }

};

// Función para registrar un skater
const registrarSkater = async (email, nombre, password, anos_experiencia, especialidad, foto) => {
    try {
        const consulta = {
            text: "INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) VALUES ($1, $2, $3, $4, $5, $6, false) RETURNING *",
            values: [email, nombre, password, anos_experiencia, especialidad, foto]
        };
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log("Error en consultas registrarSkater: " + error);
    }
}


// Función para actualizar permisos de un skater
const statusSkater = async (id, estado) => {
    try {
        const consulta = {
            text: `UPDATE skaters SET estado = $1 WHERE id = $2`,
            values: [estado, id]
        };
        const result = await pool.query(consulta);
        return result.rowCount;
    } catch (error) {
        console.log("Error en consultas statusSkater: " + error);
    }
}

// Función para actualizar datos de un skater
const updateSkater = async (email, nombre, password, anos_experiencia, especialidad) => {
    const consulta = {
        text:'UPDATE skaters SET nombre = $2, password = $3, anos_experiencia = $4, especialidad = $5 WHERE email = $1',
        values:[email, nombre, password, anos_experiencia, especialidad]
    }
    try {
        const result = await pool.query(consulta);
        return result.rowCount;
    } catch (error) {
        console.log("Error en consultas updateSkater: " + error);
    }
};

// Función para eliminar un skater
const deleteSkater = async (id) => {
    try {
        const consulta = {
            text: `DELETE FROM skaters WHERE id = $1`,
            values: [id]
        };
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log("Error en consultas deleteSkater: " + error);
    }
}

// Buscar información de un skaters por email y password
const consultarSkater = async (email, password) => {
    const consulta = {
        text:'SELECT id, email, nombre, password, anos_experiencia, especialidad, foto, estado FROM skaters WHERE email=$1 AND password=$2',
        values:[email, password]
    }
    try {
        const result = await pool.query(consulta);
        return result.rows[0];
    } catch (error) {
        console.log("Error en consultas consultarSkater: " + error);
    }
};

module.exports = { getSkaters, registrarSkater, statusSkater, deleteSkater, consultarSkater, updateSkater };