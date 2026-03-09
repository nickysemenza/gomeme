import { createFileRoute } from "@tanstack/react-router";
import MemeEditor from "~/components/MemeEditor";

export const Route = createFileRoute("/editor")({
  component: MemeEditor,
});
