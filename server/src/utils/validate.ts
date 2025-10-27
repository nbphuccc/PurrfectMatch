// server/src/utils/validate.ts
export function requireFields<T extends Record<string, any>>(body: T, fields: string[]) {
	for (const f of fields) {
	  const v = body[f];
	  if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
		return `${f} is required`;
	  }
	}
	return null;
  }
  
  // Accept readonly key arrays too, and return a typed Partial
  export function pickDefined<T extends Record<string, any>, K extends keyof T>(
	obj: T,
	keys: ReadonlyArray<K>
  ): Partial<Pick<T, K>> {
	const out: Partial<Pick<T, K>> = {};
	for (const k of keys) {
	  if (obj[k] !== undefined) out[k] = obj[k];
	}
	return out;
  }
  