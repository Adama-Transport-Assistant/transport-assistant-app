

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-400 py-4 mt-auto border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
                <div className="text-sm">© {new Date().getFullYear()} Smart Transport — All rights reserved.</div>
                <div className="flex items-center gap-4 text-sm">
                    <a href="#" className="hover:text-white">Privacy</a>
                    <a href="#" className="hover:text-white">Terms</a>
                    <a href="#" className="hover:text-white">Contact</a>
                </div>
            </div>
        </footer>
    );
}
