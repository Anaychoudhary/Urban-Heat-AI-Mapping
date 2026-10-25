const API_BASE_URL = "http://localhost:8080";

export interface Hotspot {
  id: number;
  locationName: string;
  latitude: number;
  longitude: number;
  vulnerabilityScore: number;
  landSurfaceTemp: number;
}

export interface Scenario {
  id?: number;
  scenarioName?: string;
  totalAllocatedCost: number;
  predictedCoolingBenefit: number;
  estimatedCo2Impact: number;
  allocationsJson: unknown;
  createdAt?: string;
}

export interface OptimizationRequest {
  wardId: number;
  budget: number;
  scenarioName?: string;
}

export interface FieldConstraintRequest {
  hotspotId: number;
  category: string;
  notes?: string;
  photoUrl?: string;
  currentBudget: number;
}

function createQueryString(
  params: Record<string, string | number | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  return query.toString();
}

async function requestJson<T>(
  path: string,
  options: { method?: "GET" | "POST"; signal?: AbortSignal } = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: { Accept: "application/json" },
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Unable to reach the backend. Check that it is running on localhost:8080 and that its CORS policy allows this frontend.",
      );
    }
    throw error;
  }

  const responseText = await response.text();
  if (!response.ok) {
    let detail = responseText || response.statusText;
    try {
      const errorBody: unknown = JSON.parse(responseText);
      if (
        typeof errorBody === "object" &&
        errorBody !== null &&
        "message" in errorBody &&
        typeof errorBody.message === "string"
      ) {
        detail = errorBody.message;
      }
    } catch {
      // Keep the response text when the backend does not return JSON.
    }
    throw new Error(`Backend request failed (${response.status}): ${detail}`);
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error("The backend returned an invalid JSON response.");
  }
}

export function getHotspots(wardId: number, signal?: AbortSignal) {
  return requestJson<Hotspot[]>(
    `/api/field/hotspots/${encodeURIComponent(wardId)}`,
    { signal },
  );
}

export function runOptimization({
  wardId,
  budget,
  scenarioName,
}: OptimizationRequest) {
  const query = createQueryString({ wardId, budget, scenarioName });
  return requestJson<Scenario>(`/api/optimization/run?${query}`, {
    method: "POST",
  });
}

export function getScenarioHistory(wardId: number, signal?: AbortSignal) {
  return requestJson<Scenario[]>(
    `/api/optimization/scenarios/${encodeURIComponent(wardId)}`,
    { signal },
  );
}

export function reportFieldConstraint({
  hotspotId,
  category,
  notes,
  photoUrl,
  currentBudget,
}: FieldConstraintRequest) {
  const query = createQueryString({
    hotspotId,
    category,
    notes: notes?.trim() || undefined,
    photoUrl,
    currentBudget,
  });
  return requestJson<Scenario>(`/api/field/constraint?${query}`, {
    method: "POST",
  });
}
