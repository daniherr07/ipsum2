import { generateId } from "./idGenerator";

export function createMovementFromForm(formData) {
  const type = String(formData.get("type") || "").trim();

  const baseMovement = {
    id: generateId(),
    type,
    amount: Number(formData.get("amount")),
    description: String(formData.get("description") || "").trim(),
    date: formData.get("date")
      ? String(formData.get("date"))
      : new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (type === "PROJECT_EXPENSE") {
    return {
      ...baseMovement,
      projectId: String(formData.get("projectId") || "").trim(),
      categoryId: String(formData.get("categoryId") || "").trim(),
      purchaseOrderId:
        String(formData.get("purchaseOrderId") || "").trim() || null,
      concept: null,
    };
  }

  if (type === "PROJECT_INCOME") {
    return {
      ...baseMovement,
      projectId: String(formData.get("projectId") || "").trim(),
      categoryId: null,
      purchaseOrderId: null,
      concept: String(formData.get("concept") || "").trim(),
    };
  }

  return baseMovement;
}