import { CategoryManagementClient } from "./CategoryManagementClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoryManagementPage() {
  return <CategoryManagementClient />;
}
