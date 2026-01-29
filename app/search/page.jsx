import SearchFiltersMobile from "./SearchFiltersMobile";

const endpoint = process.env.BACKEND_URL + "/allProjects";

export default async function Search() {
  const response = await fetch(endpoint);
  const projects = await response.json()
  

  return (
    <div className="w-full h-full">
      <SearchFiltersMobile projects={projects} />
    </div>
  );
}
