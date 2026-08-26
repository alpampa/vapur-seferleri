export function NearbyRoutes() {
  const routes = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1549429780-87777169123b?q=80&w=400&h=200&fit=crop",
      title: "San Francisco",
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1579243750849-0fa4b1bdf624?q=80&w=400&h=200&fit=crop",
      title: "Alcatraz Island",
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?q=80&w=400&h=200&fit=crop",
      title: "Bainbridge",
    }
  ];

  return (
    <div className="mt-4 mb-24">
      <h2 className="px-5 font-bold text-lg text-[var(--text-primary)] mb-3">Nearby Routes</h2>
      <div className="flex overflow-x-auto gap-4 px-5 pb-4 hide-scrollbar">
        {routes.map((route) => (
          <div key={route.id} className="relative shrink-0 w-[140px] h-[90px] rounded-xl overflow-hidden group">
            <img 
              src={route.image} 
              alt={route.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute bottom-2 left-2 text-white text-[11px] font-medium leading-tight">
              {route.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
