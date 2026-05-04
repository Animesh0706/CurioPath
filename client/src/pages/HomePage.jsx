import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-xl mb-xl relative rounded-xl overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-lg">
          <h1 className="font-display-xl text-display-xl mb-md text-on-surface">Navigate Your <span className="text-primary">Curiosity</span></h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">Discover structured learning paths designed for the modern professional. Deep dive into technical subjects with our curated, high-performance curriculum.</p>
          <div className="flex justify-center gap-sm">
            <Link to="/paths" className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-dim transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center gap-xs">
              Start Exploring
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter pb-xl">
        {/* Main Featured Path */}
        <div className="md:col-span-2 glass-panel rounded-xl p-lg relative group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(208,188,255,0.1)]">
          <div className="absolute top-lg right-lg">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container/20 text-tertiary">New</span>
          </div>
          <div className="flex items-center gap-sm mb-md text-primary">
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>terminal</span>
          </div>
          <h2 className="font-headline-lg text-headline-lg mb-sm text-on-surface">Advanced System Design</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-xl">Master the architecture of scalable applications. Learn about microservices, load balancing, and distributed databases through interactive simulations.</p>
          <div className="flex items-center justify-between mt-auto pt-md border-t border-white/10">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-outline">schedule</span>
              <span className="font-label-sm text-label-sm text-outline-variant">12 Modules • 48 Hours</span>
            </div>
            <Link to="/paths" className="text-primary hover:text-primary-fixed-dim font-label-md text-label-md flex items-center gap-xs transition-colors">
              View Path <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Secondary Path 1 */}
        <div className="glass-panel rounded-xl p-lg flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(208,188,255,0.1)]">
          <div className="flex items-center gap-sm mb-md text-secondary">
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>database</span>
          </div>
          <h3 className="font-headline-md text-headline-md mb-xs text-on-surface">Data Engineering Fundamentals</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">Pipelines, ETL processes, and modern data warehouse concepts.</p>
          <div className="flex items-center gap-sm mt-auto pt-md border-t border-white/10">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: "16px" }}>signal_cellular_alt</span>
            <span className="font-label-sm text-label-sm text-outline-variant">Intermediate</span>
          </div>
        </div>

        {/* Secondary Path 2 */}
        <div className="glass-panel rounded-xl p-lg flex flex-col group hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_0_20px_rgba(208,188,255,0.1)]">
          <div className="flex items-center gap-sm mb-md text-error">
            <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>security</span>
          </div>
          <h3 className="font-headline-md text-headline-md mb-xs text-on-surface">Cloud Security Architecture</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">Protecting infrastructure, identity management, and compliance frameworks.</p>
          <div className="flex items-center gap-sm mt-auto pt-md border-t border-white/10">
            <span className="material-symbols-outlined text-outline" style={{ fontSize: "16px" }}>signal_cellular_alt</span>
            <span className="font-label-sm text-label-sm text-outline-variant">Advanced</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
