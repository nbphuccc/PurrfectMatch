// server/src/utils/validate.ts
export function requireFields(body, fields) {
    for (const f of fields) {
        const v = body[f];
        if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
            return `${f} is required`;
        }
    }
    return null;
}
// Accept readonly key arrays too, and return a typed Partial
export function pickDefined(obj, keys) {
    const out = {};
    for (const k of keys) {
        if (obj[k] !== undefined)
            out[k] = obj[k];
    }
    return out;
}
//# sourceMappingURL=validate.js.map