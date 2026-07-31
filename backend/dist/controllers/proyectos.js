import { crearProyecto, listarProyectos, obtenerProyecto } from "../services/proyectos.js";
import { validarCrearProyecto } from "../validators/proyectos.js";
import { guardarEstado } from "../persistencia.js";
export function postProyecto(req, res) {
    const input = validarCrearProyecto(req.body);
    const proyecto = crearProyecto(input);
    guardarEstado();
    res.status(201).json({ success: true, data: proyecto });
}
export function getProyectos(req, res) {
    res.json({ success: true, data: listarProyectos() });
}
export function getProyecto(req, res) {
    const proyecto = obtenerProyecto(req.params.id);
    res.json({ success: true, data: proyecto });
}
