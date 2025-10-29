import { Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FaTiktok } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-8">
      <div className="max-w-screen-xl mx-auto px-5 lg:px-14 2xl:px-28">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/login" className="inline-block mb-4">
              <Image
                width={150}
                height={25}
                className="h-auto w-[150px]"
                src="/site/logos/logo1.png"
                alt="Logo"
              />
            </Link>
            <p className="text-gray-300 text-sm">
              Join Paymefans for exclusive content and direct access to your
              favorite creators. Sign up now!
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="/s/about-us"
                  className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/s/privacy-policy"
                  className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/s/terms-and-conditions"
                  className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link
                href="https://twitter.com/paymefans"
                target="_blank"
                className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
              >
                <Twitter className="w-6 h-6" />
              </Link>
              <Link
                target="_blank"
                href="https://instagram.com/paymefans"
                className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
              >
                <Instagram className="w-6 h-6" />
              </Link>
              <Link
                href="https://www.youtube.com/@paymefans"
                target="_blank"
                className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
              >
                <Youtube className="w-6 h-6" />
              </Link>
              <Link
                href="https://tiktok.com/@paymefans"
                target="_blank"
                className="text-gray-300 hover:text-primary-dark-pink transition-colors duration-200"
              >
                <FaTiktok className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} Paymefans. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
