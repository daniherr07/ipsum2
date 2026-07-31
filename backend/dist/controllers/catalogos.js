import { actualizarItemCatalogo, crearItemCatalogo, eliminarItemCatalogo, listarCatalogo, } from "../services/catalogos.js";
import { validarCrearItemCatalogo, validarTipoCatalogo } from "../validators/catalogos.js";
import { guardarEstado } from "../persistencia.js";
export function getCatalogo(req, res) {
    const tipo = validarTipoCatalogo(req.params.tipo);
    res.json({ success: true, data: listarCatalogo(tipo) });
}
export function postCatalogoItem(req, res) {
    const tipo = validarTipoCatalogo(req.params.tipo);
    const input = validarCrearItemCatalogo(req.body);
    const item = crearItemCatalogo(tipo, input.nombre);
    guardarEstado();
    res.status(201).json({ success: true, data: item });
}
export function putCatalogoItem(req, res) {
    const tipo = validarTipoCatalogo(req.params.tipo);
    const input = validarCrearItemCatalogo(req.body);
    const item = actualizarItemCatalogo(tipo, req.params.id, input.nombre);
    guardarEstado();
    res.json({ success: true, data: item });
}
export function deleteCatalogoItem(req, res) {
    const tipo = validarTipoCatalogo(req.params.tipo);
    eliminarItemCatalogo(tipo, req.params.id);
    guardarEstado();
    res.json({ success: true, data: {} });
}
