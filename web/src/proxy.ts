import { NextResponse, type NextRequest } from "next/server";
import { findProject } from "@/content/projects";

// Unknown project URLs get the site's 404 page with a real 404 status. The case-study
// route is partially prerendered, so by the time the page itself calls notFound() the
// response has already started with status 200. Any path with no page gives a 404.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2];
  if (findProject(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/project-not-found", request.url));
}

export const config = { matcher: "/projects/:slug" };
