import initialMovements from "@/data/movements.json";

const STORAGE_KEY = "ipsum_movements";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getMovements() {
  if (!isBrowser()) {
    return initialMovements;
  }

  const storedMovements = localStorage.getItem(STORAGE_KEY);

  if (!storedMovements) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialMovements)
    );

    return initialMovements;
  }

  try {
    const movements = JSON.parse(storedMovements);

    return Array.isArray(movements) ? movements : [];
  } catch (error) {
    console.error("No se pudieron leer los movimientos:", error);
    return [];
  }
}

export function saveMovements(movements) {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(movements)
  );
}

export function createMovement(movement) {
  const movements = getMovements();

  const updatedMovements = [
    ...movements,
    movement,
  ];

  saveMovements(updatedMovements);

  return movement;
}

export function getMovementById(id) {
  const movements = getMovements();

  return (
    movements.find(
      (movement) => movement.id === id
    ) || null
  );
}

export function deleteMovement(id) {
  const movements = getMovements();

  const updatedMovements = movements.filter(
    (movement) => movement.id !== id
  );

  saveMovements(updatedMovements);

  return updatedMovements;
}

export function clearMovements() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}