export default function Footer() {
    return (
        <>
        {/* Footer */}
        <footer className="bg-white text-gray-600 py-10 mt-16 border-t border-gray-200">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-extrabold mb-3">FoodHub</h3>
                <p>Delicious food delivered to your doorstep.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="hover:underline">Menu</a></li>
                  <li><a href="#" className="hover:underline">About Us</a></li>
                  <li><a href="#" className="hover:underline">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-1">
                  <li><a href="#" className="hover:underline">Help Center</a></li>
                  <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                  <li><a href="#" className="hover:underline">Terms of Service</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contact</h4>
                <ul className="space-y-1">
                  <li>📧 info@foodhub.com</li>
                  <li>📞 +1 (555) 123-4567</li>
                  <li>📍 123 Food Street, Cuisine City</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-400 text-sm">
              <p>&copy; 2024 FoodHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
    </>    
    );
}