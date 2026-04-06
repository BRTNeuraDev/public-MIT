import type { ComponentType } from "react";

/** Available tool categories for filtering and display */
export type ToolCategory = "data" | "developer" | "business" | "telecom";

/** Metadata definition for a single tool in the registry */
export interface ToolDefinition {
  /** URL-safe slug used as the route parameter */
  slug: string;
  /** Human-readable tool name */
  name: string;
  /** Short description shown on the tool card */
  description: string;
  /** Category for filtering */
  category: ToolCategory;
  /** Lucide icon name */
  icon: string;
  /** Search keywords for matching user queries */
  keywords: string[];
  /** Lazy-loaded component for the tool UI */
  component: () => Promise<{ default: ComponentType }>;
  /** Whether the tool is visible to users */
  isPublished: boolean;
}
