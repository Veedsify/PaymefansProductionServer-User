"use client"
import {Send, X} from "lucide-react";
import {useState} from "react";

const ContactSupportModal = () => {
    const [show, setShow] = useState(false);


    return (
        <>
            <button
                onClick={() => setShow(true)}
                className="px-4 py-2 bg-white text-sm text-primary-text-dark-pink rounded-lg shadow hover:bg-gray-100 font-semibold">
                Contact Support
            </button>
            <div
                onClick={() => setShow(false)}
                className={`${show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"} duration-300 fixed inset min-h-screen bg-black bg-opacity-50 w-full left-0 top-0 z-50 cursor-pointer flex items-center justify-center`}>
                <div className="bg-white p-4 md:p-8 m-1 rounded-xl md:min-w-[500px] relative">
                    <span
                        onClick={() => setShow(false)}
                        className={'absolute right-4 -ml-2 top-4'}>
                        <X className={'text-black dark:text-black'} size={30}/>
                    </span>
                    <div
                        className="bg-white dark:bg-gray-900 max-h-[600px] md:max-h-[100%] overflow-auto cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="py-4 md:py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
                            <h2 className="mb-4 text-2xl lg:text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">Contact
                                Us</h2>
                            <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 text-sm sm:text-xl">Got
                                a technical issue? Want to send feedback about a beta feature? Need details about our
                                Business plan? Let us know.</p>
                            <form action="#" className="space-y-8">
                                <div>
                                    <label htmlFor="email"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Your
                                        email</label>
                                    <input type="email" id="email"
                                           className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-4 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                           placeholder="name@flowbite.com" required/>
                                </div>
                                <div>
                                    <label htmlFor="subject"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Subject</label>
                                    <input type="text" id="subject"
                                           className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
                                           placeholder="Let us know how we can help you" required/>
                                </div>
                                <div className="sm:col-span-2">
                                    <label htmlFor="message"
                                           className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Your
                                        message</label>
                                    <textarea id="message" rows="6"
                                              className="block p-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                              placeholder="Leave a comment..."></textarea>
                                </div>
                                <button type="submit"
                                        className="py-4 px-6 text-sm font-medium text-center text-white rounded-lg bg-primary-dark-pink flex items-center gap-2 hover:bg-primary-text-dark-pink">
                                    <Send size={20}/>
                                    Send
                                    message
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContactSupportModal;