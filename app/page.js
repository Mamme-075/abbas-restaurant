export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-orange-100">
      {/* BOUTIQUE NAVIGATION */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center p-8 bg-white">
        <div className="flex items-center gap-4">
          <img src="/logo.jpg" alt="Abbas Logo" className="h-16 w-auto" />
          <h1 className="text-2xl font-bold tracking-tighter">ABBAS RESTAURANTS</h1>
        </div>

        <div className="flex items-center gap-8">
          <ul className="hidden lg:flex gap-8 text-sm font-medium tracking-widest uppercase">
            <li className="hover:text-orange-600 cursor-pointer transition-colors">Our Story</li>
            <li className="hover:text-orange-600 cursor-pointer transition-colors">Menu</li>
            <li className="hover:text-orange-600 cursor-pointer transition-colors">Contact</li>
          </ul>
          <a href="#" className="p-2 border border-black rounded-full hover:bg-black hover:text-white transition-all">
            <img src="/abbs.png" alt="Social" className="h-6 w-6 invert-0" />
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-orange-600 font-bold tracking-widest uppercase text-sm">Authentic Saudi Taste</span>
          <h2 className="text-6xl font-black mt-4 leading-tight">Tradition in <br/> Every Bite.</h2>
          <p className="text-gray-500 mt-6 text-lg max-w-md">
            From the heart of the kitchen to your table. Experience the best Masoub and Shawarma in town.
          </p>
          <button className="mt-10 bg-black text-white px-10 py-4 font-bold rounded-none hover:bg-orange-600 transition-colors">
            EXPLORE MENU
          </button>
        </div>
        <div className="relative">
          <img src="/masoob.webp" alt="Featured Dish" className="w-full h-[500px] object-cover shadow-2xl" />
          <div className="absolute -bottom-6 -left-6 bg-white p-6 shadow-xl hidden md:block">
            <p className="font-bold text-xl text-black">Royal Masoub</p>
            <p className="text-gray-400 text-sm">Our Signature Dish</p>
          </div>
        </div>
      </section>

      {/* FEATURED GRID */}
      <section className="bg-gray-50 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-center text-3xl font-bold mb-16 uppercase tracking-widest">Selected Specialties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Shawarma', img: '/shaw.jpg', ar: 'شاورما' },
              { name: 'Foul Ghalaba', img: '/fool.jpg', ar: 'فول قلابة' },
              { name: 'Fresh Tamees', img: '/tamees.jpg', ar: 'تميس' }
            ].map((item) => (
              <div key={item.name} className="bg-white p-4 shadow-sm hover:shadow-xl transition-shadow">
                <img src={item.img} alt={item.name} className="w-full h-72 object-cover mb-6" />
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xl">{item.name}</h4>
                  <span className="text-orange-600 font-bold">{item.ar}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}