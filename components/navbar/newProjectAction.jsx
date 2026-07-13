"use server";

import { redirect } from "next/navigation";

// newProjectAction representa la server action de alta de proyecto y actualmente solo realiza redirección.
export async function newProjectAction(formData) {
  /*const projectName = formData.get("projectName");

  const endpoint = process.env.BACKEND_URL + "/new";

  const projectData = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectName: projectName }),
  });

  if (projectData.ok) {
    const {projectId} = await projectData.json()
    console.log(projectId)
    redirect(`/protected/edit/${projectId}`)
  }*/

  // Redirige al dashboard como fallback temporal mientras la creación real en backend está comentada.
  redirect('/dashboard')
}
