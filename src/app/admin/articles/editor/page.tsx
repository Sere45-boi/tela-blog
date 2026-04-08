import ArticleEditor from "./EditorClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Article Editor",
};

export default function ArticleEditorPage() {
  return <ArticleEditor />;
}
