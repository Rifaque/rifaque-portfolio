import { useParams } from "react-router";
import { projectBySlug, projects } from "../content/projects";
import NotFound from "./NotFound";
import { spaceBySlug } from "../space/data";
import { SpaceCaseStudy } from "../space/SpaceCaseStudy";
import { StudyPage } from "./StudyPage";

/**
 * /work/:slug. The six featured projects use the Project Space case-study
 * layout; QueryCraft and BlueTap (Also built) use the study layout with their
 * 3D illustration.
 */
export default function WorkPage() {
  const { slug = "" } = useParams();
  const p = projectBySlug(slug);
  if (!p) return <NotFound />;
  const sp = spaceBySlug(slug);
  if (sp) return <SpaceCaseStudy sp={sp} />;
  return <StudyPage p={p} others={projects} />;
}
