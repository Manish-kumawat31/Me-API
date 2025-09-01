// frontend/src/ProfilePage.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

// --- Reusable UI Components with Tailwind CSS ---

// A modern, pill-shaped button for skills and filters
const SkillButton = ({ onClick, isActive, children }) => {
  const baseClasses = "px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105";
  const activeClasses = "bg-sky-500 text-white shadow-lg";
  const inactiveClasses = "bg-slate-700 text-slate-300 hover:bg-slate-600";
  
  return (
    <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </button>
  );
};

// A card-style component to display project details
const ProjectCard = ({ project }) => (
  <li className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 backdrop-blur-sm transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-800">
    <h4 className="text-xl font-bold text-slate-100">{project.title}</h4>
    <p className="text-slate-400 mt-2">{project.description}</p>
    {project.skills?.length > 0 && (
      <div className="mt-4 flex flex-wrap gap-2">
        {project.skills.map(skill => (
          <span key={skill} className="px-2.5 py-0.5 text-xs font-medium text-sky-300 bg-sky-500/10 rounded-full">
            {skill}
          </span>
        ))}
      </div>
    )}
  </li>
);


// --- Main Profile Page Component ---

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [filter, setFilter] = useState(null);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/profile`)
      .then(response => setProfile(response.data))
      .catch(err => {
        console.error("Failed to fetch profile:", err);
        setError("Could not load profile data. Please try again later.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const doSearch = () => {
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }
    axios.get(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then(response => setSearchResult(response.data))
      .catch(err => {
        console.error("Search failed:", err);
        setError("Search failed. Please try again.");
      });
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      doSearch();
    }
  };
  
  const filteredProjects = profile
    ? filter
      ? profile.projects.filter(p => (p.skills || []).map(s => s.toLowerCase()).includes(filter.toLowerCase()))
      : profile.projects
    : [];

  // Loading and Error States
  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white text-xl">Loading profile...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-red-400 text-xl">{error}</div>;
  if (!profile) return <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white text-xl">No profile data found.</div>;

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <main className="max-w-4xl mx-auto">
        
        {/* --- Header Section --- */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">{profile.name}</h1>
            <p className="mt-2 text-lg text-slate-400">{profile.email}</p>
            <div className="mt-4 flex items-center gap-x-4">
              <a href={profile.links.github} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">GitHub</a>
              <span className="text-slate-600">|</span>
              <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">LinkedIn</a>
            </div>
          </div>
          <a href={`${API_BASE}/health`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 text-sm border border-slate-600 rounded-md text-slate-400 hover:text-white hover:border-slate-400 transition-colors">
            API Health
          </a>
        </header>

        {/* --- Skills Section --- */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">Skills</h3>
          <div className="flex flex-wrap gap-3">
            <SkillButton onClick={() => setFilter(null)} isActive={filter === null}>
              All
            </SkillButton>
            {profile.skills.map(skill => (
              <SkillButton key={skill} onClick={() => setFilter(skill)} isActive={filter === skill}>
                {skill}
              </SkillButton>
            ))}
          </div>
        </section>

        {/* --- Projects Section --- */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-4">
            Projects {filter && <span className="text-lg text-slate-400 font-normal ml-2">(filtered by {filter})</span>}
          </h3>
          {filteredProjects.length > 0 ? (
            <ul className="space-y-6">
              {filteredProjects.map(p => (
                <ProjectCard key={p.title} project={p} />
              ))}
            </ul>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center text-slate-400">
              <p>No projects match the selected filter.</p>
            </div>
          )}
        </section>
        
        {/* --- Search Section --- */}
        <section>
          <h3 className="text-2xl font-bold text-white mb-4">Search</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects, skills, work..."
              className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
            />
            <button
              onClick={doSearch}
              className="bg-green-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
              disabled={!query.trim()}
            >
              Search
            </button>
          </div>

          {searchResult && (
            <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-lg p-5">
              <h4 className="text-xl font-bold text-white">Search Results</h4>
              {searchResult.projects?.length > 0 ? (
                 <ul className="space-y-6 mt-4">
                    {searchResult.projects.map(p => (
                      <ProjectCard key={p.title} project={p} />
                    ))}
                  </ul>
              ) : (
                <p className="mt-4 text-slate-400">No projects found matching your query.</p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}